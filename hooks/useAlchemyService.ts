// import { useMemo } from 'react'
// // import { createAlchemyWeb3 } from "@alch/alchemy-web3";
// import { useNetwork } from 'wagmi';
// import { ALCHEMY_ETHEREUM_URL, ALCHEMY_POLYGON_URL, ALCHEMY_ROPSTEN_URL } from '../constants';

// export function useAlchemyService() {
//   const { chain } = useNetwork()

//   const service = useMemo(() => {
//     let archemyUrl
//     switch (chain?.id) {
//       case 1: archemyUrl = ALCHEMY_ETHEREUM_URL; break;
//       case 3: archemyUrl = ALCHEMY_ROPSTEN_URL; break;
//       case 137: archemyUrl = ALCHEMY_POLYGON_URL; break;
//       default: return;
//     }
//     // return createAlchemyWeb3(archemyUrl)
//     return {}
//   }, [chain])

//   return service
// }
export default {}