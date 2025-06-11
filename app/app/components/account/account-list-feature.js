'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AccountListFeature;
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const solana_provider_1 = require("../solana/solana-provider");
const react_router_1 = require("react-router");
function AccountListFeature() {
    const { publicKey } = (0, wallet_adapter_react_1.useWallet)();
    if (publicKey) {
        return (0, react_router_1.redirect)(`/account/${publicKey.toString()}`);
    }
    return (<div className='hero py-[64px]'>
      <div className='hero-content text-center'>
        <solana_provider_1.WalletButton />
      </div>
    </div>);
}
