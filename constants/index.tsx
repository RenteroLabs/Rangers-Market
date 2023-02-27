import { chain, Chain } from 'wagmi'
import { GameItem, TokenInfo } from '../types'
import { AXE_NFT_BSC_TEST, AXE_RANGERS_NFT, HERO_NFT_BSC_TEST, Ropsten_721_AXE_NFT, SHIP_NFT_BSC_TEST } from './contractABI'
import { ETH_ICON, RANGERS_ICON, POLYGON_ICON, SUPPORT_TOKEN_ICONS } from './static'

export const CHAIN_ICON: Record<number, string> = {
  1: ETH_ICON,
  5: ETH_ICON,
  137: '../polygon-matic-logo.svg',
  56: POLYGON_ICON,
  97: POLYGON_ICON,
  9527: RANGERS_ICON,
  2025: RANGERS_ICON
}

const BSC_CHAIN: Chain = {
  id: 56,
  name: 'BNB Chain',
  network: 'Binance Smart Chain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB'
  },
  rpcUrls: {
    default: 'https://bsc-dataseed1.binance.org',
  },
  blockExplorers: {
    default: {
      name: "BscScan",
      url: "https://bscscan.com/"
    }
  },
  testnet: false
}

const BSC_TEST: Chain = {
  id: 97,
  name: 'BSC Test',
  network: 'Binance Smart Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tBNB',
    symbol: 'tBNB'
  },
  rpcUrls: {
    default: 'https://data-seed-prebsc-1-s1.binance.org:8545'
  },
  blockExplorers: {
    default: {
      name: 'BscScan Test',
      url: "https://testnet.bscscan.com"
    }
  }
}

export const RANGERS_TEST_CHAIN: Chain = {
  id: 9527,
  name: 'RangersTest',
  network: "Rangers Robin testnet",
  nativeCurrency: {
    name: "RPG",
    symbol: "RPG",
    decimals: 18
  },
  rpcUrls: {
    default: "https://robin.rangersprotocol.com/api/jsonrpc"
  },
  blockExplorers: {
    default: {
      name: "RangerProtocol Scan",
      url: "https://robin-rangersscan.rangersprotocol.com/"
    }
  },
  testnet: true
}

export const RANGERS_CHAIN: Chain = {
  id: 2025,
  name: 'Rangers',
  network: "Rangers Protocol",
  nativeCurrency: {
    name: "RPG",
    symbol: "RPG",
    decimals: 18
  },
  rpcUrls: {
    default: "https://mainnet.rangersprotocol.com/api/jsonrpc"
  },
  blockExplorers: {
    default: {
      name: "RangerProtocol Scan",
      url: "https://scan.rangersprotocol.com/"
    }
  },
  testnet: true
}



// TODO: 后续需把其中的测试网移除
const MAIN_NETWORK: Chain[] = [
  // chain.mainnet,
  // chain.goerli,
  // BSC_CHAIN,
  // BSC_TEST,
  RANGERS_CHAIN,
  // RANGERS_TEST_CHAIN
]

const ALL_NETWORK: Chain[] = [
  // chain.mainnet,
  // chain.goerli,
  // BSC_CHAIN,
  // BSC_TEST,
  // RANGERS_CHAIN,
  RANGERS_TEST_CHAIN
]

export const SUPPORT_CHAINS =
  process.env.NEXT_PUBLIC_ENV === 'PROD' ?
    MAIN_NETWORK : ALL_NETWORK


type EtherscanChains = "mainnet" | "ropsten" | "rinkeby" | "goerli" | "kovan" | "optimism" | "optimismKovan" | "polygon" | "polygonMumbai" | "arbitrum" | "arbitrumRinkeby"
export const CHAIN_NAME: Record<number, EtherscanChains> = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  5: "goerli",
  137: 'polygon'
}

// service for thegraph chain value
export const CHAIN_ID_MAP: Record<string | number, number | string> = {
  "rinkeby": 4,
  "goerli": 5,
  "bsc-testnet": 97,
  "bsc": 56,
  "rpg-testnet": 9527,
  4: 'rinkeby',
  5: "goerli",
  97: 'bsc-testnet',
  56: 'bsc',
  9527: 'rpg-testnet',
}

export const ALCHEMY_POLYGON_URL = `https://polygon-mainnet.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
export const ALCHEMY_ETHEREUM_URL = `https://eth-mainnet.alchemyapi.io/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
export const ALCHEMY_ROPSTEN_URL = `https://eth-ropsten.alchemyapi.io/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
export const ALCHEMY_RINKEBY_URL = `https://eth-rinkeby.alchemyapi.io/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`


// 后端 metadata 服务地址
export const METADATA_SERVICE = "https://metadata.rentero.io"

