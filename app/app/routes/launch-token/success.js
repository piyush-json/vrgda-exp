"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessStep = SuccessStep;
const card_1 = require("~/components/ui/card");
const alert_1 = require("~/components/ui/alert");
const button_1 = require("~/components/ui/button");
const lucide_react_1 = require("lucide-react");
const react_router_1 = require("react-router");
function SuccessStep({ formData }) {
    const navigate = (0, react_router_1.useNavigate)();
    return (<>
      <card_1.CardHeader className='text-center'>
        <div className='mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4'>
          <lucide_react_1.CheckIcon className='h-8 w-8 text-green-600 dark:text-green-400'/>
        </div>
        <card_1.CardTitle className='text-2xl'>Token Successfully Launched!</card_1.CardTitle>
        <card_1.CardDescription>
          Your VRGDA token auction has been created and deployed on the Solana
          blockchain
        </card_1.CardDescription>
      </card_1.CardHeader>

      <card_1.CardContent className='space-y-6'>
        <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Token Name
              </p>
              <p className='font-medium'>{formData.name}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Token Symbol
              </p>
              <p className='font-medium'>{formData.symbol}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Initial Supply
              </p>
              <p className='font-medium'>
                {parseInt(formData.initialSupply).toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Target Price
              </p>
              <p className='font-medium'>{formData.targetPrice} SOL</p>
            </div>
            <div className='col-span-2'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Transaction
              </p>
              <a href={formData.txUrl} target='_blank' rel='noopener noreferrer' className='font-medium text-blue-600 dark:text-blue-400 hover:underline'>
                View on Solana Explorer
              </a>
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <h3 className='font-medium'>Next Steps</h3>
          <ul className='space-y-2'>
            <li className='flex items-start'>
              <div className='mr-2 mt-0.5 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400'>
                1
              </div>
              <span>Share your auction link with your community</span>
            </li>
            <li className='flex items-start'>
              <div className='mr-2 mt-0.5 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400'>
                2
              </div>
              <span>Monitor your auction's progress in real-time</span>
            </li>
            <li className='flex items-start'>
              <div className='mr-2 mt-0.5 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400'>
                3
              </div>
              <span>After the auction ends, claim your proceeds</span>
            </li>
          </ul>
        </div>

        <alert_1.Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
          <lucide_react_1.InfoIcon className='h-4 w-4 text-blue-600 dark:text-blue-500'/>
          <alert_1.AlertTitle className='text-blue-800 dark:text-blue-500'>Tip</alert_1.AlertTitle>
          <alert_1.AlertDescription className='text-blue-700 dark:text-blue-400'>
            Save your token address and auction details. You'll need these to
            manage your auction and claim proceeds.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      </card_1.CardContent>

      <card_1.CardFooter className='flex justify-center'>
        <button_1.Button onClick={() => {
            navigate(`/token/${formData.mint}`, { replace: true });
        }}>Go to Token Dashboard</button_1.Button>
      </card_1.CardFooter>
    </>);
}
