export const EVMOS_NETWORKS = ['kawaii_6886-1'];
export const ORAICHAIN_ID = 'Oraichain';
export const KAWAII_ID = 'kawaii_6886-1';
export const ETH_ID = '0x01';
export const TRON_ID = '0x2b6653dc';
export const TRON_BIP39_PATH_PREFIX = "m/44'/195'";
export const BIP44_PATH_PREFIX = "m/44'";
export const TRON_BIP39_PATH_INDEX_0 = TRON_BIP39_PATH_PREFIX + "/0'/0/0";

export enum NetworkEnum {
  Cosmos = 'cosmos',
  Evm = 'evm',
  Bitcoin = 'bitcoin'
}
export enum ChainIdEnum {
  Oraichain = 'Oraichain',
  OraichainTestnet = 'Oraichain-testnet',
  OraiBridge = 'oraibridge-subnet-2',
  KawaiiCosmos = 'kawaii_6886-1',
  KawaiiEvm = '0x1ae6',
  Ethereum = '0x01',
  CosmosHub = 'cosmoshub-4',
  Osmosis = 'osmosis-1',
  Juno = 'juno-1',
  BNBChain = '0x38',
  BNBChainTestNet = '0x61',
  TRON = '0x2b6653dc',
  BitcoinTestnet = 'bitcoinTestnet',
  Bitcoin = 'bitcoin'
}

export const TRC20_LIST = [
  {
    contractAddress: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
    tokenName: 'USDC',
    coinDenom: 'USDC',
    coinGeckoId: 'usd-coin',
    coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    coinDecimals: 6,
    type: 'trc20'
  },
  {
    contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    tokenName: 'USDT',
    coinDenom: 'USDT',
    coinDecimals: 6,
    coinGeckoId: 'tether',
    coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    type: 'trc20'
  },
  {
    contractAddress: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR',
    tokenName: 'WTRX',
    coinDenom: 'WTRX',
    coinDecimals: 6,
    coinGeckoId: 'tron',
    coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png',
    type: 'trc20'
  }
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
