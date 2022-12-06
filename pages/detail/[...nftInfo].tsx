import { Box, Breadcrumbs, Fade, IconButton, Paper, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useQuery, useLazyQuery } from '@apollo/client'
import styles from '../../styles/detail.module.scss'
import NFTCard from "../../components/NFTCard";
import ConnectWallet from "../../components/ConnectWallet";
import { erc721ABI, etherscanBlockExplorers, useAccount, useContractRead } from "wagmi";
import { useCopyToClipboard, useIsMounted } from "../../hooks";
import RentNFTModal from "../../components/RentNFT/RentNFTModal";
import { PropsWithChildren, ReactElement, useEffect, useMemo, useState } from "react";
import { useRequest } from "ahooks";
import { getNFTInfo, getNFTInfoByMoralis } from "../../services/market";
import { formatAddress, formatTokenId } from "../../utils/format";
import { ADDRESS_TOKEN_MAP, CHAIN_NAME, NFT_COLLECTIONS, ZERO_ADDRESS } from "../../constants";
import Head from "next/head";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';
import Layout2 from "../../components/layout2";
import { NextPageWithLayout } from "../_app";
import { GET_LEASES, GET_LEASE_INFO, GET_MORE_RECOMMENDED_FOUR } from "../../constants/documentNode";
import { LeaseItem } from "../../types";
import { BigNumber, utils } from "ethers";
import SkeletonNFTCard from "../../components/NFTCard/SkeletonNFTCard";
import UpdateNFTModal from "../../components/UpdateNFT";
import { GRAPH_SERVICE_MAP } from '../../services/graphql'
import Image from 'next/image'
import { isEmpty } from 'lodash'

interface DetailCardBoxProps {
  title: React.ReactElement
}
const DetailCardBox: React.FC<PropsWithChildren<DetailCardBoxProps>> = (props) => {
  const { children, title } = props
  return <Paper
    className={styles.detailCardBox}
  >
    <Box className={styles.cardTitle}>{title}</Box>
    <Box className={styles.cardContent}>{children}</Box>
  </Paper>
}

interface RentOperationProps {
  nftStatus: 'renting' | 'lending';
  isConnected: boolean;
  rentInfo: LeaseItem | undefined;
  address: string | undefined;
  reload: () => any
}
const RentOperation: React.FC<RentOperationProps> = (props) => {
  const { nftStatus, rentInfo, isConnected, address, reload } = props

  // 已出借
  if (nftStatus === 'renting') {
    return <Box className={styles.rentedButton}> Rented </Box>
  }
  // 未连接钱包
  if (!isConnected) {
    return <ConnectWallet
      trigger={<Box className={styles.rentButton}>Connect Wallet</Box>}
      closeCallback={() => { }}
    />
  }
  // 编辑自己出借订单
  if (rentInfo?.lender === address?.toLowerCase()) {
    return <UpdateNFTModal
      trigger={<Box className={styles.rentButton}>Edit</Box>}
      rentInfo={rentInfo || {} as LeaseItem}
      reloadInfo={reload}
    />
  }

  // 非白名单地址不可租借
  if (![ZERO_ADDRESS, address?.toLowerCase()].includes(rentInfo?.whitelist)) {
    return <Box className={styles.rentedButton}>Rent</Box>
  }

  // 租借弹窗
  return <RentNFTModal
    reloadInfo={reload}
    rentInfo={rentInfo || {} as LeaseItem}
    trigger={<Box className={styles.rentButton}> Rent </Box>} />
}

