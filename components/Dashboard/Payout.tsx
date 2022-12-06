import { Box, IconButton, Paper, Table, Typography, InputBase, Pagination, TableBody, TableCell, TableFooter, TableHead, TableRow, ToggleButton, ToggleButtonGroup, } from "@mui/material"
import styles from './index.module.scss'
import SearchIcon from '@mui/icons-material/Search';
import classNames from "classnames/bind";
import NotFound from '../../public/table_not_found.svg'
import { useIsMounted } from "../../hooks";
import Image from "next/image";

export interface PayoutProps {

}

const columns = [
  {
    title: 'ID',
    dataIndex: 'id'
  }, {
    title: 'NFT',
    dataindex: 'nft',
  }, {
    title: 'Address',
    dataIndex: 'address',
  }, {
    title: 'Earning',
    dataIndex: 'totalEarning'
  }, {
    title: 'Game Name',
    dataIndex: 'gameName',
  }, {
    title: 'Status',
    dataIndex: 'status'
  }, {
    title: 'Time',
    dataIndex: 'time',
  }
]

const dataSource = [
  {
    id: 23,
    nftImageUrl: '',
    nftName: '',
    nftOwnerAddress: '',
    totalEarning: '',
    ratio: '',
    gameName: '',
    time: '',
    status: '',
  }, {
    id: 24,
    nftImageUrl: '',
    nftName: '',
    nftOwnerAddress: '',
    totalEarning: '',
    ratio: '',
    gameName: '',
    time: '',
    status: '',
  }, {
    id: 25,
    nftImageUrl: '',
    nftName: '',
    nftOwnerAddress: '',
    totalEarning: '',
    ratio: '',
    gameName: '',
    time: '',
    status: '',
  }, {
    id: 26,
    nftImageUrl: '',
    nftName: '',
    nftOwnerAddress: '',
    totalEarning: '',
    ratio: '',
    gameName: '',
    time: '',
    status: '',
  },
]

const cx = classNames.bind(styles)

const Payout: React.FC<PayoutProps> = (props) => {
  const { } = props
  const isMounted = useIsMounted()

  return <div>
    <Box className={styles.tableSearch}>
      <Typography className={styles.tableTitle}>Payouts</Typography>
      <Paper component="form" className={styles.searchInput}>
        <IconButton>
          <SearchIcon sx={{ color: '#777E90' }} />
        </IconButton>
        <InputBase
          sx={{ flex: 1 }}
          placeholder="Enter NFT Id or Name For Searching"
        />
      </Paper>
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
          dataSource.map((item, index) => {
            return <TableRow key={index}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.nftImageUrl}</TableCell>
              <TableCell>{item.totalEarning}</TableCell>
              <TableCell>{item.ratio}</TableCell>
              <TableCell>{item.gameName}</TableCell>
              <TableCell>{item.time}</TableCell>
              <TableCell>{item.status}</TableCell>
            </TableRow>
          })
        }
      </TableBody>
      {
        dataSource.length === 0 && isMounted && <TableFooter className={styles.tableFooter}>
          <TableRow>
            <TableCell colSpan={12}>
              <Image src={NotFound} />
              <Typography>Nothing Found</Typography>
            </TableCell>
          </TableRow>
        </TableFooter>
      }
    </Table>
    <Pagination count={1} className={styles.pagination} onChange={(_, currentPage: number) => {
      console.log(currentPage)
    }} />
  </div>
}

export default Payout