// backend api service
const DEV_BASEAPI = 'https://devapi.rentero.io'
const TEST_BASEAPI = 'https://api.rentero.io' // production api
export const BaseURL = process.env.NEXT_PUBLIC_ENV === 'PROD' ? TEST_BASEAPI : DEV_BASEAPI


export const ZERO_ADDRESS: string = '0x0000000000000000000000000000000000000000'

export const DEFAULT_LEND_TRIAL_MODEL_DAYS = 30

export const MAX_RENTABLE_DAYS = 2 ** 16 - 1 // 65535
export const MIN_RENTABLE_DAYS = 1

export const AVAILABEL_DATE_FORMAT = "MM-DD-YYYY"
export const ONEDAY = 24 * 60 * 60

const ETH_USDT = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const ETH_USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const ETH_DAI = '0x6b175474e89094c44da98b954eedeac495271d0f'

const DEV_TOKEN = '0xebaee8e37dae9e95e6ff7a8242d9c958c8d312eb'

const BSC_USDT = '0x55d398326f99059ff775485246999027b3197955'
const BSC_USDC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const BSC_BUSD = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
const BSC_DAI = '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'

const BSC_DEV_TOKEN = '0x304af20ef7a8497aeed4a4a6ba4601988d5b11f6'

export const RANGERS_DEV_TOKEN = "0x55b4c4ee5e4c2db29177cb919572e5127a302963"

const RANGERS_DEV_MIX_TOKEN = "0xb895607bee24aa62ca090ce0445a1893e70ee5a0"

export const TOKEN_LIST: Record<string, TokenInfo> = {
  'ETH-USDT': {
    name: 'ETH-USDT',
    address: ETH_USDT,
    logo: SUPPORT_TOKEN_ICONS['USDT'],
    decimal: 6
  },
  'ETH-USDC': {
    name: 'ETH-USDC',
    address: ETH_USDC,
    logo: SUPPORT_TOKEN_ICONS['USDC'],
    decimal: 6
  },
  'ETH-DAI': {
    name: 'ETH-DAI',
    address: ETH_DAI,
    logo: SUPPORT_TOKEN_ICONS['DAI'],
    decimal: 18
  },
  'ETH-WETH': {
    name: 'ETH-WETH',
    address: DEV_TOKEN,
    logo: SUPPORT_TOKEN_ICONS["WETH"],
    decimal: 18
  },
  "BSC-USDT": {
    name: 'BSC-USDT',
    address: BSC_USDT,
    logo: SUPPORT_TOKEN_ICONS['USDT'],
    decimal: 18,
  },
  "BSC-USDC": {
    name: 'BSC-USDC',
    address: BSC_USDC,
    logo: SUPPORT_TOKEN_ICONS['USDC'],
    decimal: 18
  },
  "BSC-BUSD": {
    name: 'BSC-BUSD',
    address: BSC_BUSD,
    logo: SUPPORT_TOKEN_ICONS['BUSD'],
    decimal: 18,
  },
  "BSC-DAI": {
    name: 'BSC-DAi',
    address: BSC_DAI,
    logo: SUPPORT_TOKEN_ICONS['DAI'],
    decimal: 18
  },
  "BSC-DEV": {
    name: 'BSC-DEV',
    address: BSC_DEV_TOKEN,
    logo: SUPPORT_TOKEN_ICONS["WETH"],
    decimal: 18,
  },
  "RPG-DEV": {
    name: "RPG-DEV",
    address: RANGERS_DEV_TOKEN,
    logo: SUPPORT_TOKEN_ICONS["WETH"],
    decimal: 18,
  },
  "RPG-DEVMIX": {
    name: "RPG-DEVMIX",
    address: RANGERS_DEV_MIX_TOKEN,
    logo: SUPPORT_TOKEN_ICONS['MIX'],
    decimal: 18
  }
}

export const SUPPORT_TOKENS: Record<number, TokenInfo[]> = {
  1: [ // ethereum mainnet
    TOKEN_LIST['ETH-USDT'],
    TOKEN_LIST['ETH-USDC'],
    TOKEN_LIST['ETH-DAI'],
  ],
  4: [ // rinkeby testnet
    TOKEN_LIST['ETH-WETH'],
  ],
  5: [
    TOKEN_LIST['ETH-WETH'],
  ],
  56: [ // BSC 
    TOKEN_LIST['BSC-USDT'],
    TOKEN_LIST['BSC-USDC'],
    TOKEN_LIST['BSC-BUSD'],
    TOKEN_LIST['BSC-DAI'],
  ],
  97: [ // BSC testnet
    TOKEN_LIST['BSC-DEV'],
  ],
  9527: [
    TOKEN_LIST['RPG-DEV'],
    TOKEN_LIST['RPG-DEVMIX']
  ]
}

