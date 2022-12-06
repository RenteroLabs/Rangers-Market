/** @type {import('next').NextConfig} */

const webpack = require('webpack')

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'tva1.sinaimg.cn',
      'ipfs.io',
      'gateway.pinata.cloud',
      's3.ap-east-1.amazonaws.com',
    ],
    loader: 'akamai',
    path: '',
    deviceSizes: [300]
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^electron$/,
    }),
  ],
}

module.exports = nextConfig
