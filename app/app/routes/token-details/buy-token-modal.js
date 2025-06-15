"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyTokenModal = BuyTokenModal;
const react_1 = __importStar(require("react"));
const dialog_1 = require("~/components/ui/dialog");
const button_1 = require("~/components/ui/button");
const input_1 = require("~/components/ui/input");
const label_1 = require("~/components/ui/label");
const sonner_1 = require("sonner");
const solana_provider_1 = require("~/components/solana/solana-provider");
const use_vrgda_1 = require("~/hooks/use-vrgda");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
function BuyTokenModal({ isOpen, onClose, tokenName, tokenSymbol, tokenLogo, currentPrice, buyAmount, setBuyAmount, mintInfo, onBuy, buyStatus, mintAddress }) {
    const { connected, publicKey } = (0, wallet_adapter_react_1.useWallet)();
    const provider = (0, solana_provider_1.useAnchorProvider)();
    const { calculatePrice, isLoading } = (0, use_vrgda_1.useVRGDA)();
    const [fee, setFee] = (0, react_1.useState)('standard');
    // Calculate total cost
    const tokenAmount = parseFloat(buyAmount) || 0;
    const currentTotalAmount = Array.from({ length: parseInt(buyAmount) || 0 }, (_, i) => i + 1)
        .reduce((total, amount) => total + calculatePrice({
        targetPrice: mintInfo.targetPrice,
        decayConstant: mintInfo.decayConstant,
        r: mintInfo.r,
        timePassed: 0,
        tokensSold: mintInfo.tokensSold + amount,
        reservePrice: mintInfo.reservePrice
    }), 0);
    const subtotal = parseFloat(currentTotalAmount.toFixed(6));
    const total = subtotal;
    // Format numbers for display
    const formatNumber = (num, decimals = 6) => {
        if (num < 0.000001)
            return num.toExponential(2);
        return num.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals
        });
    };
    const handleBuy = () => __awaiter(this, void 0, void 0, function* () {
        if (!connected || !provider) {
            sonner_1.toast.error('Wallet not connected', {
                description: 'Please connect your wallet to continue.'
            });
            return;
        }
        if (tokenAmount <= 0) {
            sonner_1.toast.error('Invalid amount', {
                description: 'Please enter a valid token amount.'
            });
            return;
        }
        if (!publicKey) {
            sonner_1.toast.error('WSOL mint not found', {
                description: 'Please check your wallet settings.'
            });
            return;
        }
        yield onBuy(tokenAmount);
    });
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className='sm:max-w-[425px]'>
        <dialog_1.DialogHeader>
          <div className='flex items-center gap-3'>
            {tokenLogo && (<img src={tokenLogo} alt={tokenName} className='w-8 h-8 rounded-full'/>)}
            <dialog_1.DialogTitle>Buy {tokenName}</dialog_1.DialogTitle>
          </div>
          <dialog_1.DialogDescription>
            Current price: {formatNumber(currentPrice)} SOL per {tokenSymbol}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <label_1.Label htmlFor='amount' className='text-right'>
              Amount
            </label_1.Label>
            <div className='col-span-3 flex gap-2'>
              <input_1.Input id='amount' type='number' value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} className='col-span-2' placeholder='0.0' min='0' step='0.1'/>

              <div className='bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-2 flex items-center justify-center'>
                {tokenSymbol}
              </div>
            </div>
          </div>

          {/* <div className='grid grid-cols-4 items-center gap-4'>
          <Label htmlFor='fee' className='text-right'>
            Network Fee
          </Label>
          <Select
            value={fee}
            onValueChange={(value) =>
              setFee(value as 'standard' | 'priority')
            }
          >
            <SelectTrigger className='col-span-3'>
              <SelectValue placeholder='Select fee' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='standard'>
                Standard ({formatNumber(feeAmount, 8)} SOL)
              </SelectItem>
              <SelectItem value='priority'>
                Priority ({formatNumber(feeAmount * 2, 8)} SOL)
              </SelectItem>
            </SelectContent>
          </Select>
        </div> */}
        </div>

        <div className='mt-4 space-y-2 rounded-md bg-gray-50 dark:bg-gray-900 p-3'>
          {/* <div className='flex justify-between text-sm'>
          <span>Subtotal</span>
          <span>{formatNumber(subtotal)} SOL</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span>Network Fee</span>
          <span>{formatNumber(feeAmount, 8)} SOL</span>
        </div> */}
          <div className='border-t border-gray-200 dark:border-gray-700 my-2'></div>
          <div className='flex justify-between font-medium'>
            <span>Total</span>
            <span>{formatNumber(total)} SOL</span>
          </div>
        </div>
        {/* </DialogContent> */}
        {/* <DialogFooter> */}
        <button_1.Button variant='outline' onClick={onClose}>
          Cancel
        </button_1.Button>
        <button_1.Button onClick={handleBuy} disabled={isLoading || !connected || tokenAmount <= 0} className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
          {isLoading ? (<div className='flex items-center gap-2'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
              <span>Processing...</span>
            </div>) : (`Buy ${tokenSymbol}`)}
        </button_1.Button>
        {/* </DialogFooter> */}
      </dialog_1.DialogContent>

    </dialog_1.Dialog>);
}
