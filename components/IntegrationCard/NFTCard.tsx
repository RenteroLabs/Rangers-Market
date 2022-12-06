import { Avatar, Box, Card, Typography } from '@mui/material'
import React from 'react'
import Image from 'next/image'
import styles from './index.module.scss'
import RatioOff from '../../public/ratio_button_off.svg'
import CheckIcon from '@mui/icons-material/Check';
import { CHAIN_ICON } from '../../constants'
import { formatTokenId } from '../../utils/format'

interface NFTCardProps {
  nftImage: string;
  nftNumber: string;
  nftName: string;
  nftAddress: string;
  selectedNFT: string;
  chainId: number
  setSelectedNFT: (nftNumber: string) => any;
  setContractAddress: (address: string) => any;
}

const NFTCard: React.FC<NFTCardProps> = (props) => {
  const { nftImage, nftName, nftNumber, selectedNFT, setSelectedNFT, chainId, setContractAddress, nftAddress } = props

  const handleClickNFT = () => {
    setSelectedNFT(selectedNFT !== nftNumber ? nftNumber : '')
    console.log(nftAddress)
    setContractAddress(nftAddress)
  }

  return <Box className={styles.nftCard} onClick={handleClickNFT} >
    <img src={nftImage} alt={`${nftName} #${nftNumber}`} className={styles.nftCover} />
    {
      selectedNFT === nftNumber ?
        <div className={styles.radioCheck}>✔</div> :
        <div className={styles.radioOff} >
          <Image src={RatioOff} />
        </div>
    }
    <Typography variant='h3' className={styles.nftName}>{nftName}</Typography>
    <Typography variant="body2" className={styles.nftNumber} >
      #{formatTokenId(nftNumber)}
      {chainId && <Avatar
        src={CHAIN_ICON[chainId]}
        sx={{ width: '1.67rem', height: '1.67rem', marginLeft: '1rem' }}
      />}
    </Typography>
  </Box>
}

export default NFTCard