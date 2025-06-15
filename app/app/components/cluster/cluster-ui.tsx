import { useConnection } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { ClusterNetwork, useCluster } from './cluster-data-access'
import { Connection } from '@solana/web3.js'
import { TrashIcon } from 'lucide-react'
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Alert, AlertDescription } from "~/components/ui/alert"

export function ExplorerLink({
  path,
  label,
  className
}: {
  path: string
  label: string
  className?: string
}) {
  const { getExplorerUrl } = useCluster()
  return (
    <a
      href={getExplorerUrl(path)}
      target='_blank'
      rel='noopener noreferrer'
      className={className ? className : `link font-mono`}
    >
      {label}
    </a>
  )
}

export function ClusterChecker({ children }: { children: ReactNode }) {
  const { cluster } = useCluster()
  const { connection } = useConnection()

  const query = useQuery({
    queryKey: ['version', { cluster, endpoint: connection.rpcEndpoint }],
    queryFn: () => connection.getVersion(),
    retry: 1
  })
  if (query.isLoading) {
    return null
  }
  if (query.isError || !query.data) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span>
            Error connecting to cluster <strong>{cluster.name}</strong>
          </span>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
  return children
}

export function ClusterUiSelect() {
  const { clusters, setCluster, cluster } = useCluster()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{cluster.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {clusters.map((item) => (
          <DropdownMenuItem
            key={item.name}
            onClick={() => setCluster(item)}
            className={item.active ? 'bg-accent' : ''}
          >
            {item.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
import { type Cluster } from '@solana/web3.js'
export function ClusterUiModal({
  hideModal,
  show
}: {
  hideModal: () => void
  show: boolean
}) {
  const { addCluster } = useCluster()
  const [name, setName] = useState('')
  const [network, setNetwork] = useState<ClusterNetwork | undefined>()
  const [endpoint, setEndpoint] = useState('')

  return (
    <Dialog open={show} onOpenChange={(open) => !open && hideModal()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Cluster</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
          <Select value={network} onValueChange={(value) => setNetwork(value as ClusterNetwork)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ClusterNetwork.Devnet}>Devnet</SelectItem>
              <SelectItem value={ClusterNetwork.Testnet}>Testnet</SelectItem>
              <SelectItem value={ClusterNetwork.Mainnet}>Mainnet</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              try {
                new Connection(endpoint)
                if (name && name !== '') {
                  addCluster({ name, network, endpoint })
                  hideModal()
                }
              } catch {
                console.log('Invalid cluster endpoint')
              }
            }}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ClusterUiTable() {
  const { clusters, setCluster, deleteCluster } = useCluster()
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name / Network / Endpoint</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clusters.map((item) => (
            <TableRow key={item.name} className={item?.active ? 'bg-muted' : ''}>
              <TableCell className="space-y-2">
                <div className="whitespace-nowrap space-x-2">
                  <span className="text-xl">
                    {item?.active ? (
                      item.name
                    ) : (
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => setCluster(item)}
                      >
                        {item.name}
                      </Button>
                    )}
                  </span>
                </div>
                <span className="text-xs">
                  Network: {item.network ?? 'custom'}
                </span>
                <div className="whitespace-nowrap text-muted-foreground text-xs">
                  {item.endpoint}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={item?.active}
                  onClick={() => {
                    if (!window.confirm('Are you sure?')) return
                    deleteCluster(item)
                  }}
                >
                  <TrashIcon size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
