import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/layout'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import AppTheme from '../theme'
import Head from 'next/head'

import { WagmiConfig, configureChains, createClient } from 'wagmi'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { SUPPORT_CHAINS } from '../constants'
import { NextPage } from 'next/types'
import type { ReactElement, ReactNode } from 'react'
import Layout2 from '../components/layout2'
import { ApolloProvider } from '@apollo/client'
import { goerliGraph } from '../services/graphql'

import { NextAdapter } from 'next-query-params';
import { QueryParamProvider } from 'use-query-params';

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID

const { chains, provider, webSocketProvider } = configureChains(SUPPORT_CHAINS, [
  infuraProvider({ infuraId }),
  publicProvider()
])

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains,
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true
      }
    })
  ],
  provider,
  webSocketProvider
})

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {

  return <ThemeProvider theme={AppTheme}>
    <StyledEngineProvider injectFirst>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <CssBaseline />
      <QueryParamProvider adapter={NextAdapter}>
        <WagmiConfig client={client}>
          <ApolloProvider client={goerliGraph}>
            <Layout2><Component {...pageProps} /></Layout2>
          </ApolloProvider>
        </WagmiConfig>
      </QueryParamProvider>
    </StyledEngineProvider>
  </ThemeProvider>
}

export default MyApp
