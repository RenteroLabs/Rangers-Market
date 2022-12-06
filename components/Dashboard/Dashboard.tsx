import { Alert, Autocomplete, Box, Button, Card, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, InputBase, MenuItem, Pagination, Paper, Select, SelectChangeEvent, Slide, SlideProps, Snackbar, Stack, Table, TableBody, TableCell, TableFooter, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import styles from './index.module.scss'
import classNames from "classnames/bind"
import NotFound from '../../public/table_not_found.svg'
import Image from "next/image"
import { useIsMounted } from "../../hooks"
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useMemo, useState } from "react"
import ReturnNFTModal from "./Modals/ReturnNFT"
import WithdrawNFTModal from "./Modals/WithdrawNFT"
import { dateFormat, formatAddress, formatTokenId } from "../../utils/format"
import { useAccount, useContract, useSigner } from "wagmi"
import TakeOffNFTModal from "./Modals/TakeOffNFT"
import LendConfig from "../LendNFT/SliptModeLendConfig"
import CloseIcon from '@mui/icons-material/Close'
import { ADDRESS_TOKEN_MAP, SUPPORT_CHAINS, ZERO_ADDRESS } from "../../constants"
import { GET_MY_LENDING, GET_MY_RENTING } from "../../constants/documentNode"
import { useLazyQuery, useQuery } from "@apollo/client"
import { LeaseItem } from "../../types"
import { getNFTInfo } from "../../services/market"
import { BigNumber, ethers } from "ethers"
import { bsctestGraph, goerliGraph, rangersTestGraph } from '../../services/graphql'

const cx = classNames.bind(styles)

export interface DashboardProps { }

