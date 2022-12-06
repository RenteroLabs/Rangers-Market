const testApi = 'https://robin-api.rangersprotocol.com'
const proApi = 'https://mainnet.rangersprotocol.com/api'

const baseApi = process.env.NEXT_PUBLIC_ENV === 'TEST' ? proApi : testApi

interface getNFTsParasm {
  account: string,
  contractAddress: string
}
export const getNFTsByAddressFromRangers = async ({ account, contractAddress }: getNFTsParasm) => {
  const params = {
    method: "Rangers_getNFTList",
    jsonrpc: "2.0",
    id: 1,
    params: [account, contractAddress]
  }

  const data = await fetch(`${baseApi}`, {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      "content-type": "application/json"
    }
  })
  return data.json()
}