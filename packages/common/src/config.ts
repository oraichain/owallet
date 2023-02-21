import { Bech32Address } from '@owallet/cosmos';
import { AppChainInfo } from '@owallet/types';
import { IntlMessages, TypeLanguageToFiatCurrency } from './languages';
import { FiatCurrency } from '@owallet/types';

export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

export const FiatCurrencies: FiatCurrency[] = [
  {
    currency: 'usd',
    symbol: '$',
    maxDecimals: 2,
    locale: 'en-US'
  },
  {
    currency: 'eur',
    symbol: '€',
    maxDecimals: 2,
    locale: 'de-DE'
  },
  {
    currency: 'gbp',
    symbol: '£',
    maxDecimals: 2,
    locale: 'en-GB'
  },
  {
    currency: 'cad',
    symbol: 'CA$',
    maxDecimals: 2,
    locale: 'en-CA'
  },
  {
    currency: 'aud',
    symbol: 'AU$',
    maxDecimals: 2,
    locale: 'en-AU'
  },
  {
    currency: 'rub',
    symbol: '₽',
    maxDecimals: 0,
    locale: 'ru'
  },
  {
    currency: 'krw',
    symbol: '₩',
    maxDecimals: 0,
    locale: 'ko-KR'
  },
  {
    currency: 'hkd',
    symbol: 'HK$',
    maxDecimals: 1,
    locale: 'en-HK'
  },
  {
    currency: 'cny',
    symbol: '¥',
    maxDecimals: 1,
    locale: 'zh-CN'
  },
  {
    currency: 'jpy',
    symbol: '¥',
    maxDecimals: 0,
    locale: 'ja-JP'
  },
  {
    currency: 'inr',
    symbol: '₹',
    maxDecimals: 1,
    locale: 'en-IN'
  }
];

export const LanguageToFiatCurrency: TypeLanguageToFiatCurrency = {
  default: 'usd',
  ko: 'krw',
  vi: 'vnd'
};

export const AdditonalIntlMessages: IntlMessages = {};

// coingecko api for both evm and cosmos based networks
export const CoinGeckoAPIEndPoint = 'https://api.coingecko.com/api/v3';

export const EthereumEndpoint =
  'https://mainnet.infura.io/v3/eeb00e81cdb2410098d5a270eff9b341';

export const CoinGeckoGetPrice = '/simple/price';

