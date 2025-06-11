'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AccountDetailFeature;
const web3_js_1 = require("@solana/web3.js");
const react_1 = require("react");
const cluster_ui_1 = require("../cluster/cluster-ui");
const ui_helper_1 = require("../ui-helper");
const account_ui_1 = require("./account-ui");
const react_router_1 = require("react-router");
function AccountDetailFeature() {
    const params = (0, react_router_1.useParams)();
    const address = (0, react_1.useMemo)(() => {
        if (!params.address) {
            return;
        }
        try {
            return new web3_js_1.PublicKey(params.address);
        }
        catch (e) {
            console.log(`Invalid public key`, e);
        }
    }, [params]);
    if (!address) {
        return <div>Error loading account</div>;
    }
    return (<div>
      <ui_helper_1.AppHero title={<account_ui_1.AccountBalance address={address}/>} subtitle={<div className='my-4'>
            <cluster_ui_1.ExplorerLink path={`account/${address}`} label={(0, ui_helper_1.ellipsify)(address.toString())}/>
          </div>}>
        <div className='my-4'>
          <account_ui_1.AccountButtons address={address}/>
        </div>
      </ui_helper_1.AppHero>
      <div className='space-y-8'>
        <account_ui_1.AccountTokens address={address}/>
        <account_ui_1.AccountTransactions address={address}/>
      </div>
    </div>);
}
