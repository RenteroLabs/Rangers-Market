import { useEffect } from 'react';
import { UniPassPopupSDK } from '@unipasswallet/popup-sdk';
import { useState } from 'react';

const useUnipass = () => {
  const [unipass, setUnipass] = useState<UniPassPopupSDK>()

  useEffect(() => {
    (async () => {
      const unipass = await new UniPassPopupSDK({
        env: 'test',
        chainType: 'rangers',
        appSettings: {
          appName: "UniPass Wallet Demo",
          appIcon: "https://tva1.sinaimg.cn/large/008vxvgGly1h8xeyjk26rj303o03oglg.jpg",
        },
      })
      setUnipass(unipass)
    })()
  }, [])

  return unipass
}

export default useUnipass