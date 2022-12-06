

// short address length
export function formatAddress(address: string | undefined, length: number) {
  if (!address) return
  return `${address.substring(0, length + 2)}…${address.substring(
    address.length - length
  )}`
}

export function formatTokenId(tokenId: number | string, showCount?: number) {
  showCount = showCount || 3
  const tokenStr = String(tokenId)
  const leng = tokenStr.length
  if (leng <= 5) {
    return tokenId
  }
  const pre = tokenStr.slice(0, showCount)
  const suf = tokenStr.slice(leng - showCount)
  return `${pre}...${suf}`
}

export function dateFormat(fmt: string, date: Date) {
  let ret;
  const opt: Record<string, any> = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}

export function moralisData2NFTdata(list: Record<string, any>[]) {
  console.log(list)
  return list.map((nftItem) => {
    const item = nftItem._data
    const image = item?.metadata?.image || 'https://tva1.sinaimg.cn/large/e6c9d24egy1h3esgombq6j20m80m83yv.jpg'

    return {
      nftName: item?.name,
      nftNumber: item?.tokenId,
      nftAddress: item?.tokenAddress?._value,
      nftImage: image
    }
  })
}

export function rangersData2NFTdata(list: any[], contractAddress: string) {

  return list.map((item: Record<string, any>) => {
    return {
      nftName: item?.name,
      nftNumber: item?.tokenId,
      nftAddress: contractAddress,
      nftImage: item?.image
    }
  })
}