const Detail: NextPageWithLayout = () => {
  const router = useRouter()
  const [chainId, nftAddress, tokenId] = router.query.nftInfo as string[] || []

  const { isConnected, address } = useAccount()
  const isMounted = useIsMounted()
  const minMobileWidth = useMediaQuery("(max-width: 600px)")

  const [baseInfo, setBaseInfo] = useState<Record<string, any>>({})
  const [nftList, setNFTList] = useState<Record<string, any>[]>([])
  const [rentInfo, setRentInfo] = useState<LeaseItem>()
  const [metaInfo, setMetaInfo] = useState<Record<string, any>>({})

  const [_, copyAddress] = useCopyToClipboard()
  const [isCopyed, setIsCopyed] = useState<boolean>(false)
  const [isRenterCopyed, setRenterCopyed] = useState<boolean>(false)

  const timestamp = useMemo(() => (Number(new Date) / 1000).toFixed(), [])

  const contractBlockExplore = useMemo(() => {
    return `${etherscanBlockExplorers[CHAIN_NAME[3]]?.url}/address/${nftAddress}`
  }, [nftAddress])

  const graphClient = useMemo(() => {
    return GRAPH_SERVICE_MAP[parseInt(chainId)]
  }, [chainId])

  const nftStatus = useMemo(() => {
    const current = (Number(new Date) / 1000).toFixed()
    return (rentInfo?.expires || 0) > current ? 'renting' : 'lending'
  }, [rentInfo])

  const [getLeaseInfo, { refetch }] = useLazyQuery(GET_LEASE_INFO, {
    variables: { id: [nftAddress, tokenId].join('-') },
    client: graphClient,
    onCompleted(data) {
      setRentInfo(data.lease)
    },
  })

  const [getMoreLease, { loading }] = useLazyQuery(GET_MORE_RECOMMENDED_FOUR, {
    variables: {
      nftAddress,
      tokenId,
      expires: timestamp
    },
    client: graphClient,
    onCompleted(data) { setNFTList(data.leases) }
  })

  const { data: baseurl } = useContractRead({
    addressOrName: nftAddress,
    contractInterface: erc721ABI,
    functionName: "tokenURI",
    chainId: 9527,
    args: [tokenId && BigNumber.from(tokenId)],
    enabled: chainId === "9527"
  })

  const { run: fetchNFTInfo } = useRequest(getNFTInfo, {
    manual: true,
    onSuccess: async ({ data, code }) => {
      setMetaInfo(data)

      // 中心化存储接口请求失败后逻辑
      if (code !== 200) {
        // 从 Ranger 测试网络获取
        if (chainId === '9527') {
          const metadata = await fetch(baseurl as unknown as string)
          const metaJson = await metadata.json()
          setMetaInfo({ ...metaJson, imageUrl: metaJson.image, metadata: JSON.stringify(metaJson) })
        } else {
          // 从第三方服务获取
          const res = await getNFTInfoByMoralis({
            tokenId: parseInt(tokenId),
            contractAddress: nftAddress,
            chainId: "0x" + Number(chainId).toString(16)
          })
          try {
            if (res?.metadata) {
              const metaJson = JSON.parse(res.metadata)
              setMetaInfo({ ...res, imageUrl: metaJson.image })
            }
          } catch (err) {
            console.error(err)
          }
        }
      }
    }
  })

  useEffect(() => {
    getLeaseInfo()
    getMoreLease()
    if (nftAddress && tokenId) {
      fetchNFTInfo({ tokenId: parseInt(tokenId), contractAddress: nftAddress })
    }
  }, [nftAddress, tokenId])

  const imageKitLoader = ({ src, width = 400, quality = 90 }: any) => {
    const params = [`w-${width}`];
    if (quality) {
      params.push(`q-${quality}`);
    }
    const paramsString = params.join(",");
    var urlEndpoint = "https://ik.imagekit.io/jnznr24q9";
    const imagePaths = src.split('/')
    const imageHash = imagePaths[imagePaths.length - 1]

    return `${urlEndpoint}/${imageHash}?tr=${paramsString}`
  }

  return <Box>
    <Head>
      <title>NFT Detail | Rentero</title>
      <meta name="description" content="Lend and rent your NFTs | Rentero Protocol" />
    </Head>
    {/* <Box className={styles.navBox}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
        <Link href={"/"}>Home</Link>
        <Link href={"/"}>Market</Link>
        <Typography >Detail</Typography>
      </Breadcrumbs>
    </Box> */}
    {isMounted && <Box className={styles.mainContentBox}>
      {/* left content */}
      <Box className={styles.leftBox}>
        <Stack spacing="1.67rem">
          <Paper className={styles.itemCover} >
            {/* {(metaInfo?.imageUrl) && <img src={metaInfo?.imageUrl} />} */}
            {(metaInfo?.imageUrl) &&
              <Image
                src={metaInfo?.imageUrl}
                // TODO: 暂时移除 loader
                // loader={imageKitLoader}
                layout="fill" />}
          </Paper>

          <DetailCardBox title={<Box>About {NFT_COLLECTIONS[nftAddress]}</Box>}>
            <Box className={styles.nftDesc}>
              {
                metaInfo?.metadata && (JSON.parse(metaInfo.metadata).description)
              }
              {metaInfo?.metadata && <a href={JSON.parse(metaInfo.metadata).external_link}>{JSON.parse(metaInfo.metadata).external_link}</a>}
            </Box>

          </DetailCardBox>

          <DetailCardBox
            title={<Box>Details</Box>}
          >
            <Stack className={styles.detailList}>
              <Box>
                <Box>Contract Address</Box>
                <a href={contractBlockExplore} target="_blank" rel="noreferrer">
                  <Box className={styles.linkAddress}>
                    {formatAddress(nftAddress, 4)}&nbsp;
                    <LaunchIcon />
                  </Box>
                </a>
              </Box>
              <Box>
                <Box>Token ID</Box>
                <Box className={styles.linkAddress}>{formatTokenId(tokenId)}</Box>
              </Box>
              <Box>
                <Box>Token Standard</Box>
                <Box>ERC-721</Box>
              </Box>
              <Box>
                <Box>Blockchain</Box>
                <Box>Ethereum</Box>
              </Box>
            </Stack>
          </DetailCardBox>
        </Stack>
      </Box>

      {/* right content */}
      <Box className={styles.rightBox} >
        <Stack spacing="1.67rem">
          <Paper className={styles.rentNFTinfo}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span className={styles.nftCollectionName}>{NFT_COLLECTIONS[nftAddress]}</span>
              </Box>
              <Box className={styles.tagList}>
                {nftStatus === 'renting' &&
                  <Box component="span" className={styles.rentedTag}>Rented</Box>}
                {
                  rentInfo?.whitelist && rentInfo.whitelist != ZERO_ADDRESS &&
                  <Box component="span" className={styles.whitelistTag} >Whitelist</Box>
                }
              </Box>
            </Box>
            <Typography variant="h2">
              {NFT_COLLECTIONS[nftAddress]} #{formatTokenId(rentInfo?.tokenId as string)}
            </Typography>
            <Stack direction={minMobileWidth ? 'column' : 'row'} spacing={minMobileWidth ? '10px' : '4.83rem'} className={styles.addressInfo}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography >Owner</Typography>
                <span className={styles.ownerAddress}>
                  {address?.toLowerCase() === rentInfo?.lender ? "You" : formatAddress(rentInfo?.lender, 4)}
                </span>
                {
                  isCopyed ?
                    <Tooltip title="Copyed">
                      <Fade in={true}>
                        <IconButton size="small"><CheckIcon color="success" fontSize="small" /></IconButton>
                      </Fade>
                    </Tooltip> :
                    <Tooltip title="Copy Address To Clipboard">
                      <Fade in={true}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            copyAddress(rentInfo?.lender as string)
                            setIsCopyed(true)
                            setTimeout(() => setIsCopyed(false), 2500)
                          }}>
                          <ContentCopyIcon fontSize="small" sx={{ opacity: '0.8' }} />
                        </IconButton>
                      </Fade>
                    </Tooltip>
                }
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>Renter</Typography>
                {
                  (rentInfo?.renter != ZERO_ADDRESS && nftStatus === 'renting') ?
                    <>
                      <span className={styles.ownerAddress}>
                        {address?.toLowerCase() === rentInfo?.renter ? "You" : formatAddress(rentInfo?.renter, 4)}
                      </span>
                      {
                        isRenterCopyed ?
                          <Tooltip title="Copyed">
                            <Fade in={true}>
                              <IconButton size="small"><CheckIcon color="success" fontSize="small" /></IconButton>
                            </Fade>
                          </Tooltip> :
                          <Tooltip title="Copy Address To Clipboard">
                            <Fade in={true}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  copyAddress(rentInfo?.renter || '')
                                  setRenterCopyed(true)
                                  setTimeout(() => setRenterCopyed(false), 2500)
                                }}>
                                <ContentCopyIcon fontSize="small" sx={{ opacity: '0.8' }} />
                              </IconButton>
                            </Fade>
                          </Tooltip>
                      }
                    </>
                    : <Box sx={{ marginLeft: '1rem' }}>-</Box>
                }
              </Box>
            </Stack>
          </Paper>

          <DetailCardBox
            title={<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>{baseInfo.mode === 'FreeTrial' ? 'Trial Period' : 'Rental Period'}</Box>
              <Box>{rentInfo ? `${rentInfo?.minRentalDays}-${rentInfo?.maxRentalDays}Days` : '-'}</Box>
            </Box>}
          >
            <Stack spacing="1.33rem" className={styles.rentInfoList}>
              {(!rentInfo?.deposit || parseInt(rentInfo?.deposit || '0') !== 0) && <Box>
                <Box>Deposit</Box>
                <Box>
                  {
                    rentInfo ? <>
                      <img src={ADDRESS_TOKEN_MAP[rentInfo?.erc20Address]?.logo} />
                      {utils.formatUnits(BigNumber.from(rentInfo?.deposit), ADDRESS_TOKEN_MAP[rentInfo?.erc20Address]?.decimal)}
                    </> : '-'
                  }
                </Box>
              </Box>}
              <Box>
                <Box>Rent</Box>
                <Box>
                  {
                    rentInfo ? <>
                      <img src={ADDRESS_TOKEN_MAP[rentInfo?.erc20Address]?.logo} />
                      {utils.formatUnits(BigNumber.from(rentInfo?.rentPerDay), ADDRESS_TOKEN_MAP[rentInfo?.erc20Address]?.decimal)}/Day
                    </> : '-'
                  }
                </Box>
              </Box>
              <RentOperation
                nftStatus={nftStatus}
                isConnected={isMounted && isConnected}
                rentInfo={rentInfo}
                reload={refetch}
                address={address}
              />
            </Stack>
            {rentInfo?.whitelist !== ZERO_ADDRESS &&
              <Typography className={styles.whitelistButtonTip}>
                * This NFT is only for the whitelist user.
              </Typography>}
          </DetailCardBox>

          <DetailCardBox title={<Box>Status</Box>}>
            <Typography className={styles.cardSubtitle}>Attributes</Typography>
            <Stack className={styles.statusAttrList} spacing="1.33rem">
              {
                metaInfo?.metadata &&
                JSON.parse(metaInfo?.metadata)?.attributes.map(({ value, trait_type }: any, index: number) => <Box key={index}>
                  <Box>{trait_type}:</Box>
                  <Box className={styles.attrValue}>{value}</Box>
                </Box>
                )}
            </Stack>
          </DetailCardBox>
        </Stack>
      </Box>

      <Paper className={styles.itemCoverMobile} >
        {(metaInfo?.imageUrl) && <img src={metaInfo?.imageUrl} />}
      </Paper>
    </Box>}

    {isMounted && <Box className={styles.moreNFTCards} >
      <Box className={styles.moreNFTtitle}>
        <Typography variant="h3">More NFTs</Typography>
        <Link href="/"><Typography>More &nbsp;&nbsp;<ChevronRightIcon /></Typography></Link>
      </Box>
      <Box sx={{ overflowX: 'scroll' }}>
        {isMounted &&
          <Stack direction="row" className={styles.cardList} spacing="1rem">
            {
              loading ?
                <>
                  <SkeletonNFTCard />
                  <SkeletonNFTCard />
                  <SkeletonNFTCard />
                  <SkeletonNFTCard />
                </> :
                nftList.map((item: any, index: number) =>
                  <NFTCard nftInfo={item} key={index} />)
            }
          </Stack>}
      </Box>
    </Box>}
  </Box>
}

Detail.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout2>{page}</Layout2>
  )
}

export default Detail