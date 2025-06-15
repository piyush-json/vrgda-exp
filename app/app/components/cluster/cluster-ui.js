"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplorerLink = ExplorerLink;
exports.ClusterChecker = ClusterChecker;
exports.ClusterUiSelect = ClusterUiSelect;
exports.ClusterUiModal = ClusterUiModal;
exports.ClusterUiTable = ClusterUiTable;
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const react_query_1 = require("@tanstack/react-query");
const react_1 = require("react");
const cluster_data_access_1 = require("./cluster-data-access");
const web3_js_1 = require("@solana/web3.js");
const lucide_react_1 = require("lucide-react");
const button_1 = require("~/components/ui/button");
const dialog_1 = require("~/components/ui/dialog");
const dropdown_menu_1 = require("~/components/ui/dropdown-menu");
const input_1 = require("~/components/ui/input");
const select_1 = require("~/components/ui/select");
const table_1 = require("~/components/ui/table");
const alert_1 = require("~/components/ui/alert");
function ExplorerLink({ path, label, className }) {
    const { getExplorerUrl } = (0, cluster_data_access_1.useCluster)();
    return (<a href={getExplorerUrl(path)} target='_blank' rel='noopener noreferrer' className={className ? className : `link font-mono`}>
      {label}
    </a>);
}
function ClusterChecker({ children }) {
    const { cluster } = (0, cluster_data_access_1.useCluster)();
    const { connection } = (0, wallet_adapter_react_1.useConnection)();
    const query = (0, react_query_1.useQuery)({
        queryKey: ['version', { cluster, endpoint: connection.rpcEndpoint }],
        queryFn: () => connection.getVersion(),
        retry: 1
    });
    if (query.isLoading) {
        return null;
    }
    if (query.isError || !query.data) {
        return (<alert_1.Alert variant="destructive">
        <alert_1.AlertDescription className="flex items-center justify-between">
          <span>
            Error connecting to cluster <strong>{cluster.name}</strong>
          </span>
          <button_1.Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Refresh
          </button_1.Button>
        </alert_1.AlertDescription>
      </alert_1.Alert>);
    }
    return children;
}
function ClusterUiSelect() {
    const { clusters, setCluster, cluster } = (0, cluster_data_access_1.useCluster)();
    return (<dropdown_menu_1.DropdownMenu>
      <dropdown_menu_1.DropdownMenuTrigger asChild>
        <button_1.Button variant="outline">{cluster.name}</button_1.Button>
      </dropdown_menu_1.DropdownMenuTrigger>
      <dropdown_menu_1.DropdownMenuContent>
        {clusters.map((item) => (<dropdown_menu_1.DropdownMenuItem key={item.name} onClick={() => setCluster(item)} className={item.active ? 'bg-accent' : ''}>
            {item.name}
          </dropdown_menu_1.DropdownMenuItem>))}
      </dropdown_menu_1.DropdownMenuContent>
    </dropdown_menu_1.DropdownMenu>);
}
function ClusterUiModal({ hideModal, show }) {
    const { addCluster } = (0, cluster_data_access_1.useCluster)();
    const [name, setName] = (0, react_1.useState)('');
    const [network, setNetwork] = (0, react_1.useState)();
    const [endpoint, setEndpoint] = (0, react_1.useState)('');
    return (<dialog_1.Dialog open={show} onOpenChange={(open) => !open && hideModal()}>
      <dialog_1.DialogContent>
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Add Cluster</dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        <div className="space-y-4">
          <input_1.Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}/>
          <input_1.Input placeholder="Endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)}/>
          <select_1.Select value={network} onValueChange={(value) => setNetwork(value)}>
            <select_1.SelectTrigger>
              <select_1.SelectValue placeholder="Select a network"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value={cluster_data_access_1.ClusterNetwork.Devnet}>Devnet</select_1.SelectItem>
              <select_1.SelectItem value={cluster_data_access_1.ClusterNetwork.Testnet}>Testnet</select_1.SelectItem>
              <select_1.SelectItem value={cluster_data_access_1.ClusterNetwork.Mainnet}>Mainnet</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <button_1.Button onClick={() => {
            try {
                new web3_js_1.Connection(endpoint);
                if (name && name !== '') {
                    addCluster({ name, network, endpoint });
                    hideModal();
                }
            }
            catch (_a) {
                console.log('Invalid cluster endpoint');
            }
        }}>
            Save
          </button_1.Button>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
function ClusterUiTable() {
    const { clusters, setCluster, deleteCluster } = (0, cluster_data_access_1.useCluster)();
    return (<div className="rounded-md border">
      <table_1.Table>
        <table_1.TableHeader>
          <table_1.TableRow>
            <table_1.TableHead>Name / Network / Endpoint</table_1.TableHead>
            <table_1.TableHead className="text-center">Actions</table_1.TableHead>
          </table_1.TableRow>
        </table_1.TableHeader>
        <table_1.TableBody>
          {clusters.map((item) => {
            var _a;
            return (<table_1.TableRow key={item.name} className={(item === null || item === void 0 ? void 0 : item.active) ? 'bg-muted' : ''}>
              <table_1.TableCell className="space-y-2">
                <div className="whitespace-nowrap space-x-2">
                  <span className="text-xl">
                    {(item === null || item === void 0 ? void 0 : item.active) ? (item.name) : (<button_1.Button variant="link" className="p-0" onClick={() => setCluster(item)}>
                        {item.name}
                      </button_1.Button>)}
                  </span>
                </div>
                <span className="text-xs">
                  Network: {(_a = item.network) !== null && _a !== void 0 ? _a : 'custom'}
                </span>
                <div className="whitespace-nowrap text-muted-foreground text-xs">
                  {item.endpoint}
                </div>
              </table_1.TableCell>
              <table_1.TableCell className="text-center">
                <button_1.Button variant="ghost" size="sm" disabled={item === null || item === void 0 ? void 0 : item.active} onClick={() => {
                    if (!window.confirm('Are you sure?'))
                        return;
                    deleteCluster(item);
                }}>
                  <lucide_react_1.TrashIcon size={16}/>
                </button_1.Button>
              </table_1.TableCell>
            </table_1.TableRow>);
        })}
        </table_1.TableBody>
      </table_1.Table>
    </div>);
}