const Dashboard: React.FC<DashboardProps> = () => {
  const isMounted = useIsMounted()
  const { address } = useAccount()
  const [tableType, setTableType] = useState<"RENT" | "LEND">('RENT')

  const [targetChain, setTargetChainId] = useState<number>(SUPPORT_CHAINS[0].id)
  const [graphService, setGraphService] = useState<any>(goerliGraph)

  const [lendTotal, setLendTotal] = useState<number>(0)
  const [borrowerTotal, setBorrowerTotal] = useState<number>(0)
  const [rentingList, setRentingList] = useState<LeaseItem[]>([])
  const [lendingList, setLendingList] = useState<LeaseItem[]>([])
  const [rentingMetas, setRentingMetas] = useState<Record<string, any>>({})
  const [lendingMetas, setLendingMetas] = useState<Record<string, any>>({})

  const timestamp = useMemo(() => {
    return (new Date().getTime() / 1000).toFixed()
  }, [])

  const batchRequestMetas = (list: LeaseItem[], listType: 'renting' | 'lending') => {
    const requestList = list.map((item: { tokenId: any; nftAddress: any }) => {
      return getNFTInfo({ tokenId: item.tokenId, contractAddress: item.nftAddress })
    })
    Promise.all(requestList).then(results => {
      let metadata: Record<string, any> = {}
      results.forEach(({ data }) => {
        metadata[`${data.contractAddress.toLowerCase()}-${data.tokenId}`] = data
      })
      if (listType === 'renting') {
        setRentingMetas(metadata)
      }
      if (listType === 'lending') {
        setLendingMetas(metadata)
      }
    })
  }

  const [refetchRenting, { loading: rentLoading }] = useLazyQuery(GET_MY_RENTING, {
    variables: { renter: address, timestamp },
    client: graphService,
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'network-only',
    onCompleted(data) {
      const list = data?.leases
      setRentingList(list)
      batchRequestMetas(list, 'renting')
    }
  })

  const [refetchLending, { loading: lendLoading }] = useLazyQuery(GET_MY_LENDING, {
    variables: { lender: address },
    client: graphService,
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'network-only',
    onCompleted(data) {
      const list = data?.leases
      setLendingList(list)
      batchRequestMetas(list, 'lending')
    }
  })

  const isLoading = useMemo(() => {
    return lendLoading || rentLoading
  }, [rentLoading, lendLoading])

  useEffect(() => {
    refetchLending()
    refetchRenting()
  }, [address])

  useEffect(() => {
    setRentingList([])
    setLendingList([])
    switch (targetChain) {
      case 1:
      case 4:
        setGraphService(goerliGraph);
        break;
      case 56:
      case 97:
        setGraphService(bsctestGraph);
        break;
      case 2025:
      case 9527:
        setGraphService(rangersTestGraph);
        break;
      default:
        setGraphService(goerliGraph)
        break;
    }
    refetchRenting({ variables: { renter: address, timestamp } })
    refetchLending({ variables: { lender: address } })
  }, [targetChain])

  const columns = [
    {
      title: 'NFT',
      dataindex: 'nft',
    }, {
      title: 'Daily Price',
    }, {
      title: "Payment Cycle"
    }, {
      title: 'Expire time',
      dataIndex: 'orderTime',
    }, {
      title: 'Deposit',
      dataIndex: 'deposit',
    }, {
      title: 'Manage'
    }
  ]

  return <Box>
    <Box className={styles.tableSearch}>
      <Box className={styles.toggleBtnGroup}>
        <div onClick={() => setTableType('RENT')}>
          <Chip
            label="My Renting"
            variant="outlined"
            className={cx({ 'activeButton': tableType === 'RENT' })}
          />
        </div>
        <div onClick={() => setTableType('LEND')}>
          <Chip
            label="My Lending"
            variant="outlined"
            className={cx({ 'activeButton': tableType === 'LEND' })}
          />
        </div>
      </Box>
      {/* <Paper component="form" className={styles.searchInput}>
        <IconButton>
          <SearchIcon sx={{ color: '#777E90', width: '1.4rem', height: '1.4rem' }} />
        </IconButton>
        <InputBase
          sx={{ flex: 1 }}
          placeholder="Enter NFT Id or Name For Searching"
        />
      </Paper> */}

      <Select
        className={styles.networkChangeSelect}
        size="small"
        value={targetChain.toString()}
        onChange={(e: SelectChangeEvent) => setTargetChainId(parseInt(e.target.value))}
      >
        {SUPPORT_CHAINS.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)}
      </Select>
    </Box>
    <Table className={styles.tableBox}>
      <TableHead className={styles.tableHeader}>
        <TableRow>
          {columns.map((item, index) => {
            return <TableCell key={index} align={index === columns.length - 1 ? 'center' : 'left'}>{item.title}</TableCell>
          })}
        </TableRow>
      </TableHead>
      <TableBody className={styles.tableBody}>
        {
          !isLoading && (tableType === 'RENT' ? rentingList : lendingList).map((item, index) => {
            const metaList = tableType === 'RENT' ? rentingMetas : lendingMetas
            const nftStats = (item?.expires || 0) > timestamp ? 'renting' : 'lending'
            let metadata
            try {
              if (metaList[[item.nftAddress, item.tokenId].join('-')]?.metadata) {
                metadata = JSON.parse(metaList[[item.nftAddress, item.tokenId].join('-')]?.metadata)
              }
            } catch (err) {
              console.error(err)
            }
            return <TableRow key={index}>
              <TableCell>
                <Box className={styles.nftBoxCell}>
                  <Box className={styles.boxImage}>
                    <img src={metaList[[item.nftAddress, item.tokenId].join('-')]?.imageUrl} />
                    {item.whitelist !== ZERO_ADDRESS && <span className={styles.whitelistIcon}></span>}
                  </Box>
                  <Stack sx={{ margin: 'auto 1rem' }}>
                    <Typography className={styles.nftCollectionName}>
                      {metadata?.name}
                      &nbsp;#{formatTokenId(item.tokenId)}
                    </Typography>
                    <Typography className={styles.nftAddress}>
                      {tableType === 'LEND' && nftStats === 'lending'
                        ? '-'
                        : formatAddress(tableType === 'RENT' ? item.lender : item.renter, 5)}
                    </Typography>
                  </Stack>
                </Box>
              </TableCell>
              <TableCell >
                <Box className={styles.payCoinCol}>
                  <img src={ADDRESS_TOKEN_MAP[item?.erc20Address]?.logo} />
                  {ethers.utils.formatUnits(BigNumber.from(item?.rentPerDay), ADDRESS_TOKEN_MAP[item?.erc20Address]?.decimal)}
                </Box>
              </TableCell>
              <TableCell>
                {item?.daysPerPeriod}
              </TableCell>
              <TableCell>
                {
                  item?.expires < (Number(new Date) / 1000).toFixed()
                    ? '-'
                    : dateFormat('YYYY-mm-dd HH:MM', new Date(parseInt(item?.expires) * 1000))
                }
              </TableCell>
              <TableCell >
                {
                  parseInt(item.deposit) !== 0 ?
                    <Box className={styles.payCoinCol}>
                      <img src={ADDRESS_TOKEN_MAP[item?.erc20Address]?.logo} />
                      {ethers.utils.formatUnits(BigNumber.from(item?.deposit), ADDRESS_TOKEN_MAP[item?.erc20Address]?.decimal)}
                    </Box> :
                    '-'
                }
              </TableCell>
              <TableCell align="center">
                {tableType === 'RENT' &&
                  <ReturnNFTModal
                    trigger={<span className={cx({ "returnButton": true })}>Return</span>}
                    tokenId={item.tokenId}
                    nftAddress={item.nftAddress}
                    chain={item.chain}
                    reloadTable={refetchRenting}
                  />}
                {tableType === 'LEND' &&
                  <WithdrawNFTModal
                    trigger={<span className={cx({ "returnButton": true, })} >Redeem</span>}
                    rentInfo={item}
                    reloadTable={refetchLending}
                  />}
              </TableCell>
            </TableRow>
          })
        }
      </TableBody>
      {
        isLoading &&
        <TableFooter className={styles.tableFooter}>
          <TableRow>
            <TableCell colSpan={12}>
              <CircularProgress />
            </TableCell>
          </TableRow>
        </TableFooter>
      }
      {
        !isLoading
        && isMounted
        && (tableType === 'LEND' && lendingList.length === 0 || tableType === 'RENT' && rentingList.length === 0)
        && <TableFooter className={styles.tableFooter}>
          <TableRow>
            <TableCell colSpan={12}>
              <Image src={NotFound} />
              <Typography>Nothing Found</Typography>
            </TableCell>
          </TableRow>
        </TableFooter>
      }
    </Table>
    {/* 
    <Pagination
      className={styles.pagination}
      count={tableType === 'LEND' ? lendTotal : borrowerTotal}
      onChange={(_, currentPage: number) => {
        if (tableType === 'LEND') {
          // getLenderList({ token: jwtToken, pageIndex: currentPage })
        } else if (tableType === 'RENT') {
          // getBorrowerList({ token: jwtToken, pageIndex: currentPage })
        }
      }} /> */}
  </Box>
}

export default Dashboard