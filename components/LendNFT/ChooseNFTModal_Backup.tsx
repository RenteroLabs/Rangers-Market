// import { Alert, Box, Button, CircularProgress, Dialog, DialogTitle, Divider, Grid, IconButton, InputBase, Stack, Step, StepButton, StepContent, StepLabel, Stepper, Tabs, Tab, Typography } from '@mui/material'
// import React, { useEffect, useState } from 'react'
// import CloseIcon from '@mui/icons-material/Close';
// import { chain, erc20ABI, erc721ABI, useAccount, useContract, useNetwork, useSigner, useSwitchNetwork, useWaitForTransaction } from 'wagmi'
// import { INSTALLMENT_MARKET, INSTALLMENT_MARKET_ABI, Ropsten_721_AXE_NFT, Ropsten_721_AXE_NFT_ABI, ROPSTEN_MARKET, ROPSTEN_MARKET_ABI, Ropsten_WrapNFT, Ropsten_WrapNFT_ABI } from '../../constants/contractABI'
// import NFTCard from '../IntegrationCard/NFTCard'
// import styles from './style.module.scss'
// import LoadingButton from '@mui/lab/LoadingButton';
// import PageviewIcon from '@mui/icons-material/Pageview';
// import NavigateNextIcon from '@mui/icons-material/NavigateNext';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import { web3GetNFTS } from '../../services/web3NFT';
// import Link from 'next/link';
// import DefaultButton from '../Buttons/DefaultButton';
// import OpenInNewIcon from '@mui/icons-material/OpenInNew';
// import SwitchNetwork from '../SwitchNetwork';
// import { ethers } from 'ethers';
// import SliptModeLendConfig from './SliptModeLendConfig';
// import { SUPPORT_TOKENS, TOKEN_LIST, ZERO_ADDRESS } from '../../constants';
// import { TabContext, TabList, TabPanel } from '@mui/lab';
// import TrialModeLendConfig from './TrialModeLendConfig';

// interface ChooseNFTModalProps {
//   gameName: string
//   gameNFTCollection: string
//   visibile: boolean;
//   setVisibile: (v: boolean) => any;
// }

// export interface UserLendConfigInfo {
//   borrowerRatio?: number,
//   securityMoney?: number,
//   whiteList?: string,
//   lendingDay?: number,
// }

// const formatNFTdata = (nftList: any[]) => {
//   return nftList.map((item) => ({
//     nftName: item.title,
//     nftImage: item.media?.[0]?.gateway || 'https://tva1.sinaimg.cn/large/e6c9d24egy1h3esgombq6j20m80m83yv.jpg',
//     nftNumber: parseInt(item.id.tokenId),
//   }))
// }

// const OpenInExplorer: React.FC<{ txHash: string | undefined }> = ({ txHash }) => {
//   const { chain } = useNetwork()
//   const url = `${chain?.blockExplorers?.default.url}/tx/${txHash}`
//   return <Box className={styles.openInExplorer}>
//     <a href={url} target="_blank" rel="noreferrer">
//       View on blockchain explorer&nbsp;<OpenInNewIcon />
//     </a>
//   </Box>
// }

// const ChooseNFTModal: React.FC<ChooseNFTModalProps> = (props) => {
//   const { gameName, gameNFTCollection, visibile, setVisibile } = props

//   const [selectedNFT, setSelectedNFT] = useState<string>('')
//   const [isRequestingNFT, setIsRequestingNFT] = useState<boolean>(false)
//   const [showSwitchNetworkDialog, setShowSwitchNetworkDialog] = useState<boolean>(false)
//   const { chain } = useNetwork()
//   const { switchNetwork } = useSwitchNetwork()
//   const { address, isConnected } = useAccount()
//   const { data: signer } = useSigner()
//   const [NFTList, setNFTList] = useState<any[]>([])

//   const [isChooseNFT, setIsChooseNFT] = useState<boolean>(true)
//   const [isLoading, setIsLoading] = useState<boolean>(false)
//   const [errorMessage, setErrorMessage] = useState<string>('')
//   const [activeStep, setActiveStep] = useState<number>(0)
//   const [stepComplete, setStepComplete] = useState<{ [k: number]: boolean }>({})
//   const [lendStep, setLendStep] = useState<number>(0)
//   const [userLendConfigInfo, setUserLendConfigInfo] = useState<UserLendConfigInfo>({})