// default networks
export const EmbedChainInfos: AppChainInfo[] = [
  {
    rpc: 'https://rpc.orai.io',
    rest: 'https://lcd.orai.io',
    chainId: 'Oraichain',
    chainName: 'Oraichain',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'ORAI',
      coinMinimalDenom: 'orai',
      coinDecimals: 6,
      coinGeckoId: 'oraichain-token',
      coinImageUrl:
        'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
    },
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config('orai'),
    get currencies() {
      return [
        this.stakeCurrency,
        {
          type: 'cw20',
          coinDenom: 'AIRI',
          coinMinimalDenom:
            'cw20:orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg:aiRight Token',
          contractAddress: 'orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg',
          coinDecimals: 6,
          coinGeckoId: 'airight',
          coinImageUrl: 'https://i.ibb.co/m8mCyMr/airi.png'
        },
        {
          type: 'cw20',
          coinDenom: 'ORAIX',
          coinMinimalDenom:
            'cw20:orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge:OraiDex Token',
          contractAddress: 'orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge',
          coinDecimals: 6,
          coinGeckoId: 'oraidex',
          coinImageUrl: 'https://i.ibb.co/VmMJtf7/oraix.png'
        },
        {
          type: 'cw20',
          coinDenom: 'USDT',
          coinMinimalDenom:
            'cw20:orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh:Tether',
          contractAddress: 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh',
          coinDecimals: 6,
          coinGeckoId: 'tether',
          coinImageUrl:
            'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
        }
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    gasPriceStep: {
      low: 0.003,
      average: 0.005,
      high: 0.007
    },
    features: ['stargate', 'ibc-transfer', 'cosmwasm', 'no-legacy-stdTx'],
    chainSymbolImageUrl: 'https://orai.io/images/logos/logomark-dark.png',
    txExplorer: {
      name: 'Oraiscan',
      txUrl: 'https://scan.orai.io/txs/{txHash}',
      accountUrl: 'https://scan.orai.io/account/{address}'
    }
    // beta: true // use v1beta1
  },
  {
    rpc: 'https://testnet-rpc.orai.io',
    rest: 'https://testnet-lcd.orai.io',
    chainId: 'Oraichain-testnet',
    chainName: 'Oraichain-testnet',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'ORAI',
      coinMinimalDenom: 'orai',
      coinDecimals: 6,
      coinGeckoId: 'oraichain-token',
      coinImageUrl:
        'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
    },
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config('orai'),
    get currencies() {
      return [this.stakeCurrency];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    gasPriceStep: {
      low: 0.003,
      average: 0.005,
      high: 0.007
    },
    features: ['stargate', 'no-legacy-stdTx', 'ibc-transfer', 'cosmwasm'],
    chainSymbolImageUrl: 'https://orai.io/images/logos/logomark-dark.png',
    txExplorer: {
      name: 'Oraiscan',
      txUrl: 'https://testnet.scan.orai.io/txs/{txHash}',
      accountUrl: 'https://testnet.scan.orai.io/account/{address}'
    },
    beta: true // use v1beta1
  },
  {
    chainId: 'oraibridge-subnet-2',
    chainName: 'OraiBridge',
    rpc: 'https://bridge-v2.rpc.orai.io',
    rest: 'https://bridge-v2.lcd.orai.io',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'ORAIB',
      coinMinimalDenom: 'uoraib',
      coinDecimals: 6
    },
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config('oraib'),
    // List of all coin/tokens used in this chain.
    get currencies() {
      return [
        this.stakeCurrency,
        {
          coinDenom: 'BEP20 ORAI',
          coinMinimalDenom: 'oraib0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0',
          coinDecimals: 18,
          coinGeckoId: 'oraichain-token',
          coinImageUrl:
            'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
        },
        {
          coinDenom: 'BEP20 AIRI',
          coinMinimalDenom: 'oraib0x7e2A35C746F2f7C240B664F1Da4DD100141AE71F',
          coinDecimals: 18,
          coinGeckoId: 'airight',
          coinImageUrl: 'https://i.ibb.co/m8mCyMr/airi.png'
        },
        {
          coinDenom: 'BEP20 KWT',
          coinMinimalDenom: 'oraib0x257a8d1E03D17B8535a182301f15290F11674b53',
          coinDecimals: 18,
          coinGeckoId: 'kawaii-islands',
          coinImageUrl:
            'https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png'
        },
        {
          coinDenom: 'BEP20 USDT',
          coinMinimalDenom: 'oraib0x55d398326f99059fF775485246999027B3197955',
          coinDecimals: 18,
          coinGeckoId: 'tether',
          coinImageUrl:
            'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
        }
      ];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    gasPriceStep: {
      low: 0,
      average: 0,
      high: 0
    },
    features: ['stargate', 'ibc-transfer', 'cosmwasm']
  },
  {
    rpc: 'https://tendermint1.kawaii.global',
    // evmRpc: 'https://endpoint1.kawaii.global',
    rest: 'https://cosmos1.kawaii.global',
    chainId: 'kawaii_6886-1',
    networkType: 'cosmos',
    chainName: 'Kawaiiverse Cosmos',
    stakeCurrency: {
      coinDenom: 'ORAIE',
      coinMinimalDenom: 'oraie',
      coinDecimals: 18,
      coinGeckoId: 'oraie'
    },
    bip44: {
      coinType: 60
    },
    bech32Config: Bech32Address.defaultBech32Config('oraie'),
    get currencies() {
      return [this.stakeCurrency];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    gasPriceStep: {
      low: 0,
      average: 0.000025,
      high: 0.00004
    },
    // features: ['ibc-transfer', 'ibc-go', 'stargate']
    features: ['stargate', 'ibc-transfer', 'cosmwasm', 'no-legacy-stdTx']
  },
  {
    rpc: 'https://tendermint1.kawaii.global',
    rest: 'https://endpoint1.kawaii.global',
    chainId: '0x1ae6',
    networkType: 'evm',
    chainName: 'Kawaiiverse EVM',
    stakeCurrency: {
      coinDenom: 'ORAIE',
      coinMinimalDenom: 'oraie',
      coinDecimals: 18,
      coinGeckoId: 'oraie'
    },
    bip44: {
      coinType: 60
    },
    coinType: 60,
    bech32Config: Bech32Address.defaultBech32Config('oraie'),
    get currencies() {
      return [this.stakeCurrency];
    },
    get feeCurrencies() {
      return [this.stakeCurrency];
    },
    gasPriceStep: {
      low: 0,
      average: 0.000025,
      high: 0.00004
    },
    features: ['isEvm']
  },
  {
    rpc: 'https://rpc-cosmoshub.keplr.app',
    rest: 'https://lcd-cosmoshub.keplr.app',
    chainId: 'cosmoshub-4',
    chainName: 'Cosmos Hub',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinDecimals: 6,
      coinGeckoId: 'cosmos',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png'
    },
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config('cosmos'),
    currencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png'
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png'
      }
    ],
    coinType: 118,
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.04
    },
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/cosmos/txs/{txHash}'
    }
  },

  {
    rpc: 'https://rpc-osmosis.keplr.app',
    rest: 'https://lcd-osmosis.keplr.app',
    chainId: 'osmosis-1',
    chainName: 'Osmosis',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png'
    },
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config('osmo'),
    currencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png'
      },
      {
        coinDenom: 'ION',
        coinMinimalDenom: 'uion',
        coinDecimals: 6,
        coinGeckoId: 'ion',
        coinImageUrl:
          'https://dhj8dql1kzq2v.cloudfront.net/white/osmosis-ion.png'
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png'
      }
    ],
    coinType: 118,
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.04
    },
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png',
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/osmosis/txs/{txHash}'
    }
  },
  {
    rpc: 'https://rpc-juno.keplr.app',
    rest: 'https://lcd-juno.keplr.app',
    chainId: 'juno-1',
    chainName: 'Juno',
    networkType: 'cosmos',
    stakeCurrency: {
      coinDenom: 'JUNO',
      coinMinimalDenom: 'ujuno',
      coinDecimals: 6,
      coinGeckoId: 'juno-network',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/juno.png'
    },
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config('juno'),
    currencies: [
      {
        coinDenom: 'JUNO',
        coinMinimalDenom: 'ujuno',
        coinDecimals: 6,
        coinGeckoId: 'juno-network',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/juno.png'
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'JUNO',
        coinMinimalDenom: 'ujuno',
        coinDecimals: 6,
        coinGeckoId: 'juno-network',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/juno.png'
      }
    ],
    gasPriceStep: {
      low: 0.001,
      average: 0.0025,
      high: 0.004
    },
    features: [
      'stargate',
      'no-legacy-stdTx',
      'cosmwasm',
      'ibc-transfer',
      'ibc-go'
    ],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/juno.png',
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/juno/txs/{txHash}'
    }
  },

  // {
  //   rest: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  //   evmRpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  //   chainId: "0x61",
  //   chainName: "BNB Chain Testnet",
  //   bip44: {
  //     coinType: 60,
  //   },
  //   coinType: 60,
  //   stakeCurrency: {
  //     coinDenom: "BNB",
  //     coinMinimalDenom: "bnb",
  //     coinDecimals: 18,
  //     coinGeckoId: "bnb",
  //     coinImageUrl:
  //       "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
  //   },
  //   bech32Config: Bech32Address.defaultBech32Config("evmos"),
  //   networkType: "evm",
  //   currencies: [
  //     {
  //       coinDenom: "BNB",
  //       coinMinimalDenom: "bnb",
  //       coinDecimals: 18,
  //       coinGeckoId: "bnb",
  //       coinImageUrl:
  //         "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
  //     },
  //     {
  //       coinDenom: "ORAI",
  //       coinMinimalDenom:
  //         "erc20:0x41E76b3b0Da96c14c4575d9aE96d73Acb6a0B903:Oraichain Token",
  //       coinDecimals: 18,
  //       coinGeckoId: "oraichain-token",
  //       coinImageUrl:
  //         "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
  //     },
  //     {
  //       coinDenom: "AIRI",
  //       coinMinimalDenom:
  //         "erc20:0x7e2a35c746f2f7c240b664f1da4dd100141ae71f:aiRight Token",
  //       coinDecimals: 18,
  //       coinGeckoId: "airight",
  //       coinImageUrl:
  //         "https://s2.coinmarketcap.com/static/img/coins/64x64/11563.png",
  //     },
  //     {
  //       coinDenom: "KWT",
  //       coinMinimalDenom:
  //         "erc20:0x257a8d1e03d17b8535a182301f15290f11674b53:Kawaii Islands",
  //       coinDecimals: 18,
  //       coinGeckoId: "kawaii-islands",
  //       coinImageUrl:
  //         "https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png",
  //     },
  //   ],
  //   feeCurrencies: [
  //     {
  //       coinDenom: "BNB",
  //       coinMinimalDenom: "bnb",
  //       coinDecimals: 18,
  //       coinGeckoId: "bnb",
  //       coinImageUrl:
  //         "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
  //     },
  //   ],
  //   gasPriceStep: {
  //     low: 10000000000,
  //     average: 25000000000,
  //     high: 40000000000,
  //   },
  //   features: ["isEvm"],
  //   txExplorer: {
  //     name: "Bsc Scan Testnet",
  //     txUrl: "https://testnet.bscscan.com/tx/${txHash}",
  //     accountUrl: "https://testnet.bscscan.com/address/{address}",
  //   },
  // },
  {
    rest: 'https://rpc.ankr.com/eth',
    chainId: '0x01',
    chainName: 'Ethereum',
    bip44: {
      coinType: 60
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: 'ETH',
      coinMinimalDenom: 'eth',
      coinDecimals: 18,
      coinGeckoId: 'ethereum',
      coinImageUrl:
        'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
    },
    bech32Config: Bech32Address.defaultBech32Config('evmos'),
    networkType: 'evm',
    currencies: [
      {
        coinDenom: 'ETH',
        coinMinimalDenom: 'eth',
        coinDecimals: 18,
        coinGeckoId: 'ethereum',
        coinImageUrl:
          'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
      },
      {
        coinDenom: 'ORAI',
        coinMinimalDenom:
          'erc20:0x4c11249814f11b9346808179cf06e71ac328c1b5:Oraichain Token',
        coinDecimals: 18,
        coinGeckoId: 'oraichain-token',
        coinImageUrl:
          'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
      }
    ],
    get feeCurrencies() {
      return this.currencies;
    },
    gasPriceStep: {
      low: 10000000000,
      average: 25000000000,
      high: 40000000000
    },
    features: ['ibc-go', 'stargate', 'isEvm'],
    txExplorer: {
      name: 'Etherscan',
      txUrl: 'https://etherscan.io/tx/{txHash}',
      accountUrl: 'https://etherscan.io/address/{address}'
    }
  },
  {
    rest: 'https://bsc-dataseed1.ninicoin.io',
    chainId: '0x38',
    chainName: 'BNB Chain',
    bip44: {
      coinType: 60
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: 'BNB',
      coinMinimalDenom: 'bnb',
      coinDecimals: 18,
      coinGeckoId: 'binancecoin',
      coinImageUrl:
        'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
    },
    bech32Config: Bech32Address.defaultBech32Config('evmos'),
    networkType: 'evm',
    currencies: [
      {
        coinDenom: 'BNB',
        coinMinimalDenom: 'bnb',
        coinDecimals: 18,
        coinGeckoId: 'binancecoin',
        coinImageUrl:
          'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
      },
      {
        coinDecimals: 18,
        coinDenom: 'USDT',
        coinMinimalDenom:
          'erc20:0x55d398326f99059fF775485246999027B3197955:USDT',
        contractAddress: '0x55d398326f99059fF775485246999027B3197955',
        type: 'erc20',
        coinGeckoId: 'tether'
      },
      {
        coinDenom: 'ORAI',
        coinMinimalDenom:
          'erc20:0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0:Oraichain Token',
        coinDecimals: 18,
        coinGeckoId: 'oraichain-token',
        coinImageUrl:
          'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
      },
      {
        coinDenom: 'AIRI',
        coinMinimalDenom:
          'erc20:0x7e2a35c746f2f7c240b664f1da4dd100141ae71f:aiRight Token',
        coinDecimals: 18,
        coinGeckoId: 'airight',
        coinImageUrl:
          'https://s2.coinmarketcap.com/static/img/coins/64x64/11563.png'
      },
      {
        coinDenom: 'KWT',
        coinMinimalDenom:
          'erc20:0x257a8d1e03d17b8535a182301f15290f11674b53:Kawaii Islands',
        coinDecimals: 18,
        coinGeckoId: 'kawaii-islands',
        coinImageUrl:
          'https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png'
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'BNB',
        coinMinimalDenom: 'bnb',
        coinDecimals: 18,
        coinGeckoId: 'binancecoin',
        coinImageUrl:
          'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
      }
    ],
    gasPriceStep: {
      low: 10000000000,
      average: 25000000000,
      high: 40000000000
    },
    features: ['ibc-go', 'stargate', 'isEvm'],
    txExplorer: {
      name: 'Bsc Scan',
      txUrl: 'https://bscscan.com/tx/${txHash}',
      accountUrl: 'https://bscscan.com/address/{address}'
    }
  }
  // {
  //   rest: 'https://bsc-dataseed1.ninicoin.io',
  //   evmRpc: 'https://bsc-dataseed1.ninicoin.io',
  //   chainId: '56',
  //   chainName: 'BNB Chain\n(Coming soon)',
  //   bip44: {
  //     coinType: 60
  //   },
  //   stakeCurrency: {
  //     coinDenom: 'BNB',
  //     coinMinimalDenom: 'bnb',
  //     coinDecimals: 18,
  //     coinGeckoId: 'bnb',
  //     coinImageUrl:
  //       'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
  //   },
  //   bech32Config: Bech32Address.defaultBech32Config('evmos'),
  //   networkType: 'evm',
  //   currencies: [
  //     {
  //       coinDenom: 'BNB',
  //       coinMinimalDenom: 'bnb',
  //       coinDecimals: 18,
  //       coinGeckoId: 'bnb',
  //       coinImageUrl:
  //         'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
  //     },
  //     {
  //       coinDenom: 'ORAI',
  //       coinMinimalDenom:
  //         'erc20:0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0:Oraichain Token',
  //       coinDecimals: 18,
  //       coinGeckoId: 'oraichain-token',
  //       coinImageUrl:
  //         'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
  //     },
  //     {
  //       coinDenom: 'AIRI',
  //       coinMinimalDenom:
  //         'erc20:0x7e2a35c746f2f7c240b664f1da4dd100141ae71f:aiRight Token',
  //       coinDecimals: 18,
  //       coinGeckoId: 'airight',
  //       coinImageUrl:
  //         'https://s2.coinmarketcap.com/static/img/coins/64x64/11563.png'
  //     },
  //     {
  //       coinDenom: 'KWT',
  //       coinMinimalDenom:
  //         'erc20:0x257a8d1e03d17b8535a182301f15290f11674b53:Kawaii Islands',
  //       coinDecimals: 18,
  //       coinGeckoId: 'kawaii-islands',
  //       coinImageUrl:
  //         'https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png'
  //     }
  //   ],
  //   feeCurrencies: [
  //     {
  //       coinDenom: 'BNB',
  //       coinMinimalDenom: 'bnb',
  //       coinDecimals: 18,
  //       coinGeckoId: 'bnb',
  //       coinImageUrl:
  //         'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
  //     }
  //   ],
  //   gasPriceStep: {
  //     low: 10000000000,
  //     average: 25000000000,
  //     high: 40000000000
  //   },
  //   features: [],
  //   txExplorer: {
  //     name: 'Bsc Scan',
  //     txUrl: 'https://bscscan.com/tx/${txHash}',
  //     accountUrl: 'https://bscscan.com/address/{address}'
  //   }
  // }
];

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = [
  'https://app.osmosis.zone',
  'https://oraidex.io'
];

