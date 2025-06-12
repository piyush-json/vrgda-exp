import React from 'react'
import { Button } from '~/components/ui/button'
import { SunIcon, MoonIcon } from 'lucide-react'
import { useTheme } from '~/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleTheme}
      className='rounded-full'
      aria-label='Toggle theme'
      id='dan7ak'
    >
      {theme === 'light' ? (
        <MoonIcon className='h-5 w-5' id='lrdi62' />
      ) : (
        <SunIcon className='h-5 w-5' id='8l3mm6' />
      )}
    </Button>
  )
}