//   const [lendType, setLendType] = useState<'SliptMode' | 'TrialMode' | 'RentMode'>('SliptMode')  // 出借类型

//   const [approveTxHash, setApproveTxHash] = useState<string | undefined>()
//   const { isLoading: approveLoading, isSuccess: approveSuccess } = useWaitForTransaction({
//     hash: approveTxHash,
//     onSuccess: () => {
//       setStepComplete({ ...stepComplete, [activeStep]: true })
//       setActiveStep(activeStep + 1)
//     },
//     onSettled: () => setIsLoading(false)
//   })

//   const [stakeTxHash, setStakeTxHash] = useState<string | undefined>()
//   const { isLoading: stakeLoading } = useWaitForTransaction({
//     hash: stakeTxHash,
//     onSuccess: () => {
//       setStepComplete({ ...stepComplete, [activeStep]: true })
//       setActiveStep(activeStep + 1)
//     },
//     onSettled: () => setIsLoading(false)
//   })

//   const [listMarketTxHash, setListMarketTxHash] = useState<string | undefined>()
//   const { isLoading: listMarketLoading } = useWaitForTransaction({
//     hash: listMarketTxHash,
//     onSuccess: () => {
//       setStepComplete({ ...stepComplete, [activeStep]: true })
//       setActiveStep(activeStep + 1)
//       setLendStep(lendStep + 1)
//     },
//     onSettled: () => setIsLoading(false)
//   })

//   const contract721 = useContract({
//     addressOrName: gameNFTCollection,
//     contractInterface: Ropsten_721_AXE_NFT_ABI,
//     signerOrProvider: signer
//   })

//   const contractWrap = useContract({
//     addressOrName: Ropsten_WrapNFT,
//     contractInterface: Ropsten_WrapNFT_ABI,
//     signerOrProvider: signer
//   })

//   const contractMarket = useContract({
//     addressOrName: ROPSTEN_MARKET,
//     contractInterface: ROPSTEN_MARKET_ABI,
//     signerOrProvider: signer
//   })

//   // 授权 ERC20 token 合约
//   const contractERC20 = useContract({
//     // addressOrName: SUPPORT_TOKENS[1],
//     contractInterface: erc20ABI,
//     signerOrProvider: signer
//   })

//   // 授权 ERC721 NFT 合约
//   const contractERC721 = useContract({
//     addressOrName: '0x80b4a4Da97d676Ee139badA2bF757B7f5AFD0644',
//     contractInterface: erc721ABI,
//     signerOrProvider: signer
//   })

//   // 新版 Rentero Market 合约
//   const RenteroMarket = useContract({
//     addressOrName: INSTALLMENT_MARKET,
//     contractInterface: INSTALLMENT_MARKET_ABI,
//     signerOrProvider: signer
//   })

//   // 查询用户钱包地址所拥有的当前游戏 NFT 信息
//   const queryWalletNFT = async () => {
//     setIsRequestingNFT(true)
//     const nft = await web3GetNFTS({
//       owner: address || '',
//       contractAddresses: [gameNFTCollection, '0x80b4a4Da97d676Ee139badA2bF757B7f5AFD0644']
//     })
//     setNFTList(formatNFTdata(nft.ownedNfts))
//     setIsRequestingNFT(false)
//   }

//   useEffect(() => {
//     (async () => {
//       if (!isConnected) {
//         // 尚未连接钱包
//         setNFTList([])
//       } else {
//         await queryWalletNFT()
//       }
//     })();
//   }, [address, isConnected])


//   useEffect(() => {
//     if (visibile) {
//       setIsChooseNFT(true)
//       setSelectedNFT('')
//       setActiveStep(0)
//       setStepComplete({})
//       setLendStep(0)
//       if (isConnected) {
//         queryWalletNFT()
//       }
//     }
//   }, [visibile])

//   useEffect(() => {
//     // 判断当前选中 NFT 之前是否已经被授权
//     if (isChooseNFT) {
//       setLendStep(0)
//       return
//     }

//     (async () => {
//       try {
//         const approvedList = await contract721.getApproved(parseInt(selectedNFT))
//         if (approvedList === Ropsten_WrapNFT) {
//           setStepComplete({ ...stepComplete, [0]: true })
//           setActiveStep(1)
//         }
//       } catch (err) {
//         console.error(err)
//       }
//     })()
//   }, [isChooseNFT, visibile])


