import { Alert, Box, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useAccount, useContract, useSigner } from 'wagmi'
import CircularProgress from '@mui/material/CircularProgress';
// import { ROPSTEN_MARKET, ROPSTEN_MARKET_ABI } from '../../../constants/contractABI'
import AppDialog from '../../Dialog'
import styles from './modal.module.scss'

interface TakeOffNFTModalProps {
  trigger: React.ReactElement,
  orderId: number
}

const TakeOffNFTModal: React.FC<TakeOffNFTModalProps> = (props) => {
  const { trigger, orderId } = props
  const [hiddenDialog, setHiddenDialog] = useState<boolean>(false)
  const [txError, setTxError] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { address } = useAccount()
  const { data: signer } = useSigner()

  // const contractMarket = useContract({
  //   addressOrName: ROPSTEN_MARKET,
  //   contractInterface: ROPSTEN_MARKET_ABI,
  //   signerOrProvider: signer
  // })

  const withdrawLendNFT = async () => {
    if (isLoading) return
    setIsLoading(true)
    setTxError('')
    try {
      // await contractMarket.cancelOrderForLender(orderId)
      hiddenAppDialog()
      // TODO: 弹框提示：当前 NFT 将在几分钟内被下架

    } catch (err: any) {
      setTxError(err?.error?.message || err.message)
    }
    setIsLoading(false)
  }

  const hiddenAppDialog = () => {
    setHiddenDialog(true)
    setTxError('')
  }

  return <AppDialog
    trigger={trigger}
    title="TakeOff NFT"
    hiddenDialog={hiddenDialog}
  >
    <Box sx={{ p: '3.33rem', pt: '2.67rem', width: '46rem' }}>
      <Typography className={styles.normalText} >
        Are you sure to take off the NFT in the market? You will stop earning yields once confirming.
      </Typography>

      {txError && <Alert variant="outlined" severity="error" sx={{ mt: '2rem', minWidth: 'none' }}>{txError}</Alert>}

      <Stack direction="row" spacing="3.33rem" sx={{ mt: '2.67rem' }}>
        <Box className={styles.primaryButton} onClick={withdrawLendNFT}>
          {isLoading && <CircularProgress sx={{ width: '2rem', height: '2rem' }} />}
          Confirm
        </Box>
        <Box className={styles.defaultButton} onClick={hiddenAppDialog}>Cancel</Box>
      </Stack>
    </Box>
  </AppDialog>
}

export default TakeOffNFTModal