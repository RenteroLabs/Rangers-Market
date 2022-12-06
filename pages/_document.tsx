import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default class AppDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          <link rel="icon" href='/favicon.ico' />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
          />
          <link rel="preload" href="/font/Agrandir-GrandHeavy.otf" type="font/otf" as="font" crossOrigin="anonymous" />
          <link rel="preload" href="/font/MonumentExtended.otf" type="font/otf" as="font" crossOrigin="anonymous" />

          <Script src="https://www.googletagmanager.com/gtag/js?id=G-RKM0TCB2X6" strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive" >
            {
              `
               window.dataLayer = window.dataLayer || [];
               function gtag(){dataLayer.push(arguments);}
               gtag('js', new Date());
   
               gtag('config', 'G-RKM0TCB2X6');
               `
            }
          </Script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}