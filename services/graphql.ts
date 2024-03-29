import { ApolloClient, InMemoryCache } from '@apollo/client'

// thegraph service address
const RINKEBY_THEGRAPH = 'https://rinkeby.rentero.io/subgraphs/name/john-rentero/rentero-market'
const BSC_TEST_THEGRAPH = 'https://bsc-testnet.rentero.io/subgraphs/name/john-rentero/rentero-market'
const GOERLI_THEGRAPH = "https://goerli.rentero.io/subgraphs/name/john-rentero/rentero-market"
const RANGERS_TEST_THEGRAPH = "https://rpg-testnet.rentero.io/subgraphs/name/john-rentero/rentero-market"
const RANGERS_THEGRAPH = "https://rpg.rentero.io/subgraphs/name/john-rentero/rentero-market"

const rinkebyGraph = new ApolloClient({
  uri: RINKEBY_THEGRAPH,
  cache: new InMemoryCache(),
  name: 'rinkeby',
})
const goerliGraph = new ApolloClient({
  uri: GOERLI_THEGRAPH,
  cache: new InMemoryCache(),
  name: 'goerli'
})
const bsctestGraph = new ApolloClient({
  uri: BSC_TEST_THEGRAPH,
  cache: new InMemoryCache(),
  name: 'bsc-testnet'
})
const rangersTestGraph = new ApolloClient({
  uri: RANGERS_TEST_THEGRAPH,
  cache: new InMemoryCache(),
  name: 'rpg-testnet'
})
const rangersGraph = new ApolloClient({
  uri: RANGERS_THEGRAPH,
  cache: new InMemoryCache(),
  name: 'rpg'
})

const RangersGraph = process.env.NEXT_PUBLIC_ENV === 'PROD' ? rangersGraph : rangersTestGraph

const GRAPH_SERVICE_MAP: Record<number, any> = {
  4: rinkebyGraph,
  5: goerliGraph,
  97: bsctestGraph,
  2025: rangersGraph,
  9527: rangersTestGraph,
}

export {
  rinkebyGraph,
  goerliGraph,
  bsctestGraph,
  rangersGraph,
  rangersTestGraph,
  RangersGraph,
  GRAPH_SERVICE_MAP
}