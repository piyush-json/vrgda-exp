"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultClusters = exports.ClusterNetwork = void 0;
exports.ClusterProvider = ClusterProvider;
exports.useCluster = useCluster;
const web3_js_1 = require("@solana/web3.js");
const jotai_1 = require("jotai");
const utils_1 = require("jotai/utils");
const react_1 = require("react");
const sonner_1 = require("sonner");
var ClusterNetwork;
(function (ClusterNetwork) {
    ClusterNetwork["Mainnet"] = "mainnet-beta";
    ClusterNetwork["Testnet"] = "testnet";
    ClusterNetwork["Devnet"] = "devnet";
    ClusterNetwork["Custom"] = "custom";
})(ClusterNetwork || (exports.ClusterNetwork = ClusterNetwork = {}));
// By default, we don't configure the mainnet-beta cluster
// The endpoint provided by clusterApiUrl('mainnet-beta') does not allow access from the browser due to CORS restrictions
// To use the mainnet-beta cluster, provide a custom endpoint
exports.defaultClusters = [
    {
        name: 'devnet',
        endpoint: (0, web3_js_1.clusterApiUrl)('devnet'),
        network: ClusterNetwork.Devnet
    },
    {
        name: 'local',
        endpoint: 'http://localhost:8899',
        network: ClusterNetwork.Custom
    },
    {
        name: 'testnet',
        endpoint: (0, web3_js_1.clusterApiUrl)('testnet'),
        network: ClusterNetwork.Testnet
    }
];
const clusterAtom = (0, utils_1.atomWithStorage)('solana-cluster', exports.defaultClusters[0]);
const clustersAtom = (0, utils_1.atomWithStorage)('solana-clusters', exports.defaultClusters);
const activeClustersAtom = (0, jotai_1.atom)((get) => {
    const clusters = get(clustersAtom);
    const cluster = get(clusterAtom);
    return clusters.map((item) => (Object.assign(Object.assign({}, item), { active: item.name === cluster.name })));
});
const activeClusterAtom = (0, jotai_1.atom)((get) => {
    const clusters = get(activeClustersAtom);
    return clusters.find((item) => item.active) || clusters[0];
});
const Context = (0, react_1.createContext)({});
function ClusterProvider({ children }) {
    const cluster = (0, jotai_1.useAtomValue)(activeClusterAtom);
    const clusters = (0, jotai_1.useAtomValue)(activeClustersAtom);
    const setCluster = (0, jotai_1.useSetAtom)(clusterAtom);
    const setClusters = (0, jotai_1.useSetAtom)(clustersAtom);
    const value = {
        cluster,
        clusters: clusters.sort((a, b) => (a.name > b.name ? 1 : -1)),
        addCluster: (cluster) => {
            try {
                new web3_js_1.Connection(cluster.endpoint);
                setClusters([...clusters, cluster]);
            }
            catch (err) {
                sonner_1.toast.error(`${err}`);
            }
        },
        deleteCluster: (cluster) => {
            setClusters(clusters.filter((item) => item.name !== cluster.name));
        },
        setCluster: (cluster) => setCluster(cluster),
        getExplorerUrl: (path) => `https://explorer.solana.com/${path}${getClusterUrlParam(cluster)}`
    };
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
function useCluster() {
    return (0, react_1.useContext)(Context);
}
function getClusterUrlParam(cluster) {
    let suffix = '';
    switch (cluster.network) {
        case ClusterNetwork.Devnet:
            suffix = 'devnet';
            break;
        case ClusterNetwork.Mainnet:
            suffix = '';
            break;
        case ClusterNetwork.Testnet:
            suffix = 'testnet';
            break;
        default:
            suffix = `custom&customUrl=${encodeURIComponent(cluster.endpoint)}`;
            break;
    }
    return suffix.length ? `?cluster=${suffix}` : '';
}
