'use client';
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
exports.useGetBalance = useGetBalance;
exports.useGetSignatures = useGetSignatures;
exports.useGetTokenAccounts = useGetTokenAccounts;
exports.useTransferSol = useTransferSol;
exports.useRequestAirdrop = useRequestAirdrop;
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const react_query_1 = require("@tanstack/react-query");
const ui_helper_1 = require("../ui-helper");
const sonner_1 = require("sonner");
function useGetBalance({ address }) {
    const { connection } = (0, wallet_adapter_react_1.useConnection)();
    return (0, react_query_1.useQuery)({
        queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address }],
        queryFn: () => connection.getBalance(address)
    });
}
function useGetSignatures({ address }) {
    const { connection } = (0, wallet_adapter_react_1.useConnection)();
    return (0, react_query_1.useQuery)({
        queryKey: ['get-signatures', { endpoint: connection.rpcEndpoint, address }],
        queryFn: () => connection.getConfirmedSignaturesForAddress2(address)
    });
}
function useGetTokenAccounts({ address }) {
    const { connection } = (0, wallet_adapter_react_1.useConnection)();
    return (0, react_query_1.useQuery)({
        queryKey: [
            'get-token-accounts',
            { endpoint: connection.rpcEndpoint, address }
        ],
        queryFn: () => __awaiter(this, void 0, void 0, function* () {
            const [tokenAccounts, token2022Accounts] = yield Promise.all([
                connection.getParsedTokenAccountsByOwner(address, {
                    programId: spl_token_1.TOKEN_PROGRAM_ID
                }),
                connection.getParsedTokenAccountsByOwner(address, {
                    programId: spl_token_1.TOKEN_2022_PROGRAM_ID
                })
            ]);
            return [...tokenAccounts.value, ...token2022Accounts.value];
        })
    });
}
function useTransferSol({ address }) {
    const { connection } = (0, wallet_adapter_react_1.useConnection)();
    const transactionToast = (0, ui_helper_1.useTransactionToast)();
    const wallet = (0, wallet_adapter_react_1.useWallet)();
    const client = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationKey: [
            'transfer-sol',
            { endpoint: connection.rpcEndpoint, address }
        ],
        mutationFn: (input) => __awaiter(this, void 0, void 0, function* () {
            let signature = '';
            try {
                const { transaction, latestBlockhash } = yield createTransaction({
                    publicKey: address,
                    destination: input.destination,
                    amount: input.amount,
                    connection
                });
                // Send transaction and await for signature
                signature = yield wallet.sendTransaction(transaction, connection);
                // Send transaction and await for signature
                yield connection.confirmTransaction(Object.assign({ signature }, latestBlockhash), 'confirmed');
                console.log(signature);
                return signature;
            }
            catch (error) {
                console.log('error', `Transaction failed! ${error}`, signature);
                return;
            }
        }),
        onSuccess: (signature) => {
            if (signature) {
                transactionToast(signature);
            }
            return Promise.all([
                client.invalidateQueries({
                    queryKey: [
                        'get-balance',
                        { endpoint: connection.rpcEndpoint, address }
                    ]
                }),
                client.invalidateQueries({
                    queryKey: [
                        'get-signatures',
                        { endpoint: connection.rpcEndpoint, address }
                    ]
                })
            ]);
        },
        onError: (error) => {
            sonner_1.toast.error(`Transaction failed! ${error}`);
        }
    });
}
function useRequestAirdrop({ address }) {
    const { connection } = (0, wallet_adapter_react_1.useConnection)();
    const transactionToast = (0, ui_helper_1.useTransactionToast)();
    const client = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationKey: ['airdrop', { endpoint: connection.rpcEndpoint, address }],
        mutationFn: (...args_1) => __awaiter(this, [...args_1], void 0, function* (amount = 1) {
            const [latestBlockhash, signature] = yield Promise.all([
                connection.getLatestBlockhash(),
                connection.requestAirdrop(address, amount * web3_js_1.LAMPORTS_PER_SOL)
            ]);
            yield connection.confirmTransaction(Object.assign({ signature }, latestBlockhash), 'confirmed');
            return signature;
        }),
        onSuccess: (signature) => {
            transactionToast(signature);
            return Promise.all([
                client.invalidateQueries({
                    queryKey: [
                        'get-balance',
                        { endpoint: connection.rpcEndpoint, address }
                    ]
                }),
                client.invalidateQueries({
                    queryKey: [
                        'get-signatures',
                        { endpoint: connection.rpcEndpoint, address }
                    ]
                })
            ]);
        }
    });
}
function createTransaction(_a) {
    return __awaiter(this, arguments, void 0, function* ({ publicKey, destination, amount, connection }) {
        // Get the latest blockhash to use in our transaction
        const latestBlockhash = yield connection.getLatestBlockhash();
        // Create instructions to send, in this case a simple transfer
        const instructions = [
            web3_js_1.SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: destination,
                lamports: amount * web3_js_1.LAMPORTS_PER_SOL
            })
        ];
        // Create a new TransactionMessage with version and compile it to legacy
        const messageLegacy = new web3_js_1.TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions
        }).compileToLegacyMessage();
        // Create a new VersionedTransaction which supports legacy and v0
        const transaction = new web3_js_1.VersionedTransaction(messageLegacy);
        return {
            transaction,
            latestBlockhash
        };
    });
}
