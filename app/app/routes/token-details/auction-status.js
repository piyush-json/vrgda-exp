"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionStatus = AuctionStatus;
const alert_1 = require("~/components/ui/alert");
const lucide_react_1 = require("lucide-react");
function AuctionStatus({ isAuctionActive }) {
    if (isAuctionActive) {
        return (<alert_1.Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
        <lucide_react_1.InfoIcon className='h-4 w-4 text-blue-600 dark:text-blue-500'/>
        <alert_1.AlertTitle className='text-blue-800 dark:text-blue-500'>
          Active Auction
        </alert_1.AlertTitle>
        <alert_1.AlertDescription className='text-blue-700 dark:text-blue-400'>
          This token is currently being distributed through a VRGDA auction. Price decreases over time until all tokens are sold.
        </alert_1.AlertDescription>
      </alert_1.Alert>);
    }
    return (<alert_1.Alert className='bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'>
      <lucide_react_1.AlertTriangleIcon className='h-4 w-4 text-gray-600 dark:text-gray-500'/>
      <alert_1.AlertTitle className='text-gray-800 dark:text-gray-500'>
        Auction Ended
      </alert_1.AlertTitle>
      <alert_1.AlertDescription className='text-gray-700 dark:text-gray-400'>
        The VRGDA auction for this token has ended. No more tokens can be purchased.
      </alert_1.AlertDescription>
    </alert_1.Alert>);
}
