import React, { useState, useEffect } from 'react'
import { Card } from '~/components/ui/card'
import { TokenInfo } from './token-info'
import { AuctionSetup } from './auction-setup'
import { SuccessStep } from './success'
import { useVRGDA } from '~/hooks/use-vrgda'
import { CheckIcon } from 'lucide-react'
import { Keypair, PublicKey } from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { toast } from 'sonner'


export default function LaunchToken() {
  const [step, setStep] = useState(1)
  const { initializeVRGDA, calculatePrice, isLoading } = useVRGDA()
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    initialSupply: '1000000000',
    targetPrice: '4',
    priceDecayPercent: '5',
    r: '1',
    logo: null as File | null,
    website: '',
    twitter: '',
    telegram: '',
    tokenValuation: '4000000000',
    auctionDurationDays: '7',
    reservePrice: '0.0001',
    mint: '',
    txUrl: ''
  })

  const [priceData, setPriceData] = useState<any[]>([])

  useEffect(() => {
    const supply = parseFloat(formData.initialSupply)
    const valuation = parseFloat(formData.tokenValuation)

    if (!isNaN(supply) && !isNaN(valuation) && supply > 0) {
      const pricePerToken = valuation / supply

      setFormData((prev) => ({
        ...prev,
        targetPrice: pricePerToken.toFixed(9)
      }))
    }
  }, [formData.tokenValuation, formData.initialSupply])

  useEffect(() => {
    generatePriceCurveData()
  }, [
    formData.targetPrice,
    formData.priceDecayPercent,
    formData.r,
    formData.auctionDurationDays
  ])

  const generatePriceCurveData = () => {
    const data = []
    const days = parseInt(formData.auctionDurationDays) || 7
    const targetPrice = parseFloat(formData.targetPrice)
    const decayConstant = parseFloat(formData.priceDecayPercent) / 100
    const r = parseFloat(formData.r)
    const reservePrice = parseFloat(formData.reservePrice)

    for (let i = 0; i <= days; i++) {
      const timeElapsed = i
      const tokensSold = 0

      const price = calculatePrice({
        timePassed: timeElapsed,
        tokensSold,
        targetPrice,
        decayConstant,
        r,
        reservePrice
      })

      data.push({
        day: i,
        price: Math.max(price, parseFloat(formData.reservePrice))
      })
    }

    setPriceData(data)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, logo: e.target.files?.[0] || null }))
    }
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0].toString() }))

    if (name === 'priceDecayPercent') {
      const decayConstant = (value[0] * 10000).toString()
      setFormData((prev) => ({ ...prev, decayConstant }))
    }
  }

  const handleNextStep = () => {
    setStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const decayConstant = parseInt(formData.priceDecayPercent) / 100
      const totalSupply = parseFloat(formData.initialSupply)
      const r = Math.floor(parseFloat(formData.r) * 100) / 100

      const mintPair = new Keypair()
      const params = {
        targetPrice: parseFloat(formData.targetPrice),
        decayConstant,
        totalSupply,
        r,
        mint: mintPair,
        decimals: 9,
        auctionDurationDays: parseInt(formData.auctionDurationDays),
        reservePrice: parseFloat(formData.reservePrice),
        name: formData.name,
        symbol: formData.symbol,
        uri: formData.logo ? URL.createObjectURL(formData.logo) : "https://arweave.net/example-token-metadata-uri",
      }
      console.log('Launching token with params:', params)
      const { vrgda } = await initializeVRGDA(params)
      console.log('Token launched successfully:', vrgda)
      setFormData((prev) => ({ ...prev, mint: vrgda }))
      setStep(3)
    } catch (error) {
      console.error('Error launching token:', error)
      toast.error(
        `Failed to launch token: ${error instanceof Error ? error.message : 'Unknown error(check console for details)'}`,
      )
    }
  }

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-8 text-center'>
        <h1 className='text-3xl font-bold mb-2'>
          Launch Your Token on Solana
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Create and deploy your own token with VRGDA (Variable Rate Gradual
          Dutch Auction)
        </p>
      </div>

      <div className='mb-8'>
        <div className='flex justify-between items-center'>
          {[1, 2, 3].map((i, index) => (
            <div key={i} className='flex flex-col items-center'>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= i
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
              >
                {step > i ? (
                  <CheckIcon className='h-5 w-5' />
                ) : (
                  i
                )}
              </div>
              <span className='text-sm mt-2'>
                {i === 1 ? 'Token Info' : i === 2 ? 'Auction Setup' : 'Launch'}
              </span>
            </div>
          ))}
        </div>
        <div className='relative mt-2'>
          <div
            className='absolute top-0 left-[5%] right-[5%] h-1 bg-gray-200 dark:bg-gray-700'
          ></div>
          <div
            className='absolute top-0 left-[5%] h-1 bg-purple-600 transition-all duration-300'
            style={{ width: `${(step - 1) * 45}%` }}
          ></div>
        </div>
      </div>

      <Card>
        {step === 1 && (
          <TokenInfo
            formData={formData}
            handleInputChange={handleInputChange}
            handleFileChange={handleFileChange}
            handleNextStep={handleNextStep}
          />
        )}

        {step === 2 && (
          <AuctionSetup
            formData={formData}
            priceData={priceData}
            handleInputChange={handleInputChange}
            handleSliderChange={handleSliderChange}
            handlePrevStep={handlePrevStep}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}

        {step === 3 && <SuccessStep formData={formData} />}
      </Card>
    </div>
  )
}