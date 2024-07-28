export const EVMOS_NETWORKS = ["kawaii_6886-1"];
export const EXTRA_FEE_LIMIT_TRON = 50_000_000;
export const DEFAULT_FEE_LIMIT_TRON = 150_000_000;
export const TRIGGER_TYPE = "TriggerSmartContract";
export const TRON_ID = "0x2b6653dc";
export const TRON_BIP39_PATH_PREFIX = "m/44'/195'";
export const BIP44_PATH_PREFIX = "m/44'";
export const TRON_BIP39_PATH_INDEX_0 = TRON_BIP39_PATH_PREFIX + "/0'/0/0";
import { Network as NetworkTatum } from "@tatumio/tatum";
export enum NetworkEnum {
  Cosmos = "cosmos",
  Evm = "evm",
  Bitcoin = "bitcoin",
}
export const ICON_OWALLET =
  "data:image/png;base64,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";

export enum OasisNetwork {
  MAINNET = "oasis-mainnet",
  SAPPHIRE = "oasis-sapphire-mainnet",
  EMERALD = "oasis-emerald-mainnet",
}
export const urlTxHistory = "https://tx-history-backend.oraidex.io/";
export enum COSMOS_NETWORK {
  COSMOSHUB = "cosmoshub-4",
  OSMOSIS = "osmosis-1",
  INJECTIVE = "injective-1",
  ORAICHAIN = "Oraichain",
}

export type Network = NetworkTatum & OasisNetwork & COSMOS_NETWORK;
export const Network = { ...NetworkTatum, ...OasisNetwork, ...COSMOS_NETWORK };
export enum CosmosNetwork {
  ORAICHAIN = "oraichain",
}
export enum ChainIdEnum {
  Oraichain = "Oraichain",
  OraichainTestnet = "Oraichain-testnet",
  OraiBridge = "oraibridge-subnet-2",
  OraiBTCBridge = "oraibtc-mainnet-1",
  KawaiiCosmos = "kawaii_6886-1",
  KawaiiEvm = "0x1ae6",
  Ethereum = "0x01",
  CosmosHub = "cosmoshub-4",
  Osmosis = "osmosis-1",
  Juno = "juno-1",
  BNBChain = "0x38",
  BNBChainTestNet = "0x61",
  TRON = "0x2b6653dc",
  Oasis = "native-0x5afe",
  OasisSapphire = "0x5afe",
  OasisEmerald = "0xa516",
  BitcoinTestnet = "bitcoinTestnet",
  Bitcoin = "bitcoin",
  Injective = "injective-1",
  Neutaro = "Neutaro-1",
  Noble = "noble-1",
  Stargaze = "stargaze-1",
}

export enum KADOChainNameEnum {
  "Oraichain" = "ORAICHAIN",
  "juno-1" = "JUNO",
  "0x01" = "ETHEREUM",
  "cosmoshub-4" = "COSMOS HUB",
  "injective-1" = "INJECTIVE",
  "osmosis-1" = "OSMOSIS",
  "bitcoin" = "BITCOIN",
  "kawaii_6886-1" = "KAWAIIVERSE COSMOS",
  "0x1ae6" = "KAWAIIVERSE EVM",
  "0x2b6653dc" = "TRON",
  "0x38" = "BNB",
  "noble-1" = "NOBLE",
  "stargaze-1" = "STARGAZE",
}

export enum ChainNameEnum {
  Oraichain = "Oraichain",
  OraichainTestnet = "Oraichain-testnet",
  KawaiiCosmos = "Kawaiiverse",
  KawaiiEvm = "Kawaiiverse EVM",
  Ethereum = "Ethereum",
  CosmosHub = "Cosmos Hub",
  Osmosis = "Osmosis",
  Juno = "Juno",
  BNBChain = "BNB Chain",
  TRON = "Tron Network",
  BitcoinLegacy = "Bitcoin(Legacy)",
  BitcoinSegWit = "Bitcoin SegWit(BECH32)",
  Injective = "Injective",
  Oasis = "Oasis",
  OasisSapphire = "Oasis Sapphire",
  OasisEmerald = "Oasis Emerald",
  Neutaro = "Neutaro",
  Noble = "Noble",
  Stargaze = "Stargaze",
}

export const restBtc = {
  [ChainIdEnum.Bitcoin]: "https://blockstream.info/api",
  [ChainIdEnum.BitcoinTestnet]: "https://blockstream.info/testnet/api",
};

export const TRC20_LIST = [
  {
    contractAddress: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
    tokenName: "USDC",
    coinDenom: "USDC",
    coinGeckoId: "usd-coin",
    coinImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
    coinDecimals: 6,
    type: "trc20",
  },
  {
    contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    tokenName: "USDT",
    coinDenom: "USDT",
    coinDecimals: 6,
    coinGeckoId: "tether",
    coinImageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
    type: "trc20",
  },
  {
    contractAddress: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR",
    tokenName: "WTRX",
    coinDenom: "WTRX",
    coinDecimals: 6,
    coinGeckoId: "tron",
    coinImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
    type: "trc20",
  },
  // {
  //   contractAddress: 'TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL',
  //   tokenName: 'USDJ',
  //   coinDenom: 'USDJ',
  //   coinDecimals: 6,
  //   coinGeckoId: 'usdj',
  //   coinImageUrl:
  //     'https://s2.coinmarketcap.com/static/img/coins/64x64/5446.png',
  //   type: 'trc20'
  // },
  // {
  //   contractAddress: 'TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3',
  //   tokenName: 'JST',
  //   coinDenom: 'JST',
  //   coinDecimals: 6,
  //   coinGeckoId: 'just',
  //   coinImageUrl:
  //     'https://s2.coinmarketcap.com/static/img/coins/64x64/5488.png',
  //   type: 'trc20'
  // },
  // {
  //   contractAddress: 'TWrZRHY9aKQZcyjpovdH6qeCEyYZrRQDZt',
  //   tokenName: 'SUNOLD',
  //   coinDenom: 'SUNOLD',
  //   coinDecimals: 6,
  //   coinGeckoId: 'sun',
  //   coinImageUrl:
  //     'https://s2.coinmarketcap.com/static/img/coins/64x64/6990.png',
  //   type: 'trc20'
  // }
];
