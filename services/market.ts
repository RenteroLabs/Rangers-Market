
import { BaseURL } from '../constants'
import qs from 'qs'

export const getGameInfos = async () => {
  const data = await fetch(`${BaseURL}/home/game/list`, { mode: 'cors' })
  return data.json()
}

interface NFTListParams {
  pageIndex: number,
  pageSize?: number,
  whiteAddress?: boolean
  mode?: 'FreeTrial' | 'Dividend',
  token?: any;
}
export const getMarketNFTList = async (params: NFTListParams) => {
  const { token, ...restParams } = params
  const headerToken = {
    sessionToken: token
  }
  const data = await fetch(`${BaseURL}/market/list?${qs.stringify(restParams)}`, {
    headers: token ? headerToken : {}
  })
  return data.json()
}


interface NFTInfoParams {
  tokenId: number,
  contractAddress: string
}
export const getNFTInfo = async (params: NFTInfoParams) => {
  const { tokenId, contractAddress } = params
  const data = await fetch(`${BaseURL}/nft/info?address=${contractAddress}&tokenId=${tokenId}`)

  return data.json()
}


interface MoralisNFTINFOParams {
  tokenId: number,
  contractAddress: string,
  chainId: string | number 
}
export const getNFTInfoByMoralis = async (params: MoralisNFTINFOParams) => {
  const { tokenId, contractAddress, chainId } = params
  const data = await fetch(`https://deep-index.moralis.io/api/v2/nft/${contractAddress}/${tokenId}?chain=${chainId}&format=decimal`, {
    headers: {
      "X-API-Key": "DewBAeYa9EmQh3WWko5vErjAEJjWysKjagsPJzxGIV3jV9XZuQ39MnPiUurtsSZj",
      "accept": "application/json"
    }
  })

  return data.json()
}