// tracking ads
export const AmplitudeApiKey = '879f08e23ff5926be676c19157bc4fd4';

// default thumbnails for fix address
export const ValidatorThumbnails: { [key: string]: string } = {
  oraivaloper1mxqeldsxg60t2y6gngpdm5jf3k96dnju5el96f:
    'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png',
  oraivaloper1h89umsrsstyeuet8kllwvf2tp630n77aymck78:
    'https://res.cloudinary.com/oraichain/image/upload/v1645501963/stakeWithOraiKingLogo.jpg',
  oraivaloper1xesqr8vjvy34jhu027zd70ypl0nnev5euy9nyl:
    'https://res.cloudinary.com/oraichain/image/upload/v1645432916/synergy.jpg',
  oraivaloper1uhcwtfntsvk8gpwfxltesyl4e28aalmq9v9z0x:
    'https://res.cloudinary.com/dcpwvhglr/image/upload/v1611912662/Superman_4_-_SAL_L_nwykie.jpg',
  oraivaloper1cp0jml5fxkdvmajcwvkue9d0sym6s0vqly88hg:
    'https://res.cloudinary.com/oraichain/image/upload/v1645501939/stakement_orai_explorer.jpg',
  oraivaloper1u2344d8jwtsx5as7u5jw7vel28puh34q7d3y64:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502101/titan.jpg',
  oraivaloper130jsl66rgss6eq7qur02yfr6tzppdvxglz7n7g:
    'https://res.cloudinary.com/oraichain/image/upload/v1645501772/vaiot.png',
  oraivaloper14nz2pqskfv9kcez8u0a9gnnsgwjerzqxpmne0y:
    'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png',
  oraivaloper16e6cpk6ycddk6208fpaya7tmmardhvr7h40yqy:
    'https://res.cloudinary.com/c-ng-ty-c-ph-n-rikkeisoft/image/upload/v1616749893/photo_2021-03-25_18-39-37_tqfsof.jpg',
  oraivaloper12ru3276mkzuuay6vhmg3t6z9hpvrsnplm2994n:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502148/binnostakeLogo.png',
  oraivaloper1kh9vejqxqqccavtv2nf683mx0z85mfpd7q566q:
    'https://res.cloudinary.com/c-ng-ty-c-ph-n-rikkeisoft/image/upload/v1616994377/lux_logo_small_1_nvwpdi.png',
  oraivaloper109vcny07r3waj9sld4ejasjyal0rudskeax7uc:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502209/chandraLogo.png',
  oraivaloper13ckyvg0ah9vuujtd49yner2ky92lej6nwjvrjv:
    'https://res.cloudinary.com/oraichain/image/upload/v1645501901/antOraiLogo.jpg',
  oraivaloper1xsptthm2ylfw0salut97ldfan2jt032nye7s00:
    'https://images.airight.io/validator/62641351385ee5000118de9e.png',
  oraivaloper1f6q9wjn8qp3ll8y8ztd8290vtec2yxyxxygyy2:
    'https://res.cloudinary.com/oraichain/image/upload/v1646573946/Blockval.png',
  oraivaloper1h9gg3xavqdau6uy3r36vn4juvzsg0lqvszgtvc:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502659/dime.jpg',
  oraivaloper1yc9nysml8dxy447hp3aytr0nssr9pd9a47l7gx:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502169/oraiBotValidatorLogo.png',
  oraivaloper1mrv57zj3dpfyc9yd5xptnz2tqfez9fss4c9r85:
    'https://images.airight.io/validator/62555944385ee500012733f0.png',
  oraivaloper1v26tdegnk79edw7xkk2xh8qn89vy6qej6yhsev:
    'https://res.cloudinary.com/oraichain/image/upload/v1645502256/TrinityLogo.jpg',
  oraivaloper17zr98cwzfqdwh69r8v5nrktsalmgs5sa83gpd9:
    'https://images.airight.io/validator/623c45bd385ee50001437260.png',
  oraivaloper1qv5jn7tueeqw7xqdn5rem7s09n7zletreera88:
    'https://images.airight.io/validator/626d483a385ee5000162832e.png',
  oraivaloper10z9f6539v0ge78xlm4yh7tddrvw445s6d7s2xq:
    'https://images.airight.io/validator/627565f6385ee5000181e778.JPG',
  oraivaloper1ch3ewye24zm094ygmxu5e4z7d0xre3vhthctpn:
    'https://images.airight.io/validator/62686b04385ee5000162832c.jpg',
  oraivaloper1m2d5uhr65p9vvlw2w29kajud5q529a76v22wyu:
    'https://images.airight.io/validator/626c1920385ee5000162832d.jpg',
  oraivaloper1ucx0gm8kca2zvyr9d39z249j62y2t8r0rwtmr6:
    'https://res.cloudinary.com/oraichain/image/upload/v1646034968/strong_node.jpg',
  oraivaloper1g0hmvzs76akv6802x0he6ladjnftp94ygsf2lc:
    'https://images.airight.io/validator/627231c8385ee5000162832f.png',
  oraivaloper1rqq57xt5r5pnuguffcrltnvkul7n0jdxxdgey0:
    'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png',
  oraivaloper1asz5wl5c2xt8y5kyp9r04v54zh77pq90qar7e8:
    'https://images.airight.io/validator/62729055385ee50001499911.png',
  oraivaloper1djm07np8dzyg4et3d7dqtr3692l80nggvl0edh:
    'https://images.airight.io/validator/625522ca385ee50001b67f29.png',
  oraivaloper14vcw5qk0tdvknpa38wz46js5g7vrvut8ku5kaa:
    'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
};
