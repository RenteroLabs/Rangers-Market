import { Box, Breadcrumbs, Container, Link, Typography } from "@mui/material";
import type { NextPage } from "next";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import styles from '../styles/trail.module.scss';
import { useEffect, useState } from "react";
import { useRequest } from "ahooks";
import { getMarketNFTList } from "../services/market";
import SkeletonNFTCard from "../components/NFTCard/SkeletonNFTCard";
import NFTCard from "../components/NFTCard";
import { useIsMounted } from "../hooks";

const TrialMode: NextPage = () => {
  const [nftList, setNFTList] = useState<Record<string, any>[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [NFTTotal, setNFTTotal] = useState<number>(0)
  const isMounted = useIsMounted()

  const { run: fetchNFTList, loading } = useRequest(getMarketNFTList, {
    manual: true,
    onSuccess: ({ data }) => {
      setNFTList([...nftList, ...data.pageContent])
    }
  })

  useEffect(() => {
    fetchNFTList({ pageIndex: 1, pageSize: 12, mode: 'FreeTrial' })
  }, [])

  const handelGetMoreList = async () => {
    fetchNFTList({ pageIndex: currentPage + 1, pageSize: 12, mode: 'FreeTrial' })
    setCurrentPage(currentPage + 1)
  }

  return <div>
    <Box className={styles.navBox}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
        <Link href={"/"}>Home</Link>
        <Link href={"/"}>Market</Link>
        <Typography >TrialMode</Typography>
      </Breadcrumbs>
    </Box>

    <Box className={styles.sectionHeader}>
      <Typography>Trial Zone</Typography>
      <Box></Box>
    </Box>

    <Box className={styles.nftCardList}>
      {
        // nftList.map((item, index) => {
        //   // return <NFTCard nftInfo={item} key={index} mode="@trial" />
        // })
      }
    </Box>

    {/* 骨架图 */}
    {loading && <Box>
      <Box className={styles.nftCardList}>
        <SkeletonNFTCard />
        <SkeletonNFTCard />
        <SkeletonNFTCard />
        <SkeletonNFTCard />
      </Box>
      <Box className={styles.nftCardList}>
        <SkeletonNFTCard />
        <SkeletonNFTCard />
        <SkeletonNFTCard />
        <SkeletonNFTCard />
      </Box>
    </Box>}

    {((12 * currentPage) < NFTTotal) && isMounted &&
      <div className={styles.showMore}>
        <span onClick={handelGetMoreList}>Show more</span>
      </div>}
  </div>
}

export default TrialMode