import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import type { NextPage } from 'next'
import ScheduleIcon from '@material-ui/icons/Schedule';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowRightAltRoundedIcon from '@material-ui/icons/ArrowRightAltRounded';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { Accordion, AccordionDetails, AccordionSummary, Box, Card, Checkbox, FormControlLabel, IconButton, Menu, MenuItem, MenuList, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useStepperContext } from '@mui/material'
import { useQuery, gql, useLazyQuery } from '@apollo/client'
import NFTCard from '../components/NFTCard'
import styles from '../styles/Home.module.scss'
import { SORT_BY, CHAINTYPE_SUPPORTED } from '../utils/constants'
import { getGameInfos } from '../services/market'
import { dateFormat } from '../utils/format'
import { useIsMounted } from '../hooks'
import SkeletonNFTCard from '../components/NFTCard/SkeletonNFTCard'
import Link from 'next/link';
import Layout2 from '../components/layout2';
import { GET_GAME_LEASES_COUNT, GET_LEASES, GET_TOTAL_LEASES } from '../constants/documentNode';
import { LeaseItem } from '../types';
import WestIcon from '@mui/icons-material/West';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import classNames from 'classnames/bind';
import { GAME_CONTRACTS, GAME_LOGOS, GAME_NAMES } from '../constants';
import { useRouter } from 'next/router';
import { bsctestGraph, goerliGraph, rangersTestGraph } from '../services/graphql'
import useUrlState from '@ahooksjs/use-url-state';
// import useQueryString from 'use-query-string';
import {useQueryParam, StringParam, withDefault} from 'use-query-params';

const cx = classNames.bind(styles)

