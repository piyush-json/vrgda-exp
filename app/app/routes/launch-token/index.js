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
exports.default = LaunchToken;
const react_1 = __importStar(require("react"));
const card_1 = require("~/components/ui/card");
const token_info_1 = require("./token-info");
const auction_setup_1 = require("./auction-setup");
const success_1 = require("./success");
const use_vrgda_1 = require("~/hooks/use-vrgda");
const lucide_react_1 = require("lucide-react");
const web3_js_1 = require("@solana/web3.js");
const sonner_1 = require("sonner");
function LaunchToken() {
    const [step, setStep] = (0, react_1.useState)(1);
    const { initializeVRGDA, calculatePrice, isLoading } = (0, use_vrgda_1.useVRGDA)();
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        symbol: '',
        description: '',
        initialSupply: '1000000000000000',
        targetPrice: '4',
        priceDecayPercent: '5',
        r: '1000000',
        logo: null,
        website: '',
        twitter: '',
        telegram: '',
        tokenValuation: '4000000000000000',
        auctionDurationDays: '7',
        reservePrice: '0.0001',
        mint: '',
        txUrl: ''
    });
    const [priceData, setPriceData] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        const supply = parseFloat(formData.initialSupply);
        const valuation = parseFloat(formData.tokenValuation);
        if (!isNaN(supply) && !isNaN(valuation) && supply > 0) {
            const pricePerToken = valuation / supply;
            setFormData((prev) => (Object.assign(Object.assign({}, prev), { targetPrice: pricePerToken.toFixed(9) })));
        }
    }, [formData.tokenValuation, formData.initialSupply]);
    (0, react_1.useEffect)(() => {
        generatePriceCurveData();
    }, [
        formData.targetPrice,
        formData.priceDecayPercent,
        formData.r,
        formData.auctionDurationDays
    ]);
    const generatePriceCurveData = () => {
        const data = [];
        const days = parseInt(formData.auctionDurationDays) || 7;
        const targetPrice = parseFloat(formData.targetPrice);
        const decayConstant = parseFloat(formData.priceDecayPercent) / 100;
        const r = parseFloat(formData.r);
        const reservePrice = parseFloat(formData.reservePrice);
        for (let i = 0; i <= days; i++) {
            const timeElapsed = i;
            const tokensSold = 0;
            const price = calculatePrice({
                timePassed: timeElapsed,
                tokensSold,
                targetPrice,
                decayConstant,
                r,
                reservePrice
            });
            data.push({
                day: i,
                price: Math.max(price, parseFloat(formData.reservePrice))
            });
        }
        setPriceData(data);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => (Object.assign(Object.assign({}, prev), { [name]: value })));
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => { var _a; return (Object.assign(Object.assign({}, prev), { logo: ((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) || null })); });
        }
    };
    const handleSliderChange = (name, value) => {
        setFormData((prev) => (Object.assign(Object.assign({}, prev), { [name]: value[0].toString() })));
        if (name === 'priceDecayPercent') {
            const decayConstant = (value[0] * 10000).toString();
            setFormData((prev) => (Object.assign(Object.assign({}, prev), { decayConstant })));
        }
    };
    const handleNextStep = () => {
        setStep((prev) => prev + 1);
    };
    const handlePrevStep = () => {
        setStep((prev) => prev - 1);
    };
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        try {
            const decayConstant = parseInt(formData.priceDecayPercent) / 100;
            const totalSupply = parseFloat(formData.initialSupply);
            const r = Math.floor(parseFloat(formData.r) * 100) / 100;
            const mintPair = new web3_js_1.Keypair();
            const params = {
                targetPrice: parseFloat(formData.targetPrice),
                decayConstant,
                totalSupply,
                r,
                mint: mintPair,
                decimals: 9,
                auctionDurationDays: parseInt(formData.auctionDurationDays),
                reservePrice: parseFloat(formData.reservePrice),
                name: formData.name,
                symbol: formData.symbol,
                uri: formData.logo ? URL.createObjectURL(formData.logo) : "https://arweave.net/example-token-metadata-uri",
            };
            console.log('Launching token with params:', params);
            const { vrgda } = yield initializeVRGDA(params);
            console.log('Token launched successfully:', vrgda);
            setFormData((prev) => (Object.assign(Object.assign({}, prev), { mint: vrgda })));
            setStep(3);
        }
        catch (error) {
            console.error('Error launching token:', error);
            sonner_1.toast.error(`Failed to launch token: ${error instanceof Error ? error.message : 'Unknown error(check console for details)'}`);
        }
    });
    return (<div className='max-w-2xl mx-auto'>
      <div className='mb-8 text-center'>
        <h1 className='text-3xl font-bold mb-2'>
          Launch Your Token on Solana
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Create and deploy your own token with VRGDA (Variable Rate Gradual
          Dutch Auction)
        </p>
      </div>

      <div className='mb-8'>
        <div className='flex justify-between items-center'>
          {[1, 2, 3].map((i, index) => (<div key={i} className='flex flex-col items-center'>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= i
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {step > i ? (<lucide_react_1.CheckIcon className='h-5 w-5'/>) : (i)}
              </div>
              <span className='text-sm mt-2'>
                {i === 1 ? 'Token Info' : i === 2 ? 'Auction Setup' : 'Launch'}
              </span>
            </div>))}
        </div>
        <div className='relative mt-2'>
          <div className='absolute top-0 left-[5%] right-[5%] h-1 bg-gray-200 dark:bg-gray-700'></div>
          <div className='absolute top-0 left-[5%] h-1 bg-purple-600 transition-all duration-300' style={{ width: `${(step - 1) * 45}%` }}></div>
        </div>
      </div>

      <card_1.Card>
        {step === 1 && (<token_info_1.TokenInfo formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} handleNextStep={handleNextStep}/>)}

        {step === 2 && (<auction_setup_1.AuctionSetup formData={formData} priceData={priceData} handleInputChange={handleInputChange} handleSliderChange={handleSliderChange} handlePrevStep={handlePrevStep} handleSubmit={handleSubmit} isLoading={isLoading}/>)}

        {step === 3 && <success_1.SuccessStep formData={formData}/>}
      </card_1.Card>
    </div>);
}
