import { ALCHEMY_ROPSTEN_URL, ALCHEMY_RINKEBY_URL } from "../constants"
import qs from 'qs'

const baseWeb3URL = ALCHEMY_RINKEBY_URL

/**
 * 获取指定地址的指定 NFT 数据
 * @param params 
 * @returns 
 */
export const web3GetNFTS = async (params: { owner: string, contractAddresses: string[] }) => {
  const data = await fetch(`${baseWeb3URL}/getNFTs?${qs.stringify(params, { arrayFormat: 'brackets' })}`)
  return data.json()
}

/**
 * 获取指定 NFT 的源数据
 * @param params 
 */
export const web3GetNFTMetadata = async (params: { contractAddress: string, tokenId: string | number, tokenType: string }) => {
  const data = await fetch(`${baseWeb3URL}/getNFTMetadata?${qs.stringify(params)}`)
  return data.json()
}