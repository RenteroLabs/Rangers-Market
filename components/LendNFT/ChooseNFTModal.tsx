import { Alert, Box, Button, CircularProgress, Dialog, DialogTitle, Divider, Grid, IconButton, InputBase, Stack, Step, StepButton, StepContent, StepLabel, Stepper, Tabs, Tab, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import { chain, erc20ABI, erc721ABI, useAccount, useContract, useContractRead, useNetwork, useSigner, useSwitchNetwork, useWaitForTransaction } from 'wagmi'
import { Ropsten_721_AXE_NFT } from '../../constants/contractABI'
import { Ropsten_721_AXE_NFT_ABI } from '../../constants/abi'
import NFTCard from '../IntegrationCard/NFTCard'
import styles from './style.module.scss'
import LoadingButton from '@mui/lab/LoadingButton';
import PageviewIcon from '@mui/icons-material/Pageview';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { web3GetNFTS } from '../../services/web3NFT';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SwitchNetwork from '../SwitchNetwork';
import { BigNumber, ethers } from 'ethers';
import SliptModeLendConfig from './SliptModeLendConfig';
import { CHAIN_ID_MAP, MORALIS_SUPPORT_CHAINS } from '../../constants';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TrialModeLendConfig from './TrialModeLendConfig';
import InstallmentLendConfig from './InstallmentLendConfig';
import Moralis from 'moralis'
import { formatTokenId, moralisData2NFTdata, rangersData2NFTdata } from '../../utils/format';
import { getNFTsByAddressFromRangers } from '../../services/rangers';

Moralis.start({
  apiKey: 'DewBAeYa9EmQh3WWko5vErjAEJjWysKjagsPJzxGIV3jV9XZuQ39MnPiUurtsSZj'
})

interface ChooseNFTModalProps {
  gameName: string
  gameNFTCollection: string[]
  visibile: boolean;
  setVisibile: (v: boolean) => any;
  targetChainId: number
}

export interface UserLendConfigInfo {
  borrowerRatio?: number,
  securityMoney?: number,
  whiteList?: string,
  lendingDay?: number,
}

const ChooseNFTModal: React.FC<ChooseNFTModalProps> = (props) => {
  const { gameName, gameNFTCollection, visibile, setVisibile, targetChainId } = props

  const [selectedNFT, setSelectedNFT] = useState<string>('')
  const [selectedContractAddress, setContractAddress] = useState<string>('')
  const [isRequestingNFT, setIsRequestingNFT] = useState<boolean>(false)
  const [showSwitchNetworkDialog, setShowSwitchNetworkDialog] = useState<boolean>(false)
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner()
  const [NFTList, setNFTList] = useState<any[]>([])

  const [isChooseNFT, setIsChooseNFT] = useState<boolean>(true)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [stepComplete, setStepComplete] = useState<{ [k: number]: boolean }>({})
  const [lendStep, setLendStep] = useState<number>(0)
  const [userLendConfigInfo, setUserLendConfigInfo] = useState<UserLendConfigInfo>({})

  const [lendType, setLendType] = useState<'SliptMode' | 'TrialMode' | 'RentMode'>('SliptMode')  // 出借类型

  const contract721 = useContract({
    addressOrName: gameNFTCollection[0],
    contractInterface: Ropsten_721_AXE_NFT_ABI,
    signerOrProvider: signer
  })

  const contract721_New = useContract({
    addressOrName: gameNFTCollection[0],
    contractInterface: erc721ABI,
    signerOrProvider: signer,
  })

  useEffect(() => {
    // 在 Hehero 必须是在正确的测试链上
    if (targetChainId && targetChainId === 9527) {
      if (chain?.id !== targetChainId) {
        setShowSwitchNetworkDialog(true)
      }
    }
  }, [targetChainId])


  // 查询用户钱包地址所拥有的当前游戏 NFT 信息
  const queryWalletNFT2 = async () => {
    setIsRequestingNFT(true)

    if (MORALIS_SUPPORT_CHAINS.includes(targetChainId)) {
      try {
        const { result } = await Moralis.EvmApi.account.getNFTs({
          address: address as string,
          tokenAddresses: gameNFTCollection,
          chain: targetChainId,
        })
        setNFTList(moralisData2NFTdata(result))
      } catch (err) {
        console.error(err)
      }
    } else {
      try {
        const { result } = await getNFTsByAddressFromRangers({
          account: address as string,
          contractAddress: gameNFTCollection[0],
        })
        console.log(result)

        let metaList: Record<string, any>[] = []
        const tokenList: any[] = result?.data || []
        for (let i = 0; i < tokenList.length; i++) {
          const baseurl = await contract721_New.tokenURI(BigNumber.from(tokenList[i]))
          const metadata = await fetch(baseurl)
          const metaJson = await metadata.json()
          metaList.push({ ...metaJson, tokenId: tokenList[i] })
        }

        setNFTList(rangersData2NFTdata(metaList, gameNFTCollection[0]))
      } catch (err) {
        console.error(err)
      }
    }

    setIsRequestingNFT(false)
  }

  useEffect(() => {
    (async () => {
      if (!isConnected) {
        // 尚未连接钱包
        setNFTList([])
      } else {
        await queryWalletNFT2()
      }
    })();
  }, [address, isConnected])


  useEffect(() => {
    if (visibile) {
      setIsChooseNFT(true)
      setSelectedNFT('')
      setActiveStep(0)
      setStepComplete({})
      setLendStep(0)
      if (isConnected) {
        queryWalletNFT2()
      }
    }
  }, [visibile])

  useEffect(() => {
    // 判断当前选中 NFT 之前是否已经被授权
    if (isChooseNFT) {
      setLendStep(0)
      return
    }

  }, [isChooseNFT, visibile])

  // 当前用户没有 Axe NFT 时，可以 mint NFT 进行体验
  const mint721WhenEmpty = async () => {
    // 判断当前所在区块链网络
    if (chain?.id !== targetChainId && switchNetwork) {
      alert("Current Network Error!")
      return
    }
    try {
      await contract721.mint()
    } catch (err: any) {
      console.log(err.message)
    }
  }

  const handleConfirmChoose = () => {
    if (!selectedNFT) return
    if (chain?.id !== targetChainId) {
      setShowSwitchNetworkDialog(true)
    } else {
      setIsChooseNFT(false)
    }
  }

  return <React.Fragment>
    {visibile && <Dialog open={visibile} className={styles.container} >
      <DialogTitle className={styles.dialogTitle} sx={{ width: 'auto' }}>
        <Box
          component="span"
          onClick={() => setIsChooseNFT(true)}
          className={`${styles.titleBack} ${isChooseNFT && styles.hiddenTitleBack}`}
        >
          <ChevronLeftIcon />
          Back
        </Box>
        <Typography>
          {isChooseNFT ? 'Choose NFT to deposit' : `Lending #${formatTokenId(selectedNFT)}`}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={() => setVisibile(false)}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <div className={styles.dialogContent}>
        {isChooseNFT && <Box maxWidth="95rem" minWidth="65rem" minHeight="36rem">

          {/*  TODO: 判断当前链环节，申请切换至正确链 */}
          <Grid
            container
            rowSpacing="2.67rem"
            columnSpacing="2.5rem"
            sx={{ p: '3.33rem', maxHeight: '46.66rem', overflowY: 'scroll' }} >
            <Grid item xs={12}>
              <Typography variant="h3" sx={{ fontSize: '2rem', lineHeight: '2.67rem' }} >{gameName}</Typography>
            </Grid>
            {
              !isRequestingNFT && NFTList &&
              NFTList.map((item, index) =>
                <Grid key={index} item xs="auto">
                  <NFTCard
                    {...item}
                    chainId={targetChainId}
                    selectedNFT={selectedNFT}
                    setSelectedNFT={setSelectedNFT}
                    setContractAddress={setContractAddress}
                  />
                </Grid>)
            }
            {
              isRequestingNFT && <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress sx={{ mt: '4rem', textAlign: 'center', }} />
              </Grid>
            }
            {
              !isRequestingNFT && NFTList.length === 0 &&
              <Stack className={styles.emptyBoxContent}>
                <PageviewIcon sx={{ fontSize: '8rem', mt: "6rem" }} />
                <Typography sx={{ opacity: 0.8, textAlign: 'center', margin: '1rem auto', fontSize: '1.2rem' }}>
                  No {gameName} NFT found in current wallet address or not connect wallet
                  <br />
                  {/* TODO: 仅方便测试功能 */}
                  {gameName === 'Axe Game' && <Button
                    sx={{ marginTop: '1rem' }}
                    variant="contained"
                    onClick={mint721WhenEmpty}>
                    Mint a Axe NFT to have a try !
                  </Button>}
                </Typography>
              </Stack>
            }
          </Grid>
        </Box>}

        {isChooseNFT && <Box>
          <Stack direction="row" justifyContent="center" spacing="3.33rem" mb="1.33rem" mt="1.33rem">
            <Box className={styles.defaultButton} onClick={() => setVisibile(false)}>Back  Game</Box>
            <Box
              className={`${styles.primaryButton} ${!selectedNFT ? styles.primaryButton_disable : null}`}
              onClick={handleConfirmChoose}>
              Confirm
            </Box>
          </Stack>
        </Box>}

        <SwitchNetwork
          showDialog={showSwitchNetworkDialog}
          closeDialog={() => setShowSwitchNetworkDialog(false)}
          callback={async () => {
            setShowSwitchNetworkDialog(false)
            await queryWalletNFT2()
          }}
          targetNetwork={targetChainId}
        />

        {
          !isChooseNFT &&
          <Box className={styles.lendStep} minHeight="24rem">

            {/* 出借第一步：出借信息配置 */}
            {/* {lendStep === 0 &&
              <TabContext value={lendType}>
                <TabList
                  centered
                  onChange={(_, val) => setLendType(val)}
                  className={styles.lendTypeBox}
                >
                  <Tab label="Slipt Mode" value="SliptMode" />
                  <Tab label="Trial Mode" value="TrialMode" />
                  <Tab label="Rent Mode" value="RentMode" disabled />
                </TabList>

                <TabPanel value='SliptMode' key={0}>
                  <SliptModeLendConfig
                    setNextStep={() => setLendStep(1)}
                    setUserLendConfigInfo={setUserLendConfigInfo} />
                </TabPanel>

                <TabPanel value='TrialMode' key={1}>
                  <TrialModeLendConfig
                    setNextStep={() => setLendStep(1)}
                    setUserLendConfigInfo={setUserLendConfigInfo}
                  />
                </TabPanel>

                <TabPanel value='RentMode' key={2}></TabPanel>
              </TabContext>} */}

            {lendStep === 0 && <InstallmentLendConfig
              nftInfo={{
                tokenId: selectedNFT,
                nftAddress: selectedContractAddress,
                chain: CHAIN_ID_MAP[targetChainId] as string
              }}
              setUserLendConfigInfo={setUserLendConfigInfo}
              handleClose={() => setVisibile(false)}
            />}
          </Box>
        }
      </div>
    </Dialog>}
  </React.Fragment >
}

export default ChooseNFTModal