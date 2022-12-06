import { Box, Stack } from "@mui/material";
import { Container } from "@mui/system";
import { NextPage } from "next";
import Head from 'next/head';
import styles from '../../styles/dashboard.module.scss'
import DashboardIcon from '@mui/icons-material/Dashboard';
import BallotIcon from '@mui/icons-material/Ballot';
import PaidIcon from '@mui/icons-material/Paid';
import { useEffect, useState } from "react";
import DashboardBox from '../../components/Dashboard/Dashboard'
import Withdraw from "../../components/Dashboard/Withdraw";
import Payout from "../../components/Dashboard/Payout";
import ConnectWallet from "../../components/ConnectWallet";
import { useAccount } from "wagmi";

const NAV_ITEM_LIST = [
  'Dashboard',
  "Withdraw",
  "Payouts",
]

const Dashboard: NextPage = () => {
  const [currentNav, setCurrentNav] = useState<string>(NAV_ITEM_LIST[0])
  const [showConnect, setShowConnect] = useState<boolean>(false)
  const { address } = useAccount()

  useEffect(() => {
    if (!address) {
      setShowConnect(true)
    }
  }, [address])

  return <Container className={styles.mainBox}>
    <Head>
      <title>Dashboard | Rentero</title>
      <meta name="description" content="Manage your lend & rent NFTs and incomes" />
    </Head>

    <div className={styles.contentBox}>
      {currentNav === NAV_ITEM_LIST[0] && <DashboardBox />}
      {/* {currentNav === NAV_ITEM_LIST[1] && <Withdraw />} */}
      {/* {currentNav === NAV_ITEM_LIST[2] && <Payout />} */}
      <ConnectWallet
        showConnect={showConnect}
        trigger={<></>}
        closeCallback={() => { }}
      />
    </div>
  </Container>
}

export default Dashboard