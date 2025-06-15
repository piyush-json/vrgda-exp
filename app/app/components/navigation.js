"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigation = Navigation;
const react_1 = require("react");
const solana_provider_1 = require("~/components/solana/solana-provider");
const theme_toggle_1 = require("~/components/theme-toggle");
const lucide_react_1 = require("lucide-react");
const react_router_1 = require("react-router");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const cluster_ui_1 = require("./cluster/cluster-ui");
const account_ui_1 = require("./account/account-ui");
function Navigation() {
    const location = (0, react_router_1.useLocation)();
    const navigate = (0, react_router_1.useNavigate)();
    const { connected, publicKey } = (0, wallet_adapter_react_1.useWallet)();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, react_1.useState)(false);
    const activePage = location.pathname;
    const handleNavigate = (page) => {
        navigate(page);
        setIsMobileMenuOpen(false);
    };
    const navItems = [
        { id: 'home', label: 'Home', path: '/' },
        { id: 'launch', label: 'Launch Token', path: '/launch-token' },
        { id: 'explore', label: 'Explore', path: '/explore' },
        // { id: 'wallet', label: 'Wallet', path: '/wallet' },
        // { id: 'transactions', label: 'Transactions', path: '/transactions' }
    ];
    return (<nav className='bg-background border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            <div className='flex-shrink-0 flex items-center'>
              <react_router_1.Link to='/' onClick={() => handleNavigate('home')}>
                <div className='flex items-center'>
                  <div className='h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-md flex items-center justify-center'>
                    <span className='text-white font-bold'>KR</span>
                  </div>
                  <span className='ml-2 text-xl font-bold text-foreground'>
                    Kairos
                  </span>
                </div>
              </react_router_1.Link>
            </div>
            <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
              {navItems.map((item, index) => (<react_router_1.Link key={item.id} to={item.path} onClick={() => handleNavigate(item.path)} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activePage === item.path
                ? 'border-purple-500 text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>
                  {item.label}
                </react_router_1.Link>))}
            </div>
          </div>
          <div className='hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4'>
            <theme_toggle_1.ThemeToggle />
            <cluster_ui_1.ClusterUiSelect />
            {publicKey && connected &&
            <account_ui_1.AccountBalance address={publicKey}/>}
            <solana_provider_1.WalletButton />
          </div>
          <div className='flex items-center sm:hidden'>
            <theme_toggle_1.ThemeToggle />
            <button type='button' className='inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ml-2' aria-controls='mobile-menu' aria-expanded='false' onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span className='sr-only'>Open main menu</span>
              {isMobileMenuOpen ? (<lucide_react_1.XIcon className='block h-6 w-6' aria-hidden='true'/>) : (<lucide_react_1.MenuIcon className='block h-6 w-6' aria-hidden='true'/>)}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (<div className='sm:hidden' id='mobile-menu'>
          <div className='pt-2 pb-3 space-y-1'>
            {navItems.map((item, index) => (<react_router_1.Link key={item.id} to={item.path} onClick={() => handleNavigate(item.id)} className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${activePage === item.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300'
                    : 'border-transparent text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground'}`}>
                {item.label}
              </react_router_1.Link>))}
          </div>
          <div className='pt-4 pb-3 border-t border-border'>
            <div className='flex items-center px-4'>
              <div className='flex-shrink-0'>
                <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center'>
                  <span className='text-white font-bold'>
                    {connected ? 'U' : '?'}
                  </span>
                </div>
              </div>
              <div className='ml-3'>
                <div className='text-base font-medium text-foreground'>
                  {connected ? 'Connected User' : 'Not Connected'}
                </div>
                <div className='text-sm font-medium text-muted-foreground'>
                  {connected ? 'mock...y123' : 'Connect your wallet'}
                </div>
              </div>
            </div>
            <div className='mt-3 px-2 space-y-1'>
              <div className='px-2'>
                <solana_provider_1.WalletButton />
              </div>
            </div>
          </div>
        </div>)}
    </nav>);
}
