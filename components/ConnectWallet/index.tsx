import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Box, CircularProgress, Dialog, DialogTitle, Drawer, IconButton, Typography, useMediaQuery } from '@mui/material'
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import CloseIcon from '@mui/icons-material/Close';
import styles from './index.module.scss'
import { Connector, useConnect } from 'wagmi';

interface ConnectWalletProps {
  trigger: React.ReactElement
  closeCallback: () => any;
  showConnect?: boolean
}

const ConnectWallet: React.FC<ConnectWalletProps> = (props) => {
  const { trigger, closeCallback, showConnect } = props
  const isMobileSize = useMediaQuery('(max-width: 600px)')
  const [visibile, setVisibile] = useState<boolean>(false)

  const showDrawer = useMemo(() => {
    return visibile && isMobileSize
  }, [visibile, isMobileSize])

  useEffect(() => {
    if (showConnect) {
      setVisibile(true)
    }
  }, [showConnect])

  const { connect, connectors, error, isLoading, pendingConnector } = useConnect({
    onSuccess() {
      setVisibile(false)
      closeCallback()
    }
  })

  const [MetaMaskConnector, WalletConnectConnector] = connectors

  const [MetaMaskConnecting, WalletConnectConnecting] = useMemo(() => {
    if (!isLoading) return [false, false]

    return [
      MetaMaskConnector.id === pendingConnector?.id,
      WalletConnectConnector.id === pendingConnector?.id
    ]
  }, [isLoading, pendingConnector])

  const handleConnect = async (selectedConnector: Connector) => {
    if (isLoading && pendingConnector?.id === selectedConnector.id) {
      return
    }
    await connect({ connector: selectedConnector })
  }

  // current support metamask and walletconnect to login
  return <Box sx={{ width: '100%' }}>
    <div className={styles.triggerBox} onClick={() => { setVisibile(true) }}>
      {trigger}
    </div>
    <Dialog open={visibile && !isMobileSize} className={styles.container} >
      <DialogTitle className={styles.dialogTitle} >
        Choose a wallet
        <IconButton
          aria-label="close"
          onClick={() => setVisibile(false)}
          sx={{
            position: 'absolute', right: 8, top: "2rem", color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <div className={styles.dialogContent}>
        <Box className={styles.walletList}>
          {error &&
            <Alert severity="error" sx={{ display: 'flex', alignItems: 'center' }}>
              {error.message}
            </Alert>}
          <Box className={styles.walletItem}>
            <div
              onClick={() => handleConnect(connectors[0])}>
              <span className={styles.itemMetamaskLogo}></span>
              <p>MetaMask</p>
              {MetaMaskConnecting ? <CircularProgress /> : <ArrowRightAltRoundedIcon />}
            </div>
          </Box>

          <Box className={styles.walletItem}>
            <div
              onClick={() => handleConnect(WalletConnectConnector)}>
              <span className={styles.itemWalletConnectLogo}></span>
              <p>WalletConnect</p>
              {WalletConnectConnecting ? <CircularProgress /> : <ArrowRightAltRoundedIcon />}
            </div>
          </Box>
        </Box>
      </div>
    </Dialog>

    <Drawer
      anchor="right"
      open={showDrawer}
      onClose={() => setVisibile(false)}
      className={styles.drawer}
      ModalProps={{ keepMounted: true }}
      key="wallet_connect"
    >
      <Box className={styles.drawerWalletBox}>
        <Typography variant='h3'>Choose Wallet</Typography>

        {error &&
          <Alert severity="error" variant="outlined" sx={{ display: 'flex', alignItems: 'center', mb: '2rem' }}>
            {error.message}
          </Alert>}

        <Box className={styles.walletItem}>
          <div
            onClick={() => handleConnect(connectors[0])}>
            <span className={styles.itemMetamaskLogo}></span>
            <p>MetaMask</p>
            {MetaMaskConnecting ? <CircularProgress /> : <ArrowRightAltRoundedIcon />}
          </div>
        </Box>

        <Box className={styles.walletItem}>
          <div
            onClick={() => handleConnect(WalletConnectConnector)}>
            <span className={styles.itemWalletConnectLogo}></span>
            <p>WalletConnect</p>
            {WalletConnectConnecting ? <CircularProgress /> : <ArrowRightAltRoundedIcon />}
          </div>
        </Box>
      </Box>
    </Drawer>
  </Box>
}

export default ConnectWallet