//   // 授权 ERC20 token 转账权限
//   const handleApproveERC20 = async () => {
//     setErrorMessage('')
//     if (isLoading) return
//     setIsLoading(true)

//     try {
//       const { hash } = await contractERC20.approve(INSTALLMENT_MARKET, ethers.utils.parseEther('3'))
//       // 等待交易被打包上链
//       setApproveTxHash(hash)
//     } catch (err: any) {
//       setErrorMessage(err?.message)
//       setIsLoading(false)
//     }
//   }

//   // 出借 NFT
//   const handleLendNFT = async () => {
//     setErrorMessage('')
//     if (isLoading) return
//     setIsLoading(true)

//     try {
//       const { hash } = await RenteroMarket.lend(
//         "0x80b4a4Da97d676Ee139badA2bF757B7f5AFD0644",
//         parseInt(selectedNFT),
//         TOKEN_LIST['WETH'].address,
//         ZERO_ADDRESS,
//         ethers.utils.parseEther('1'),
//         ethers.utils.parseEther('2'),
//         1,
//         3,
//         90
//       )
//       // 等待交易被打包上链
//       setApproveTxHash(hash)
//     } catch (err: any) {
//       setErrorMessage(err?.message)
//       setIsLoading(false)
//     }
//   }

//   // 授权指定 ERC721 NFT
//   const handleApproveErc721 = async () => {
//     setErrorMessage('')
//     if (isLoading) return
//     setIsLoading(true)

//     try {
//       const { hash } = await contractERC721.approve(INSTALLMENT_MARKET, parseInt(selectedNFT))
//       // const { hash } = await contractERC721.setApprovalForAll(INSTALLMENT_MARKET, true)

//       // 等待交易被打包上链
//       setApproveTxHash(hash)
//     } catch (err: any) {
//       setErrorMessage(err?.message)
//       setIsLoading(false)
//     }
//   }

//   const handleRentNFT = async () => {
//     await RenteroMarket.rent(
//       '0x80b4a4Da97d676Ee139badA2bF757B7f5AFD0644',
//       1,
//       4
//     )
//   }

//   const handleStakeNFT = async () => {
//     setErrorMessage('')
//     if (isLoading) return
//     setIsLoading(true)

//     try {
//       const { hash } = await contractWrap.stake(parseInt(selectedNFT))
//       setStakeTxHash(hash)
//     } catch (err: any) {
//       setErrorMessage(err.message)
//       setIsLoading(false)
//     }
//   }

//   const handleListToMarket = async () => {
//     setErrorMessage('')
//     if (isLoading) return
//     setIsLoading(true)

//     // 默认为试玩模式分成比例
//     let borrowerRatio = 0, lenderRatio = 100
//     if (lendType !== 'TrialMode') {
//       borrowerRatio = userLendConfigInfo.borrowerRatio || 25
//       lenderRatio = 100 - borrowerRatio
//     }
//     try {
//       const { hash } = await contractMarket.createSkunInfo(
//         parseInt(selectedNFT),
//         Ropsten_WrapNFT,
//         userLendConfigInfo.whiteList || ZERO_ADDRESS,
//         lenderRatio,
//         borrowerRatio)
//       setListMarketTxHash(hash)
//     } catch (err: any) {
//       setErrorMessage(err.message)
//       setIsLoading(false)
//     }
//   }

//   // 当前用户没有 Axe NFT 时，可以 mint NFT 进行体验
//   const mint721WhenEmpty = async () => {
//     // 判断当前所在区块链网络
//     if (chain?.id !== 3 && switchNetwork) {
//       await switchNetwork(3)
//       return
//     }
//     try {
//       await contract721.mint()
//     } catch (err: any) {
//       console.log(err.message)
//     }
//   }

//   const handleStepClick = (index: number) => { }

//   const handleConfirmChoose = () => {
//     if (!selectedNFT) return
//     // 判断当前所处网络和当前游戏支持网络
//     if (chain?.id !== 3) {
//       setShowSwitchNetworkDialog(true)
//     } else {
//       setIsChooseNFT(false)
//     }
//   }

