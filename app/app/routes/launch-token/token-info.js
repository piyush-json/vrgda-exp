"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenInfo = TokenInfo;
const react_1 = __importDefault(require("react"));
const card_1 = require("~/components/ui/card");
const input_1 = require("~/components/ui/input");
const button_1 = require("~/components/ui/button");
const textarea_1 = require("~/components/ui/textarea");
const label_1 = require("~/components/ui/label");
const tooltip_1 = require("~/components/ui/tooltip");
const lucide_react_1 = require("lucide-react");
function TokenInfo({ formData, handleInputChange, handleFileChange, handleNextStep }) {
    return (<>
      <card_1.CardHeader>
        <card_1.CardTitle>Token Information</card_1.CardTitle>
        <card_1.CardDescription>Enter the basic details about your token</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className='space-y-6'>
        <div className='space-y-2'>
          <label_1.Label htmlFor='name'>Token Name</label_1.Label>
          <input_1.Input id='name' name='name' placeholder='e.g., Solana Gold' value={formData.name} onChange={handleInputChange}/>
        </div>

        <div className='space-y-2'>
          <label_1.Label htmlFor='symbol'>Token Symbol</label_1.Label>
          <input_1.Input id='symbol' name='symbol' placeholder='e.g., SGLD' value={formData.symbol} onChange={handleInputChange} maxLength={10}/>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Maximum 10 characters, no spaces
          </p>
        </div>

        <div className='space-y-2'>
          <label_1.Label htmlFor='description'>Description</label_1.Label>
          <textarea_1.Textarea id='description' name='description' placeholder='Describe your token and its purpose...' value={formData.description} onChange={handleInputChange} rows={3}/>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center'>
            <label_1.Label htmlFor='initialSupply'>Initial Supply</label_1.Label>
            <tooltip_1.TooltipProvider>
              <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                  <lucide_react_1.HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400'/>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipContent>
                  <p className='w-80'>
                    The total number of tokens that will be created. This is the maximum supply of your token.
                  </p>
                </tooltip_1.TooltipContent>
              </tooltip_1.Tooltip>
            </tooltip_1.TooltipProvider>
          </div>
          <input_1.Input id='initialSupply' name='initialSupply' type='number' placeholder='e.g., 1000000000' value={formData.initialSupply} onChange={handleInputChange}/>
        </div>

        <div className='space-y-2'>
          <label_1.Label htmlFor='logo'>Token Logo</label_1.Label>
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700'>
              {formData.logo ? (<img src={URL.createObjectURL(formData.logo)} alt='Token logo preview' className='w-full h-full object-cover'/>) : (<lucide_react_1.UploadIcon className='h-6 w-6 text-gray-400'/>)}
            </div>
            <div className='flex-1'>
              <input_1.Input id='logo' type='file' accept='image/*' onChange={handleFileChange} className='hidden'/>
              <button_1.Button variant='outline' onClick={() => { var _a; return (_a = document.getElementById('logo')) === null || _a === void 0 ? void 0 : _a.click(); }} className='w-full'>
                <lucide_react_1.UploadIcon className='h-4 w-4 mr-2'/>
                Upload Logo
              </button_1.Button>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                PNG, JPG or SVG, 1:1 ratio recommended
              </p>
            </div>
          </div>
        </div>
      </card_1.CardContent>
      <card_1.CardFooter className='flex justify-end'>
        <button_1.Button onClick={handleNextStep}>Continue</button_1.Button>
      </card_1.CardFooter>
    </>);
}
