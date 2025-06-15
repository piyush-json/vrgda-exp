"use strict";
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
exports.AccountBalance = AccountBalance;
exports.AccountChecker = AccountChecker;
exports.AccountBalanceCheck = AccountBalanceCheck;
exports.AccountButtons = AccountButtons;
exports.AccountTokens = AccountTokens;
exports.AccountTransactions = AccountTransactions;
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const web3_js_1 = require("@solana/web3.js");
const react_query_1 = require("@tanstack/react-query");
const react_1 = require("react");
const ui_helper_1 = require("../ui-helper");
const cluster_data_access_1 = require("../cluster/cluster-data-access");
const cluster_ui_1 = require("../cluster/cluster-ui");
const account_data_access_1 = require("./account-data-access");
const lucide_react_1 = require("lucide-react");
function AccountBalance({ address }) {
    const query = (0, account_data_access_1.useGetBalance)({ address });
    return (<div>
      <h1 className='text-xl font-bold cursor-pointer' onClick={() => query.refetch()}>
        {query.data ? <BalanceSol balance={query.data}/> : '...'} SOL
      </h1>
    </div>);
}
function AccountChecker() {
    const { publicKey } = (0, wallet_adapter_react_1.useWallet)();
    if (!publicKey) {
        return null;
    }
    return <AccountBalanceCheck address={publicKey}/>;
}
function AccountBalanceCheck({ address }) {
    const { cluster } = (0, cluster_data_access_1.useCluster)();
    const mutation = (0, account_data_access_1.useRequestAirdrop)({ address });
    const query = (0, account_data_access_1.useGetBalance)({ address });
    if (query.isLoading) {
        return null;
    }
    if (query.isError || !query.data) {
        return (<div className='alert alert-warning text-warning-content/80 rounded-none flex justify-center'>
        <span>
          You are connected to <strong>{cluster.name}</strong> but your account
          is not found on this cluster.
        </span>
        <button className='btn btn-xs btn-neutral' onClick={() => mutation.mutateAsync(1).catch((err) => console.log(err))}>
          Request Airdrop
        </button>
      </div>);
    }
    return null;
}
function AccountButtons({ address }) {
    var _a, _b;
    const wallet = (0, wallet_adapter_react_1.useWallet)();
    const { cluster } = (0, cluster_data_access_1.useCluster)();
    const [showAirdropModal, setShowAirdropModal] = (0, react_1.useState)(false);
    const [showReceiveModal, setShowReceiveModal] = (0, react_1.useState)(false);
    const [showSendModal, setShowSendModal] = (0, react_1.useState)(false);
    return (<div>
      <ModalAirdrop hide={() => setShowAirdropModal(false)} address={address} show={showAirdropModal}/>
      <ModalReceive address={address} show={showReceiveModal} hide={() => setShowReceiveModal(false)}/>
      <ModalSend address={address} show={showSendModal} hide={() => setShowSendModal(false)}/>
      <div className='space-x-2'>
        <button disabled={(_a = cluster.network) === null || _a === void 0 ? void 0 : _a.includes('mainnet')} className='btn btn-xs lg:btn-md btn-outline' onClick={() => setShowAirdropModal(true)}>
          Airdrop
        </button>
        <button disabled={((_b = wallet.publicKey) === null || _b === void 0 ? void 0 : _b.toString()) !== address.toString()} className='btn btn-xs lg:btn-md btn-outline' onClick={() => setShowSendModal(true)}>
          Send
        </button>
        <button className='btn btn-xs lg:btn-md btn-outline' onClick={() => setShowReceiveModal(true)}>
          Receive
        </button>
      </div>
    </div>);
}
function AccountTokens({ address }) {
    var _a, _b, _c;
    const [showAll, setShowAll] = (0, react_1.useState)(false);
    const query = (0, account_data_access_1.useGetTokenAccounts)({ address });
    const client = (0, react_query_1.useQueryClient)();
    const items = (0, react_1.useMemo)(() => {
        var _a;
        if (showAll)
            return query.data;
        return (_a = query.data) === null || _a === void 0 ? void 0 : _a.slice(0, 5);
    }, [query.data, showAll]);
    return (<div className='space-y-2'>
      <div className='justify-between'>
        <div className='flex justify-between'>
          <h2 className='text-2xl font-bold'>Token Accounts</h2>
          <div className='space-x-2'>
            {query.isLoading ? (<span className='loading loading-spinner'></span>) : (<button className='btn btn-sm btn-outline' onClick={() => __awaiter(this, void 0, void 0, function* () {
                yield query.refetch();
                yield client.invalidateQueries({
                    queryKey: ['getTokenAccountBalance']
                });
            })}>
                <lucide_react_1.RefreshCw size={16}/>
              </button>)}
          </div>
        </div>
      </div>
      {query.isError && (<pre className='alert alert-error'>
          Error: {(_a = query.error) === null || _a === void 0 ? void 0 : _a.message.toString()}
        </pre>)}
      {query.isSuccess && (<div>
          {query.data.length === 0 ? (<div>No token accounts found.</div>) : (<table className='table border-4 rounded-lg border-separate border-base-300'>
              <thead>
                <tr>
                  <th>Public Key</th>
                  <th>Mint</th>
                  <th className='text-right'>Balance</th>
                </tr>
              </thead>
              <tbody>
                {items === null || items === void 0 ? void 0 : items.map(({ account, pubkey }) => (<tr key={pubkey.toString()}>
                    <td>
                      <div className='flex space-x-2'>
                        <span className='font-mono'>
                          <cluster_ui_1.ExplorerLink label={(0, ui_helper_1.ellipsify)(pubkey.toString())} path={`account/${pubkey.toString()}`}/>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className='flex space-x-2'>
                        <span className='font-mono'>
                          <cluster_ui_1.ExplorerLink label={(0, ui_helper_1.ellipsify)(account.data.parsed.info.mint)} path={`account/${account.data.parsed.info.mint.toString()}`}/>
                        </span>
                      </div>
                    </td>
                    <td className='text-right'>
                      <span className='font-mono'>
                        {account.data.parsed.info.tokenAmount.uiAmount}
                      </span>
                    </td>
                  </tr>))}

                {((_c = (_b = query.data) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) > 5 && (<tr>
                    <td colSpan={4} className='text-center'>
                      <button className='btn btn-xs btn-outline' onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show Less' : 'Show All'}
                      </button>
                    </td>
                  </tr>)}
              </tbody>
            </table>)}
        </div>)}
    </div>);
}
function AccountTransactions({ address }) {
    var _a, _b, _c;
    const query = (0, account_data_access_1.useGetSignatures)({ address });
    const [showAll, setShowAll] = (0, react_1.useState)(false);
    const items = (0, react_1.useMemo)(() => {
        var _a;
        if (showAll)
            return query.data;
        return (_a = query.data) === null || _a === void 0 ? void 0 : _a.slice(0, 5);
    }, [query.data, showAll]);
    return (<div className='space-y-2'>
      <div className='flex justify-between'>
        <h2 className='text-2xl font-bold'>Transaction History</h2>
        <div className='space-x-2'>
          {query.isLoading ? (<span className='loading loading-spinner'></span>) : (<button className='btn btn-sm btn-outline' onClick={() => query.refetch()}>
              <lucide_react_1.RefreshCw size={16}/>
            </button>)}
        </div>
      </div>
      {query.isError && (<pre className='alert alert-error'>
          Error: {(_a = query.error) === null || _a === void 0 ? void 0 : _a.message.toString()}
        </pre>)}
      {query.isSuccess && (<div>
          {query.data.length === 0 ? (<div>No transactions found.</div>) : (<table className='table border-4 rounded-lg border-separate border-base-300'>
              <thead>
                <tr>
                  <th>Signature</th>
                  <th className='text-right'>Slot</th>
                  <th>Block Time</th>
                  <th className='text-right'>Status</th>
                </tr>
              </thead>
              <tbody>
                {items === null || items === void 0 ? void 0 : items.map((item) => {
                    var _a;
                    return (<tr key={item.signature}>
                    <th className='font-mono'>
                      <cluster_ui_1.ExplorerLink path={`tx/${item.signature}`} label={(0, ui_helper_1.ellipsify)(item.signature, 8)}/>
                    </th>
                    <td className='font-mono text-right'>
                      <cluster_ui_1.ExplorerLink path={`block/${item.slot}`} label={item.slot.toString()}/>
                    </td>
                    <td>
                      {new Date(((_a = item.blockTime) !== null && _a !== void 0 ? _a : 0) * 1000).toISOString()}
                    </td>
                    <td className='text-right'>
                      {item.err ? (<div className='badge badge-error' title={JSON.stringify(item.err)}>
                          Failed
                        </div>) : (<div className='badge badge-success'>Success</div>)}
                    </td>
                  </tr>);
                })}
                {((_c = (_b = query.data) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) > 5 && (<tr>
                    <td colSpan={4} className='text-center'>
                      <button className='btn btn-xs btn-outline' onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show Less' : 'Show All'}
                      </button>
                    </td>
                  </tr>)}
              </tbody>
            </table>)}
        </div>)}
    </div>);
}
function BalanceSol({ balance }) {
    return (<span>{Math.round((balance / web3_js_1.LAMPORTS_PER_SOL) * 100000) / 100000}</span>);
}
function ModalReceive({ hide, show, address }) {
    return (<ui_helper_1.AppModal title='Receive' hide={hide} show={show}>
      <p>Receive assets by sending them to your public key:</p>
      <code>{address.toString()}</code>
    </ui_helper_1.AppModal>);
}
function ModalAirdrop({ hide, show, address }) {
    const mutation = (0, account_data_access_1.useRequestAirdrop)({ address });
    const [amount, setAmount] = (0, react_1.useState)('2');
    return (<ui_helper_1.AppModal hide={hide} show={show} title='Airdrop' submitDisabled={!amount || mutation.isPending} submitLabel='Request Airdrop' submit={() => mutation.mutateAsync(parseFloat(amount)).then(() => hide())}>
      <input disabled={mutation.isPending} type='number' step='any' min='1' placeholder='Amount' className='input input-bordered w-full' value={amount} onChange={(e) => setAmount(e.target.value)}/>
    </ui_helper_1.AppModal>);
}
function ModalSend({ hide, show, address }) {
    const wallet = (0, wallet_adapter_react_1.useWallet)();
    const mutation = (0, account_data_access_1.useTransferSol)({ address });
    const [destination, setDestination] = (0, react_1.useState)('');
    const [amount, setAmount] = (0, react_1.useState)('1');
    if (!address || !wallet.sendTransaction) {
        return <div>Wallet not connected</div>;
    }
    return (<ui_helper_1.AppModal hide={hide} show={show} title='Send' submitDisabled={!destination || !amount || mutation.isPending} submitLabel='Send' submit={() => {
            mutation
                .mutateAsync({
                destination: new web3_js_1.PublicKey(destination),
                amount: parseFloat(amount)
            })
                .then(() => hide());
        }}>
      <input disabled={mutation.isPending} type='text' placeholder='Destination' className='input input-bordered w-full' value={destination} onChange={(e) => setDestination(e.target.value)}/>
      <input disabled={mutation.isPending} type='number' step='any' min='1' placeholder='Amount' className='input input-bordered w-full' value={amount} onChange={(e) => setAmount(e.target.value)}/>
    </ui_helper_1.AppModal>);
}
