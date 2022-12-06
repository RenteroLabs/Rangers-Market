import { Box, Chip, CircularProgress, IconButton, InputBase, Pagination, Paper, Table, TableBody, TableCell, TableFooter, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import styles from './index.module.scss'
import classNames from 'classnames/bind';
import NotFound from '../../public/table_not_found.svg'
import { useIsMounted } from '../../hooks';
import WithdrawEarningModal from './Modals/WithdrawEarning';
import Image from 'next/image';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import { useLocalStorageState, useRequest } from 'ahooks';
import { getBillList, getWalletList } from '../../services/dashboard';

const cx = classNames.bind(styles)

export interface WithdrawProps {

}
const columns = [
  {
    title: 'Token',
    dataIndex: 'token',
  }, {
    title: 'Game/Blockchain',
    dataIndex: 'game',
  }, {
    title: 'Amount',
    dataIndex: 'amount',
  }, {
    title: 'Operate'
  }
]

const operateRecordColumns = [
  {
    title: 'Token',
    dataIndex: 'token'
  }, {
    title: 'Game',
    dataindex: 'game',
  }, {
    title: 'NFT',
    dataIndex: 'nft',
  }, {
    title: 'Operation',
    dataIndex: 'operation',
  }, {
    title: 'Change',
    dataIndex: 'change',
  }, {
    title: 'Time',
    dataIndex: 'time',
  }
]

const dataSource = [
  {
    token: 'SLP',
    amount: '100',
    game: 'Axie',
  }, {
    token: 'ABC',
    amount: '122',
    game: 'Game'
  }
]

const Withdraw: React.FC<WithdrawProps> = (props) => {
  const { } = props
  const isMounted = useIsMounted()
  const [rawToken] = useLocalStorageState<string>('token')
  const [billListData, setBillListData] = useState<Record<string, any>[]>([])
  const [walletList, setWalletList] = useState<Record<string, any>[]>([])

  const jwtToken = useMemo(() => {
    if (!rawToken) return ''
    return rawToken.split('*')[1]
  }, [rawToken])

  const { run: queryBillList, loading: billLoading } = useRequest(getBillList, {
    manual: true,
    onSuccess: ({ data }) => {
      setBillListData(data || [])
    }
  })

  const { run: queryWalletList, loading: walletLoading } = useRequest(getWalletList, {
    manual: true,
    onSuccess: ({ data }) => {
      console.log(data)
      setWalletList(data || [])
    }
  })

  useEffect(() => {
    queryBillList(jwtToken)
    queryWalletList(jwtToken)
  }, [])

  return <div>
    <Box className={styles.tableSearch}>
      <Typography className={styles.tableTitle}>Total Assets</Typography>
    </Box>
    {/* 钱包提现 List */}
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
          walletList.map((item, index) => {
            return <TableRow key={index}>
              <TableCell>{item.token}</TableCell>
              <TableCell>{item.game}</TableCell>
              <TableCell>{item.amount}</TableCell>
              <TableCell align="center">
                <WithdrawEarningModal
                  trigger={<span className={cx({ "returnButton": true, "returnButton_disable": index === 1 })}>Withdraw</span>}
                />
              </TableCell>
            </TableRow>
          })
        }
      </TableBody>
      {
        walletList.length === 0 && isMounted && <TableFooter className={styles.tableFooter}>
          <TableRow>
            <TableCell colSpan={12}>
              <Typography
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <ManageSearchOutlinedIcon />&nbsp; No Assets
              </Typography>
            </TableCell>
          </TableRow>
        </TableFooter>
      }
    </Table>
    {/* <Pagination count={3} className={styles.pagination} onChange={(_, currentPage: number) => {
      console.log(currentPage)
    }} /> */}

    <Box className={styles.operationBox}>
      <Box className={styles.operationHeader}>
        <Typography className={styles.tableTitle}>Value Change Record</Typography>
      </Box>
      <Table
        className={styles.tableBox}
        sx={{ borderTopRightRadius: '0px !important', borderTopLeftRadius: '0px !important' }}>
        <TableHead className={styles.recordBoxHeader} >
          <TableRow>
            {operateRecordColumns.map((item, index) => {
              return <TableCell key={index} align={index === columns.length - 1 ? 'center' : 'left'}>{item.title}</TableCell>
            })}
          </TableRow>
        </TableHead>
        <TableBody className={styles.tableBody}>
          {
            billListData.map((item, index) => {
              return <TableRow key={index}>
                <TableCell>{item.token}</TableCell>
                <TableCell>{item.game}</TableCell>
                <TableCell>{item.nft}</TableCell>
                <TableCell>{item.operation}</TableCell>
                <TableCell>{item.change}</TableCell>
                <TableCell>{item.time}</TableCell>
              </TableRow>
            })
          }
        </TableBody>
        {
          billLoading &&
          <TableFooter className={styles.tableFooter}>
            <TableRow>
              <TableCell colSpan={12}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          </TableFooter>
        }
        {
          !billLoading && isMounted && billListData.length === 0 &&
          <TableFooter className={styles.tableFooter}>
            <TableRow>
              <TableCell colSpan={12}>
                <Image src={NotFound} />
                <Typography>Nothing Found</Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        }
      </Table>
    </Box>
  </div>
}

export default Withdraw