const Home: NextPage<{ gamesInfo: Record<string, any>[] }> = ({ gamesInfo }) => {
  const isMounted = useIsMounted()
  const [currentGame, setCurrentGame] = useState<number>(0)
  const minMobileWidth = useMediaQuery("(max-width: 600px)")
  const [showLeftBar, setShowLeftBar] = useState<boolean>(true)
  const router = useRouter()

  const [graphService, setGraphService] = useState<any>(goerliGraph)
  const [gameContracts, setGameContracts] = useState<string[]>(GAME_CONTRACTS[0])

  const chainTypeRef = useRef<HTMLElement>()
  const sortTypeRef = useRef<HTMLElement>()
  const [chainTypeShow, setChainTypeShow] = useState<boolean>(false)
  const [sortTypeShow, setSortTypeShow] = useState<boolean>(false)
  const [selectedChain, setSelectedChain] = useState<number>(0)
  const [selectedSortBy, setSelectedSortBy] = useState<number>(0)

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(18)
  const [leasesList, setLeasesList] = useState<LeaseItem[]>([])
  const [NFTList, setNFTList] = useState<Record<string, any>[]>([])
  const [NFTTotal, setNFTTotal] = useState<number>(0)

  const [isWhitelistOnly, setIsWhitelistOnly] = useState<boolean>(false)
  const [whitelistNums, setWhitelistNums] = useState<number>(0)
  const [whitelistLists, setWhitelistLists] = useState<Record<string, any>[]>([])

  const [name, setName] = useQueryParam('game', withDefault(StringParam, 'all'));

  const currentGameInfo = useMemo(() => {
    return gamesInfo[currentGame] || {}
  }, [currentGame, gamesInfo])

  // 识别页面初始选中游戏
  useEffect(() => {
    switch (router.query?.game) {
      case GAME_NAMES.METALINE:
        setCurrentGame(1);
        break;
      case GAME_NAMES.DEHERO:
        setCurrentGame(2);
        break
      default:
        setCurrentGame(0);
        break;
    }
  }, [router])

  const { refetch: reloadTotal } = useQuery(GET_TOTAL_LEASES, {
    variables: { id: "all" },
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'network-only',
    onCompleted({ summary }) {
      console.log(summary)
      setNFTTotal(summary?.leaseCount || 0)
    }
  })

  const [getGameLeaseCount] = useLazyQuery(GET_GAME_LEASES_COUNT, {
    variables: { contractAddresses: gameContracts.map(item => item.toLowerCase()) },
    client: graphService,
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache',
    onCompleted({ summaries }) {
      const gameLeaseTotal = summaries?.reduce((pre: number, item: { leaseCount: string; }) => parseInt(item.leaseCount) + pre, 0)
      setNFTTotal(gameLeaseTotal)
    }
  })

  const [getLeasesList, { loading: isLeasesLoading }] = useLazyQuery(GET_LEASES, {
    variables: {
      pageSize: pageSize,
      skip: (currentPage - 1) * pageSize
    },
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'network-only',
    client: graphService,
    onCompleted(data) {
      setLeasesList([...leasesList, ...data.leases])
    }
  })

  // 监听游戏切换
  useEffect(() => {
    setCurrentPage(1)
    setLeasesList([])
    switch (currentGame) {
      case 0:
        setGraphService(goerliGraph);
        reloadTotal();
        break;
      case 1:
        setGraphService(bsctestGraph);
        setGameContracts(GAME_CONTRACTS[1]);
        getGameLeaseCount();
        setName(GAME_NAMES.METALINE)
        break;
      case 2:
        setGraphService(rangersTestGraph)
        setGameContracts(GAME_CONTRACTS[2])
        getGameLeaseCount(); 
        setName(GAME_NAMES.DEHERO)
        break;
      default:
        setGraphService(goerliGraph); break;
    }
    getLeasesList();

  }, [currentGame])

  // const handleSwitchAll = () => {
  //   setCurrentGame(0)
  //   setCurrentPage(1)
  //   setLeasesList([])
  //   setGraphService(goerliGraph);
  //   reloadTotal();
  //   getLeasesList();
  // }
  // const handleSwitchMetaline = () => {
  //   setCurrentGame(1)
  //   setCurrentPage(1)
  //   setLeasesList([])
  //   setGraphService(bsctestGraph);
  //   setGameContracts(GAME_CONTRACTS[1]);
  //   getGameLeaseCount();
  //   getLeasesList();
  // }

  const handelGetMoreList = () => {
    setCurrentPage(currentPage + 1)
    getLeasesList()
  }

  const resetGetList = () => {
    setCurrentPage(1)
    getLeasesList()
  }

  const handleCheckWhitelist = (_: any, checked: boolean) => {
    if (checked) {
      setIsWhitelistOnly(true)
      setNFTTotal(whitelistNums)
      setNFTList([...whitelistLists])
    } else {
      setIsWhitelistOnly(false)
      setCurrentPage(1)
      setNFTList([])
      // fetchNFTList({ pageIndex: 1, pageSize: 12 });
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Market | Rentero</title>
        <meta name="description" content="World’s first NFT rental protocol that is built to maximize utility of NFTs | Lend and rent your NFTs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={showLeftBar ? styles.leftNav : styles.leftNavMin}>
        <Stack className={styles.leftGameList}>
          <Box className={showLeftBar ? styles.sidebarController : styles.sidebarControllerMin}>
            <IconButton onClick={() => setShowLeftBar(!showLeftBar)}>
              {
                showLeftBar ?
                  <WestIcon fontSize="inherit" /> :
                  <FilterAltIcon fontSize="large" />
              }
            </IconButton>
          </Box>
          {/* <Link href={{ pathname: '/' }} > */}
          <Box
            className={cx({ 'gameItem': true, 'activeItem': currentGame == 0 })}
            onClick={() => setCurrentGame(0)}
          >
            <img src={GAME_LOGOS['0']} alt='rentero' />
            {showLeftBar && <Typography>All Game</Typography>}
          </Box>
          {/* </Link> */}
          {/* <Link href={{
            pathname: '/',
            query: { game: GAME_NAMES.METALINE }
          }} > */}
          <Box
            className={cx({ 'gameItem': true, 'activeItem': currentGame == 1 })}
            onClick={() => setCurrentGame(1)}
          >
            <img src={GAME_LOGOS['1']} alt={GAME_NAMES.METALINE} />
            {showLeftBar && <Typography>Metaline</Typography>}
          </Box>
          {/* </Link> */}
          <Box className={cx({
            'gameItem': true,
            'activeItem': currentGame == 2
          })}
            onClick={() => setCurrentGame(2)}
          >
            <img src={GAME_LOGOS['2']} alt={GAME_NAMES.DEHERO} />
            {showLeftBar && <Typography>DeHero</Typography>}
          </Box>
        </Stack>
      </div>
      <div className={styles.contentBox}>
        <section className={styles.topCover}>
          <img src={currentGameInfo.backUrl || "./rentero_top_banner.png"} className={styles.topCoverImage} />
          <img src={GAME_LOGOS[currentGameInfo.gameId as string]} className={styles.topLogo} />
          <Box className={styles.topCoverInfo}>
            <Stack
              direction={minMobileWidth ? 'column' : 'row'}
              spacing={minMobileWidth ? '1.5rem' : '2rem'}
              sx={{ justifyContent: 'space-between' }}>
              <Typography variant='h4' className={styles.gameTitle}>
                {currentGameInfo.gameName}
              </Typography>
              {minMobileWidth &&
                <Typography className={styles.gameDesc}>
                  {currentGameInfo.gameDesc}
                </Typography>}
              <Box className={styles.linkList}>
                <a href={currentGameInfo.gameHomeUrl} target="_blank" rel="noreferrer">
                  <span className={styles.websiteBtn}>
                    Website &nbsp;&nbsp;&nbsp;
                    <ArrowRightAltRoundedIcon style={{ width: '18px', height: '18px', color: 'white' }} />
                  </span>
                </a>
                {
                  currentGameInfo.discordUrl &&
                  <a href={currentGameInfo.discordUrl} target="_blank" rel="noreferrer">
                    <span className={styles.discordLink}></span>
                  </a>
                }
                {
                  currentGameInfo.twitterUrl &&
                  <a href={currentGameInfo.twitterUrl} target="_blank" rel="noreferrer">
                    <span className={styles.twitterLink}></span>
                  </a>
                }
                {
                  currentGameInfo.telegramUrl &&
                  <a href={currentGameInfo.telegramUrl} target="_blank" rel="noreferrer">
                    <span className={styles.telegramLink}></span>
                  </a>
                }
                {
                  currentGameInfo.facebookUrl &&
                  <a href={currentGameInfo.facebookUrl} target="_blank" rel="noreferrer">
                    <span className={styles.facebookLink}></span>
                  </a>
                }
              </Box>
            </Stack>
            {!minMobileWidth && <Typography className={styles.gameDesc}>{currentGameInfo.gameDesc}</Typography>}
          </Box>
        </section>

        <Box className={styles.cardListBox}>
          <Box className={styles.listTitleBox} >
            <div className={styles.listTitle}>
              {NFTTotal} Items &nbsp;
              {/* <span onClick={() => fetchNFTList({ pageIndex: 1, pageSize: 12 })}><AutorenewIcon /></span> */}
            </div>
            <Box className={styles.sortList}>
              {/* {whitelistNums > 0 && <FormControlLabel
              control={<Checkbox
                disableRipple
                onChange={handleCheckWhitelist}
                sx={{
                  '& .MuiSvgIcon-root': { fontSize: 24 },
                  '&.Mui-checked': { color: '#5adcfe' }
                }}
              />}
              label={<>
                <Box component="span" className={styles.whitelistForUser}>
                  Whitelist Only For Me
                </Box>
                <Box component="span" className={styles.whitelistNum}>{whitelistNums}</Box>
              </>}
            />} */}
              {/* <Box
              ref={chainTypeRef}
              onClick={() => setChainTypeShow(true)}
            >
              {CHAINTYPE_SUPPORTED[selectedChain]}
              <KeyboardArrowDownOutlinedIcon />
            </Box>
            <Menu
              anchorEl={chainTypeRef.current}
              open={chainTypeShow}
              onClose={() => setChainTypeShow(false)}
            >
              {CHAINTYPE_SUPPORTED.map((item, index) =>
                <MenuItem
                  key={index}
                  onClick={() => {
                    setChainTypeShow(false)
                    setSelectedChain(index)
                  }}>
                  {item}
                </MenuItem>)}
            </Menu> */}
              {/* <Box
              ref={sortTypeRef}
              onClick={() => setSortTypeShow(true)}
            >
              {SORT_BY[selectedSortBy]}
              <KeyboardArrowDownOutlinedIcon />
            </Box>
            <Menu
              anchorEl={sortTypeRef.current}
              open={sortTypeShow}
              onClose={() => setSortTypeShow(false)}
            >
              {SORT_BY.map((item, index) =>
                <MenuItem
                  key={index}
                  onClick={() => {
                    setSortTypeShow(false)
                    setSelectedSortBy(index)
                  }}
                >
                  {item}
                </MenuItem>
              )}
            </Menu>*/}
            </Box>
          </Box>
          <div className={styles.nftCardList}>
            {
              leasesList?.map((item, index) => {
                return <NFTCard nftInfo={item} key={index} reloadList={resetGetList} />
              })
            }
            {
              isLeasesLoading && <>
                <SkeletonNFTCard />
                <SkeletonNFTCard />
                <SkeletonNFTCard />
                <SkeletonNFTCard />
                <SkeletonNFTCard />
                <SkeletonNFTCard />
                <SkeletonNFTCard />
                <SkeletonNFTCard />
                <SkeletonNFTCard />
                <SkeletonNFTCard />
                <SkeletonNFTCard />
                <SkeletonNFTCard />
              </>
            }
          </div>
          {isMounted && !isWhitelistOnly && !isLeasesLoading &&
            currentPage * pageSize < NFTTotal &&
            <div className={styles.showMore}>
              <span onClick={handelGetMoreList}>Show more</span>
            </div>}
        </Box>
      </div>
    </div >
  )
}

// SSG 在构建 build 时获取各游戏介绍信息
export async function getStaticProps() {
  const data = await getGameInfos()
  return {
    props: {
      gamesInfo: data.data || {}
    }
  }
}

export default Home
