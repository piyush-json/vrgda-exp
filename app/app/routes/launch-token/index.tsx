import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card } from '~/components/ui/card'
import { TokenInfo } from './token-info'
import { AuctionSetup } from './auction-setup'
import { SuccessStep } from './success'
import { useVRGDA } from '~/hooks/use-vrgda'
import { CheckIcon, AlertCircle } from 'lucide-react'
import { Keypair } from '@solana/web3.js'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'

interface FormData {
  name: string
  symbol: string
  description: string
  initialSupply: string
  targetPrice: string
  priceDecayPercent: string
  r: string
  logo: File | null
  website: string
  twitter: string
  telegram: string
  tokenValuation: string
  auctionDurationDays: string
  reservePrice: string
  mint: string
  txUrl: string
}

interface ValidationErrors {
  [key: string]: string
}

const STORAGE_KEY = 'launch-token-form-data'

export default function LaunchToken() {
  const [step, setStep] = useState(1)
  const { initializeVRGDA, calculatePrice, isLoading } = useVRGDA()
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [formData, setFormData] = useState<FormData>(() => {
    // Load saved form data from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setHasUnsavedChanges(true)
          return { ...getDefaultFormData(), ...parsed, logo: null } // Don't restore file
        } catch (error) {
          console.warn('Failed to parse saved form data:', error)
        }
      }
    }
    return getDefaultFormData()
  })

  function getDefaultFormData(): FormData {
    return {
      name: '',
      symbol: '',
      description: '',
      initialSupply: '1000000000',
      targetPrice: '0.4',
      priceDecayPercent: '5',
      r: '1',
      logo: null,
      website: '',
      twitter: '',
      telegram: '',
      tokenValuation: '400000000',
      auctionDurationDays: '7',
      reservePrice: '0.0001',
      mint: '',
      txUrl: ''
    }
  }

  // Save form data to localStorage
  useEffect(() => {
    if (step < 3 && hasUnsavedChanges) {
      const dataToSave = { ...formData, logo: null } // Don't save file objects
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    }
  }, [formData, step, hasUnsavedChanges])

  // Auto-calculate target price
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

  // Debounced price curve generation
  const [priceData, setPriceData] = useState<any[]>([])

  const generatePriceCurveData = useCallback(() => {
    const data = []
    const hours = 5
    // const days = parseInt(formData.auctionDurationDays) || 7
    const targetPrice = parseFloat(formData.targetPrice)
    const decayConstant = parseFloat(formData.priceDecayPercent) / 100
    const r = parseFloat(formData.r)
    const reservePrice = parseFloat(formData.reservePrice)

    if (isNaN(targetPrice) || isNaN(decayConstant) || isNaN(r)) {
      setPriceData([])
      return
    }

    for (let i = 0; i <= hours; i++) {
      const timeElapsed = i * 60
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
        hours: i,
        price: Math.max(price, reservePrice)
      })
    }

    setPriceData(data)
  }, [
    formData.targetPrice,
    formData.priceDecayPercent,
    formData.r,
    formData.auctionDurationDays,
    formData.reservePrice,
    calculatePrice
  ])

  useEffect(() => {
    const timeoutId = setTimeout(generatePriceCurveData, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [generatePriceCurveData])

  // Validation functions
  const validateStep1 = (): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'Token name is required'
    } else if (formData.name.length > 50) {
      errors.name = 'Token name must be 50 characters or less'
    }

    if (!formData.symbol.trim()) {
      errors.symbol = 'Token symbol is required'
    } else if (!/^[A-Za-z0-9]+$/.test(formData.symbol)) {
      errors.symbol = 'Symbol can only contain letters and numbers'
    } else if (formData.symbol.length > 10) {
      errors.symbol = 'Symbol must be 10 characters or less'
    }

    const supply = parseFloat(formData.initialSupply)
    if (isNaN(supply) || supply <= 0) {
      errors.initialSupply = 'Initial supply must be a positive number'
    } else if (supply > 1e15) {
      errors.initialSupply = 'Initial supply is too large'
    }

    return errors
  }

  const validateStep2 = (): ValidationErrors => {
    const errors: ValidationErrors = {}

    const valuation = parseFloat(formData.tokenValuation)
    if (isNaN(valuation) || valuation <= 0) {
      errors.tokenValuation = 'Token valuation must be a positive number'
    }

    const decayPercent = parseFloat(formData.priceDecayPercent)
    if (isNaN(decayPercent) || decayPercent <= 0 || decayPercent > 100) {
      errors.priceDecayPercent = 'Decay rate must be between 0 and 100'
    }

    const r = parseFloat(formData.r)
    if (isNaN(r) || r <= 0) {
      errors.r = 'Time scale parameter must be positive'
    }

    const duration = parseInt(formData.auctionDurationDays)
    if (isNaN(duration) || duration < 1 || duration > 365) {
      errors.auctionDurationDays = 'Duration must be between 1 and 365 days'
    }

    const reservePrice = parseFloat(formData.reservePrice)
    if (isNaN(reservePrice) || reservePrice < 0) {
      errors.reservePrice = 'Reserve price must be non-negative'
    }

    // Validate URLs if provided
    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = 'Please enter a valid URL'
    }
    if (formData.twitter && !isValidUrl(formData.twitter)) {
      errors.twitter = 'Please enter a valid URL'
    }
    if (formData.telegram && !isValidUrl(formData.telegram)) {
      errors.telegram = 'Please enter a valid URL'
    }

    return errors
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setHasUnsavedChanges(true)

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be smaller than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      setFormData((prev) => ({ ...prev, logo: file }))
      setHasUnsavedChanges(true)
    }
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0].toString() }))
    setHasUnsavedChanges(true)
  }

  const handleNextStep = () => {
    const errors = step === 1 ? validateStep1() : validateStep2()

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Please fix the errors before continuing')
      return
    }

    setValidationErrors({})
    setStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setStep((prev) => prev - 1)
  }

  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData())
    setValidationErrors({})
    setHasUnsavedChanges(false)
    setPriceData([])
    setStep(1)

    localStorage.removeItem(STORAGE_KEY)

    toast.success('Form reset! Ready to launch another token.')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Final validation
    const errors = { ...validateStep1(), ...validateStep2() }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Please fix all errors before launching')
      return
    }

    try {
      const decayConstant = parseFloat(formData.priceDecayPercent) / 100
      const totalSupply = parseFloat(formData.initialSupply)
      const r = parseFloat(formData.r)

      const mintPair = new Keypair()
      const params = {
        targetPrice: parseFloat(formData.targetPrice),
        decayConstant,
        totalSupply,
        r,
        mint: mintPair,
        decimals: 6,
        auctionDurationDays: parseInt(formData.auctionDurationDays),
        reservePrice: parseFloat(formData.reservePrice),
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        logo: formData.logo,
      }

      toast.loading('Uploading metadata and creating token...', { id: 'launch-token' })

      const result = await initializeVRGDA(params)

      toast.success('Token launched successfully!', { id: 'launch-token' })

      setFormData((prev) => ({
        ...prev,
        mint: result.vrgda,
        txUrl: result.txUrl || `https://explorer.solana.com/tx/${result.signature}?cluster=localnet`
      }))

      // Clear saved form data on success
      localStorage.removeItem(STORAGE_KEY)
      setHasUnsavedChanges(false)

      setStep(3)
    } catch (error: any) {
      console.error('Error launching token:', error)
      toast.error(
        `Failed to launch token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { id: 'launch-token' }
      )
    }
  }

  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEY)
    setFormData(getDefaultFormData())
    setHasUnsavedChanges(false)
    toast.success('Form data cleared')
  }

  const canProceed = useMemo(() => {
    if (step === 1) {
      const errors = validateStep1()
      return Object.keys(errors).length === 0
    }
    if (step === 2) {
      const errors = validateStep2()
      return Object.keys(errors).length === 0
    }
    return true
  }, [step, formData])

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-8 text-center'>
        <h1 className='text-3xl font-bold mb-2'>
          Launch Your Token on Solana
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Create and deploy your own token with VRGDA (Variable Rate Gradual Dutch Auction)
        </p>
      </div>

      {hasUnsavedChanges && step < 3 && (
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            You have unsaved progress. Your data is automatically saved locally.{' '}
            <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400" onClick={clearSavedData}>
              Clear saved data
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className='mb-8'>
        <div className='flex justify-between items-center'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex flex-col items-center'>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${step >= i
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
          <div className='absolute top-0 left-[5%] right-[5%] h-1 bg-gray-200 dark:bg-gray-700'></div>
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
            validationErrors={validationErrors}
            handleInputChange={handleInputChange}
            handleFileChange={handleFileChange}
            handleNextStep={handleNextStep}
            canProceed={canProceed}
          />
        )}

        {step === 2 && (
          <AuctionSetup
            formData={formData}
            priceData={priceData}
            validationErrors={validationErrors}
            handleInputChange={handleInputChange}
            handleSliderChange={handleSliderChange}
            handlePrevStep={handlePrevStep}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            canProceed={canProceed}
          />
        )}

        {step === 3 && (
          <SuccessStep
            formData={formData}
            onLaunchAnother={resetForm}
          />
        )}
      </Card>
    </div>
  )
}