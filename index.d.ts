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

  // it pulls the current list of available accounts for this Chain
  getAccounts: () => Promise<Array<Account>>

  // registers a callback that will be invoked whenever the list
  // of available accounts for this chain has changed. The callback
  // will be synchronously called with the current list of accounts.
  onAccountsChange: (accounts: Callback<Array<Account>>) => UnsubscribeFn

  // returns a JSON RPC Provider that it's compliant with new
  // JSON-RPC API spec:
  // https://paritytech.github.io/json-rpc-interface-spec/api.html
  connect: (
    // the listener callback that the JsonRpcProvider
    // will be sending messages to
    onMessage: Callback<string>,
  ) => JsonRpcProvider
}

export interface RelayChain extends Chain {
  addChain: (chainspec: string) => Promise<Chain>
  getChains: () => Promise<Record<ChainId, Chain>>
}

export interface JsonRpcConnection {
  send: (message: string) => void
  disconnect: () => void
}

export declare type JsonRpcProvider = (
  onMessage: (message: string) => void,
) => JsonRpcConnection

export interface PolkadotSigner {
  // Public key of the account.
  publicKey: Uint8Array
  sign: (
    callData: Uint8Array,
    signedExtensions: Record<
      string,
      {
        identifier: string
        value: Uint8Array
        additionalSigned: Uint8Array
      }
    >,
    metadata: Uint8Array,
    atBlockNumber: number,
    hasher?: (data: Uint8Array) => Uint8Array,
  ) => Promise<Uint8Array>
}

export interface Account extends PolkadotSigner {
  // SS58 formated public key
  address: string
  // The provider may have captured a display name
  displayName?: string
}
