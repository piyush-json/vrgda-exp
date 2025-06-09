import React from 'react'
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { HelpCircleIcon, UploadIcon } from 'lucide-react'

interface TokenInfoProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleNextStep: () => void
}

export function TokenInfo({
  formData,
  handleInputChange,
  handleFileChange,
  handleNextStep
}: TokenInfoProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Token Information</CardTitle>
        <CardDescription>Enter the basic details about your token</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Token Name</Label>
          <Input
            id='name'
            name='name'
            placeholder='e.g., Solana Gold'
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='symbol'>Token Symbol</Label>
          <Input
            id='symbol'
            name='symbol'
            placeholder='e.g., SGLD'
            value={formData.symbol}
            onChange={handleInputChange}
            maxLength={10}
          />
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Maximum 10 characters, no spaces
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            name='description'
            placeholder='Describe your token and its purpose...'
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <div className='flex items-center'>
            <Label htmlFor='initialSupply'>Initial Supply</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400' />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='w-80'>
                    The total number of tokens that will be created. This is the maximum supply of your token.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id='initialSupply'
            name='initialSupply'
            type='number'
            placeholder='e.g., 1000000000'
            value={formData.initialSupply}
            onChange={handleInputChange}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='logo'>Token Logo</Label>
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700'>
              {formData.logo ? (
                <img
                  src={URL.createObjectURL(formData.logo as any)}
                  alt='Token logo preview'
                  className='w-full h-full object-cover'
                />
              ) : (
                <UploadIcon className='h-6 w-6 text-gray-400' />
              )}
            </div>
            <div className='flex-1'>
              <Input
                id='logo'
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                className='hidden'
              />
              <Button
                variant='outline'
                onClick={() => document.getElementById('logo')?.click()}
                className='w-full'
              >
                <UploadIcon className='h-4 w-4 mr-2' />
                Upload Logo
              </Button>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                PNG, JPG or SVG, 1:1 ratio recommended
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex justify-end'>
        <Button onClick={handleNextStep}>Continue</Button>
      </CardFooter>
    </>
  )
}