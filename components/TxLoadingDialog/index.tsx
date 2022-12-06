import { useMemo } from 'react';
import { Box, CircularProgress, Dialog, Link, Typography } from '@mui/material'
import React from 'react'
import styles from './index.module.scss'
import { useNetwork } from 'wagmi';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface TxLoadingDialogProps {
  showTxDialog: boolean;
  txHash: string
}

const TxLoadingDialog: React.FC<TxLoadingDialogProps> = (props) => {
  const { showTxDialog, txHash } = props
  const { chain } = useNetwork()

  const blockscanUrl = useMemo(() => {
    return `${chain?.blockExplorers?.default.url}/tx/${txHash}`
  }, [txHash, chain])

  return <Dialog
    className={styles.txDialog}
    open={showTxDialog}>
    <Box className={styles.txDialogBox}>
      <CircularProgress size={48} sx={{ mb: '2.67rem' }} />
      {
        txHash ?
          <Box>
            <Typography>Transaction is packaging in blockchain...</Typography>
            <Link href={blockscanUrl} className={styles.txLink} target="__blank">
              See Detail In Blockscan <OpenInNewIcon />
            </Link>
          </Box> :
          <Typography>Confirm this transaction in your wallet.</Typography>
      }
    </Box>
  </Dialog>
}

export default TxLoadingDialog