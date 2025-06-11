"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.links = void 0;
exports.Layout = Layout;
exports.default = App;
exports.ErrorBoundary = ErrorBoundary;
require("./lib/buffer-polyfill");
const react_router_1 = require("react-router");
require("./app.css");
const sonner_1 = require("./components/ui/sonner");
const cluster_data_access_1 = require("./components/cluster/cluster-data-access");
const solana_provider_1 = require("./components/solana/solana-provider");
const react_query_provider_1 = require("./hooks/react-query-provider");
const links = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous'
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
    }
];
exports.links = links;
function Layout({ children }) {
    return (<html lang='en'>
      <head>
        <meta charSet='utf-8'/>
        <meta name='viewport' content='width=device-width, initial-scale=1'/>
        <react_router_1.Meta />
        <react_router_1.Links />
      </head>
      <body>
        <react_query_provider_1.ReactQueryProvider>
          <cluster_data_access_1.ClusterProvider>
            <solana_provider_1.SolanaProvider>{children}</solana_provider_1.SolanaProvider>
          </cluster_data_access_1.ClusterProvider>
        </react_query_provider_1.ReactQueryProvider>
        <sonner_1.Toaster />
        <react_router_1.ScrollRestoration />
        <react_router_1.Scripts />
      </body>
    </html>);
}
function App() {
    return <react_router_1.Outlet />;
}
function ErrorBoundary({ error }) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack;
    if ((0, react_router_1.isRouteErrorResponse)(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details =
            error.status === 404
                ? 'The requested page could not be found.'
                : error.statusText || details;
        // @ts-ignore
    }
    else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }
    return (<main className='pt-16 p-4 container mx-auto'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (<pre className='w-full p-4 overflow-x-auto'>
          <code>{stack}</code>
        </pre>)}
    </main>);
}
