import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import styles from './styles.module.scss'

interface SwitchNetworkProps {
  showDialog: boolean;
  targetNetwork: number;
  /** cancel callback */
  closeDialog: () => any;
  /** switched callback */
  callback: () => any;
}

const SwitchNetwork: React.FC<SwitchNetworkProps> = (props) => {
  const { showDialog, closeDialog, targetNetwork, callback } = props

  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const { isLoading, switchNetwork } = useSwitchNetwork({
    onError(error: any) {
      console.error(error.message)
    },
    onSuccess() {
      callback()
    }
  })

  const handleSwitchNetwork = async () => {
    if (switchNetwork && isConnected && chain?.id !== targetNetwork) {
      switchNetwork(targetNetwork)
    }
  }

  return <Dialog
    open={showDialog}
    classes={{ paper: styles.dialogPaper }}
  >
    <DialogTitle classes={{ root: styles.dialogModalTitle }}> Switch Network</DialogTitle>
    <Typography className={styles.dialogModalContent} >
      Please switch network to to lend or rent it!
    </Typography>
    <DialogActions classes={{ root: styles.dialogModalActions }}>
      <Stack direction="row">
        <Button variant="outlined" onClick={closeDialog}>Cancel</Button>
        <LoadingButton
          loading={isLoading}
          variant="contained"
          onClick={() => handleSwitchNetwork()}
        >
          Switch Network
        </LoadingButton>
      </Stack>
    </DialogActions>
  </Dialog>
}

export default SwitchNetwork