import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useTheme } from '~/hooks/use-theme'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)'
        } as React.CSSProperties
      }
      duration={5000}
      {...props}
    />
  )
}

export { Toaster }