export const ADDRESS_TOKEN_MAP: Record<string, TokenInfo> = {
  [ETH_USDT]: TOKEN_LIST['ETH-USDT'],
  [ETH_USDC]: TOKEN_LIST['ETH-USDC'],
  [ETH_DAI]: TOKEN_LIST['ETH_DAI'],
  [DEV_TOKEN]: TOKEN_LIST['ETH-WETH'],
  [BSC_USDT]: TOKEN_LIST['BSC-USDT'],
  [BSC_USDC]: TOKEN_LIST['BSC-USDC'],
  [BSC_BUSD]: TOKEN_LIST['BSC-BUSD'],
  [BSC_DAI]: TOKEN_LIST['BSC-DAI'],
  [BSC_DEV_TOKEN]: TOKEN_LIST['BSC-DEV'],
  [RANGERS_DEV_TOKEN]: TOKEN_LIST['RPG-DEV'],
  [RANGERS_DEV_MIX_TOKEN]: TOKEN_LIST["RPG-DEVMIX"]
}

export const DEPOSIT_DAYS = 1



// game info
export const NFT_COLLECTIONS: Record<string, string> = {
  "0x26aa590dd520cec0f6638f59ebd4e93f9287448b": "Axe Game",
  "0x340280c7874d90ff0372b63dc674c5bf25275ed1": "Axe Game",
  "0x80b4a4da97d676ee139bada2bf757b7f5afd0644": "Fork Azuik",
  "0x317caec5afd5d43b205683318ec35ed8b063d131": "Metaline Ships",
  "0x6fe2bd1c050f439705ecbf98130d7c9c784bbfd6": 'Metaline Heroes',
  "0x7e2997174d717b15fe029954ad1f380c5eb23169": "Axe Game",
  "0x9ee72a87d3bed794616ab4a0ad28a25732cac0c1": "Axe Game | Goerli",
  "0x6aadfe9441c35645d452bc7050cd53e43d104c18": "Axe Game | Rangers",
  "0x6f71dd919192eedc50cd40177b5f7de51aa30d3c": "DeHero Heroes"
}

export const GAME_LOGOS: Record<string, string> = {
  '0': '/rentero_logo_big.png',
  "1": '/metaline_logo.png',
  "2": "https://rentero-resource.s3.ap-east-1.amazonaws.com/dehero_logo.png"
}


export const GAME_NAMES: Record<string, string> = {
  METALINE: 'Metaline',
  DEHERO: "DeHeroGame"
}



export const GAME_CONTRACTS = [
  [Ropsten_721_AXE_NFT],
  [
    SHIP_NFT_BSC_TEST,
    HERO_NFT_BSC_TEST
  ],
  [
    AXE_RANGERS_NFT
  ]
]



// SUPPORT LEND GAMES
export const GameList: GameItem[] = [
  // {
  //   gameName: 'Axe Game',
  //   gameDesc: 'A true play to earn game, get money and fun in bear market',
  //   gameCover: 'https://tva1.sinaimg.cn/large/e6c9d24egy1h3nrmn495jj209804mt8t.jpg',
  //   gameLogo: 'https://tva1.sinaimg.cn/large/e6c9d24egy1h3yth290wij20690693yk.jpg',
  //   gameStatus: 0,
  //   gameNFTCollection: GAME_CONTRACTS[0],
  //   chainId: 5,
  // },
  // {
  //   gameName: 'Metaline',
  //   gameDesc: '',
  //   gameCover: 'https://tva1.sinaimg.cn/large/e6c9d24ely1h5q1t0tvhbj215o0dw0w8.jpg',
  //   gameLogo: 'https://tva1.sinaimg.cn/large/e6c9d24ely1h5r8cixvgzj208c08ct8x.jpg',
  //   gameStatus: 0,
  //   gameNFTCollection: GAME_CONTRACTS[1],
  //   chainId: 97
  // },
  {
    gameName: 'DeHeroGame',
    gameDesc: "Probably the most profitable NFT project",
    gameCover: "https://rentero-resource.s3.ap-east-1.amazonaws.com/dehero_cover.png",
    gameLogo: "https://rentero-resource.s3.ap-east-1.amazonaws.com/dehero_logo.png",
    gameStatus: 0,
    gameNFTCollection: GAME_CONTRACTS[2],
    chainId: 9527
  }
]





export const MORALIS_SUPPORT_CHAINS: number[] = [1, 5, 11155111, 137, 80001, 56, 97, 43114, 43113, 250, 25, 338]




export const UNIPASS_CONNECTOR = 'Unipass'