//   return <React.Fragment>
//     {visibile && <Dialog open={visibile} className={styles.container} >
//       <DialogTitle className={styles.dialogTitle} sx={{ width: 'auto' }}>
//         <Box
//           component="span"
//           onClick={() => setIsChooseNFT(true)}
//           className={`${styles.titleBack} ${isChooseNFT && styles.hiddenTitleBack}`}
//         >
//           <ChevronLeftIcon />
//           Back
//         </Box>
//         {isChooseNFT ? 'Choose NFT to deposit' : `Current Lending NFT #${selectedNFT} to Market`}
//         <IconButton
//           aria-label="close"
//           onClick={() => setVisibile(false)}
//           sx={{
//             color: (theme) => theme.palette.grey[500],
//           }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>
//       <div className={styles.dialogContent}>
//         {isChooseNFT && <Box maxWidth="95rem" minWidth="65rem" minHeight="36rem">

//           {/*  TODO: 判断当前链环节，申请切换至正确链 */}
//           <Grid
//             container
//             rowSpacing="2.67rem"
//             columnSpacing="2.5rem"
//             sx={{ p: '3.33rem', maxHeight: '46.66rem', overflowY: 'scroll' }} >
//             <Grid item xs={12}>
//               <Typography variant="h3" sx={{ fontSize: '2rem', lineHeight: '2.67rem' }} >{gameName}</Typography>
//             </Grid>
//             {
//               !isRequestingNFT && NFTList && NFTList.map((item, index) => <Grid key={index} item xs="auto">
//                 <NFTCard {...item} selectedNFT={selectedNFT} setSelectedNFT={setSelectedNFT} />
//               </Grid>)
//             }
//             {
//               isRequestingNFT && <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
//                 <CircularProgress sx={{ mt: '4rem', textAlign: 'center', }} />
//               </Grid>
//             }
//             {
//               !isRequestingNFT && NFTList.length === 0 &&
//               <Stack className={styles.emptyBoxContent}>
//                 <PageviewIcon sx={{ fontSize: '8rem', mt: "6rem" }} />
//                 <Typography sx={{ opacity: 0.8, textAlign: 'center', margin: '1rem auto', fontSize: '1.2rem' }}>
//                   No {gameName} NFT found in current wallet address or not connect wallet
//                   <br />
//                   <Button
//                     sx={{ marginTop: '1rem' }}
//                     variant="contained"
//                     onClick={mint721WhenEmpty}>
//                     Mint a Axe NFT to have a try !
//                   </Button>
//                 </Typography>
//               </Stack>
//             }
//           </Grid>
//         </Box>}

//         {isChooseNFT && <Box>
//           <Stack direction="row" justifyContent="center" spacing="3.33rem" mb="1.33rem" mt="1.33rem">
//             <Box className={styles.defaultButton} onClick={() => setVisibile(false)}>Back  Game</Box>
//             <Box
//               className={`${styles.primaryButton} ${!selectedNFT ? styles.primaryButton_disable : null}`}
//               onClick={handleConfirmChoose}>
//               Confirm
//             </Box>
//           </Stack>
//         </Box>}

//         <SwitchNetwork
//           showDialog={showSwitchNetworkDialog}
//           closeDialog={() => setShowSwitchNetworkDialog(false)}
//           callback={() => setIsChooseNFT(false)}
//           targetNetwork={3}
//         />

//         {
//           !isChooseNFT &&
//           <Box className={styles.lendStep} width="75rem" minHeight="36rem">

//             <Button onClick={() => handleApproveErc721()}>Approve ERC20 token</Button>
//             <Button onClick={() => handleLendNFT()}>Lend NFT</Button>
//             <Button onClick={() => handleApproveERC20()}>Approve ERC 20 </Button>
//             <Button onClick={() => handleRentNFT()}>Rent NFT</Button>
//             {/* 出借第一步：出借信息配置 */}
//             {lendStep === 0 &&
//               <TabContext value={lendType}>
//                 <TabList
//                   centered
//                   onChange={(_, val) => setLendType(val)}
//                   className={styles.lendTypeBox}
//                 >
//                   <Tab label="Slipt Mode" value="SliptMode" />
//                   <Tab label="Trial Mode" value="TrialMode" />
//                   <Tab label="Rent Mode" value="RentMode" disabled />
//                 </TabList>

