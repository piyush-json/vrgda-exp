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
exports.WalletButton = void 0;
exports.SolanaProvider = SolanaProvider;
exports.useAnchorProvider = useAnchorProvider;
const anchor_1 = require("@coral-xyz/anchor");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const wallet_adapter_react_ui_1 = require("@solana/wallet-adapter-react-ui");
require("@solana/wallet-adapter-react-ui/styles.css");
const react_1 = require("react");
const cluster_data_access_1 = require("../cluster/cluster-data-access");
const wallet_adapter_wallets_1 = require("@solana/wallet-adapter-wallets");
exports.WalletButton = (0, react_1.lazy)(() => __awaiter(void 0, void 0, void 0, function* () {
    return ({
        default: (yield Promise.resolve().then(() => __importStar(require('@solana/wallet-adapter-react-ui')))).WalletMultiButton
    });
}));
function SolanaProvider({ children }) {
    const { cluster } = (0, cluster_data_access_1.useCluster)();
    const endpoint = (0, react_1.useMemo)(() => cluster.endpoint, [cluster]);
    const onError = (0, react_1.useCallback)((error) => {
        console.error(error);
    }, []);
    return (<wallet_adapter_react_1.ConnectionProvider endpoint={endpoint}>
      <wallet_adapter_react_1.WalletProvider wallets={[
            new wallet_adapter_wallets_1.PhantomWalletAdapter(), new wallet_adapter_wallets_1.SolflareWalletAdapter()
        ]} onError={onError} autoConnect={true}>
        <wallet_adapter_react_ui_1.WalletModalProvider>{children}</wallet_adapter_react_ui_1.WalletModalProvider>
      </wallet_adapter_react_1.WalletProvider>
    </wallet_adapter_react_1.ConnectionProvider>);
}
function useAnchorProvider() {
    const { connection } = (0, wallet_adapter_react_1.useConnection)();
    const wallet = (0, wallet_adapter_react_1.useWallet)();
    const getProvider = (0, react_1.useCallback)(() => {
        if (!connection || !wallet) {
            return null;
        }
        return new anchor_1.AnchorProvider(connection, wallet, {});
    }, [connection, wallet]);
    return getProvider;
}
