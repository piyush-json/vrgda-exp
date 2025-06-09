import { Outlet } from 'react-router'
import { Navigation } from '~/components/navigation'


export default function Layout() {
  return (
    <div
      className='min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
      id='3aile9'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' id='scp4bf'>
        <Navigation />

        <main className='py-8' id='e5racl'>
          <Outlet />
        </main>
        <footer
          className='py-6 border-t border-gray-200 dark:border-gray-800'
          id='u701wj'
        >
          <div className='flex justify-between items-center' id='y2kid1'>
            <p className='text-sm text-gray-500 dark:text-gray-400' id='v6a3gp'>
              © {new Date().getFullYear()} Kairos
            </p>
            {/* <ThemeToggle id='86vu9a' /> */}
          </div>
        </footer>
      </div>
    </div>
  )
}