//                 <TabPanel value='SliptMode' key={0}>
//                   <SliptModeLendConfig
//                     setNextStep={() => setLendStep(1)}
//                     setUserLendConfigInfo={setUserLendConfigInfo} />
//                 </TabPanel>

//                 <TabPanel value='TrialMode' key={1}>
//                   <TrialModeLendConfig
//                     setNextStep={() => setLendStep(1)}
//                     setUserLendConfigInfo={setUserLendConfigInfo}
//                   />
//                 </TabPanel>

//                 <TabPanel value='RentMode' key={2}></TabPanel>
//               </TabContext>}

//             {/* 出借第二步：合约交互 */}
//             <Box className={styles.lendStepTwoBox}>
//               {errorMessage && <Alert variant="outlined" severity="error">{errorMessage}</Alert>}

//               {/* 三步合约交互出租流程 */}
//               {!stepComplete[2] && lendStep === 1 &&
//                 <Stepper
//                   orientation="vertical"
//                   activeStep={activeStep}
//                   nonLinear
//                 >
//                   <Step key="Approve 721 NFT" completed={stepComplete[0]}>
//                     <StepButton onClick={() => handleStepClick(0)}>
//                       <StepLabel >
//                         Approve Your Game ERC721 NFT
//                       </StepLabel>
//                     </StepButton>

//                     <StepContent>
//                       <Box className={styles.stepContent}>
//                         {!stepComplete[0] &&
//                           <DefaultButton
//                             loading={isLoading}
//                             className={styles.stepButton}
//                             onClick={handleApproveErc721}>
//                             Approve
//                           </DefaultButton>
//                         }
//                         {approveLoading && <OpenInExplorer txHash={approveTxHash} />}
//                       </Box>
//                     </StepContent>
//                   </Step>
//                   <Step key="Stake ERC721 NFT & Receive reNFT" completed={stepComplete[1]}>
//                     <StepButton onClick={() => handleStepClick(1)}>
//                       <StepLabel >
//                         Stake ERC721 NFT & Receive Your WrapNFT
//                       </StepLabel>
//                     </StepButton>

//                     <StepContent >
//                       <Box className={styles.stepContent}>
//                         {
//                           !stepComplete[1] ?
//                             <DefaultButton
//                               loading={isLoading}
//                               onClick={handleStakeNFT}
//                               className={styles.stepButton}
//                             >Stack</DefaultButton>
//                             : <>
//                             </>
//                         }
//                         {stakeLoading && <OpenInExplorer txHash={stakeTxHash} />}
//                       </Box>
//                     </StepContent>
//                   </Step>

//                   <Step key="ListToMarket" completed={stepComplete[2]}>
//                     <StepButton onClick={() => handleStepClick(2)}>
//                       <StepLabel>
//                         List To Market
//                       </StepLabel>
//                     </StepButton>
//                     <StepContent >
//                       <Box className={styles.stepContent}>
//                         {
//                           !stepComplete[2] &&
//                           <DefaultButton
//                             loading={isLoading}
//                             onClick={handleListToMarket}
//                             className={styles.stepButton}
//                           >
//                             List
//                           </DefaultButton>
//                         }
//                         {listMarketLoading && <OpenInExplorer txHash={listMarketTxHash} />}
//                       </Box>
//                     </StepContent>
//                   </Step>
//                 </Stepper>}

//               {/*   出租成功结果页 */}
//               {stepComplete[2] &&
//                 <Box sx={{ mt: '6rem' }} className={styles.lendSuccess}>
//                   <img src='/success_smile.png' alt='success_smile' />
//                   <Typography variant='h3' > Successful Lend Your NFT </Typography>
//                   <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: '1rem', fontSize: '1.5rem' }}>
//                     Your Lend NFT Will List In Market In Minutes!
//                     <Link href="/">
//                       <Typography variant='overline' className={styles.linkStyle}>Go To Market</Typography>
//                     </Link>
//                   </Typography>
//                   <DefaultButton sx={{ marginTop: '2rem' }}
//                     onClick={() => setVisibile(false)}
//                   >Finished</DefaultButton>
//                 </Box>}
//             </Box>
//           </Box>
//         }
//       </div>
//     </Dialog>}
//   </React.Fragment >

// }

// export default ChooseNFTModal
export {}