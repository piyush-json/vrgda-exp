import { Hono } from 'hono'
import { z } from 'zod'
import { validator } from 'hono/validator'
import { cors } from 'hono/cors'



const TokenMetadataSchema = z.object({
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(10),
  description: z.string().min(1).max(500),
  decimals: z.number().int().min(0).max(18),
  image: z.string().optional().refine((val) => {
    if (!val) return true // Optional field, allow empty
    const base64Pattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/
    return base64Pattern.test(val)
  }, {
    message: 'Image must be a valid base64 data URL with data:image/type;base64, prefix'
  }),
})

const app = new Hono<{
  Bindings: Cloudflare.Env
}>()

app.use(cors({
  origin: '*',
  allowMethods: ['POST', 'OPTIONS'],
  maxAge: 3600,
}))


const rateLimitMiddleware = async (c: any, next: any) => {
  const identifier = c.req.header('cf-connecting-ip') || 'unknown'
  try {
    const rateLimitKey = `upload:${identifier}`
    const rateLimitResult = await c.env.RATE_LIMITER.limit({ key: rateLimitKey })

    if (!rateLimitResult.success) {
      return c.json({
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter
      }, 429)
    }
    await next()
  } catch (error) {
    console.error('Rate limiting error:', error)
    await next()
  }
}


app.post('/upload/uri',
  rateLimitMiddleware,
  validator('json', (value, c) => {
    const parsed = TokenMetadataSchema.safeParse(value)
    if (!parsed.success) {
      return c.json({ error: 'Invalid token metadata', details: parsed.error.errors }, 400)
    }
    return parsed.data
  }),
  async (c) => {
    try {
      const validatedMetadata = c.req.valid('json')
      const key = `token_metadata_${Date.now()}_${Math.random().toString(36).substring(7)}`

      const publicBucketUrl = c.env.PUBLIC_BUCKET_URL || 'https://your-bucket.r2.dev'

      let processedImageUrl = ''
      let imageType = 'jpeg'
      if (validatedMetadata.image) {
        try {
          const imageBase64 = validatedMetadata.image
          const base64Data = imageBase64.replace(/^data:image\/([a-zA-Z]+);base64,/, '')
          imageType = imageBase64.match(/^data:image\/([a-zA-Z]+);base64,/)?.[1] || 'jpeg'

          const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
          const imageKey = `images/${key}.${imageType}`

          await c.env.BUCKET.put(imageKey, imageBuffer, {
            httpMetadata: {
              contentType: `image/${imageType}`
            }
          })

          processedImageUrl = `${publicBucketUrl}/${imageKey}`
        } catch (imageError) {
          console.error('Failed to process base64 image:', imageError)
          return c.json({ error: 'Image processing failed' }, 500)
        }
      }

      const updatedMetadata = {
        name: validatedMetadata.name,
        symbol: validatedMetadata.symbol,
        description: validatedMetadata.description,
        image: processedImageUrl,
        decimals: validatedMetadata.decimals,
        properties: {
          category: 'token',
          files: [{
            uri: processedImageUrl,
            type: `image/${imageType}`
          }]
        }
      }

      const metadataKey = `${key}.json`
      await c.env.BUCKET.put(metadataKey, JSON.stringify(updatedMetadata, null, 2), {
        httpMetadata: {
          contentType: 'application/json'
        }
      })

      return c.json({
        success: true,
        uri: `${publicBucketUrl}/${metadataKey}`,
        message: 'Token metadata uploaded successfully',
        imageUrl: processedImageUrl
      })
    } catch (error) {
      console.error('Upload error:', error)
      return c.json({ error: 'Upload failed' }, 500)
    }
  }
)

export default app
