export type Callback<T> = (value: T) => void
type UnsubscribeFn = () => void

export interface unstable_WalletProvider {
  getChains: () => Promise<Record<ChainId, RelayChain>>
}

// `chainId` explanation:
// (hash_of_forked_block, block_number_of_forked_block)
// is the proper way of uniquely identifying a chain.
// Meaning that: for chains that haven't experienced any
// forks, the identifier would be (genesis_hash, 0).
// We represent this information as a hexadecimal string,
// where a non-forked chain will have a 32-byte long
// hexadecimal string representing the genesis hash.
// However, for a forked-chain, its identifier will be
// longer than 32 bytes. This extra length is attributable
// to the compact encoded block number, appended to the
// hash of the forked block.
type ChainId = string

export interface Chain {
  chainId: ChainId
  name: string
  symbol: string
  decimals: number
  ss58Format: number

  // returns a JSON RPC Provider that it's compliant with new
  // JSON-RPC API spec:
  // https://paritytech.github.io/json-rpc-interface-spec/api.html
  connect: JsonRpcProvider
}

export interface RelayChain extends Chain {
  addChain: (chainspec: string) => Promise<Chain>
  getChains: () => Promise<Record<ChainId, Chain>>
}

export interface JsonRpcConnection {
  send: (message: string) => void
  disconnect: () => void
}

export type JsonRpcProvider = (
  onMessage: (message: string) => void,
) => JsonRpcConnection

export interface AccountsProvider {
  getAccounts(): Promise<Account[]>
  onAccountsChange: (accounts: Callback<Account[]>) => UnsubscribeFn
}

export interface Account {
  publicKey: Uint8Array
  displayName?: string
  allowlist: string[]
  sign<T extends string>(payload: SignPayload<T>): Promise<void>
}

export type KnownSignedExtensionIdentifier =
  | "CheckSpecVersion"
  | "CheckVersion"
  | "CheckGenesis"
  | "CheckMortality"
  | "CheckNonce"
  | "ChargeTransactionPayment"
  | "ChargeAssetTxPayment"

export type SignedExtension<T extends string> = {
  identifier: KnownSignedExtensionIdentifier | T
  value: Uint8Array
  additionalSigned: Uint8Array
}

export type SignPayload<T extends string> = {
  callData: Uint8Array
  signedExtensions: Record<string, SignedExtension<T>>
  metadata: Uint8Array
  atBlockNumber: number
  hasher?: (data: Uint8Array) => Uint8Array
}
