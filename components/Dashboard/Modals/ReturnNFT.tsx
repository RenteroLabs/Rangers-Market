import React, { useEffect, useState } from 'react'
import { Alert, Box, Typography, Stack } from '@mui/material'
import { useSigner, useContract, useWaitForTransaction, useNetwork } from 'wagmi'
import { INSTALLMENT_MARKET, INSTALLMENT_MARKET_ABI } from '../../../constants/contractABI'
import AppDialog from '../../Dialog'
import TxLoadingDialog from '../../TxLoadingDialog'
import DefaultButton from '../../Buttons/DefaultButton'
import styles from './modal.module.scss'
import { CHAIN_ID_MAP } from '../../../constants'
import SwitchNetwork from '../../SwitchNetwork'
import { formatTokenId } from '../../../utils/format'
import { BigNumber } from 'ethers'

interface ReturnNFTModalProps {
  trigger: React.ReactElement,
  tokenId: string;
  chain: string;
  nftAddress: string;
  reloadTable: () => any;
}

const ReturnNFTModal: React.FC<ReturnNFTModalProps> = (props) => {
  const { trigger, tokenId, nftAddress, reloadTable, chain } = props
  const [showDialog, setHiddenDialog] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [txError, setTxError] = useState<string>('')

  const [showSwitchNetworkDialog, setShowSwitchNetworkDialog] = useState<boolean>(false)

  const [showTxDialog, setShowTxDialog] = useState<boolean>(false)

  const { data: signer } = useSigner()
  const { chain: currentChain } = useNetwork()

  useEffect(() => {
    if (!showDialog && currentChain?.id != CHAIN_ID_MAP[chain]) {
      setShowSwitchNetworkDialog(true)
    }
  }, [showDialog])

  const contractMarket = useContract({
    addressOrName: INSTALLMENT_MARKET[CHAIN_ID_MAP[chain]],
    contractInterface: INSTALLMENT_MARKET_ABI,
    signerOrProvider: signer
  })

  const [abortTxHash, setAbortTxHash] = useState<string | undefined>()
  useWaitForTransaction({
    hash: abortTxHash,
    onSuccess: async () => {
      // 关闭弹窗
      setHiddenDialog(true)
      // 刷新列表数据
      reloadTable()
    },
    onSettled: () => {
      setIsLoading(false)
      setShowTxDialog(false)
      setAbortTxHash('')
    }
  })

  const returnBorrowerNFT = async () => {
    setIsLoading(true)
    setShowTxDialog(true)
    setTxError('')
    try {
      const { hash } = await contractMarket.abort(nftAddress, BigNumber.from(tokenId))
      setAbortTxHash(hash)
    } catch (err: any) {
      setTxError(err?.error?.message || err.message)
      setIsLoading(false)
      setShowTxDialog(false)
    }
  }

  return <AppDialog
    title={`Return NFT #${formatTokenId(tokenId)}`}
    trigger={trigger}
    hiddenDialog={showDialog}
  >
    <Box className={styles.returnNFTDialogBox}>
      <Typography className={styles.normalText}>Are you sure to return the NFT early? once returned you won&#39;t be able to use the NFT anymore and lose your deposit.</Typography>

      {txError && <Alert
        variant="outlined"
        severity="error"
        sx={{ mt: '2rem', mb: '-1rem', wordBreak: 'break-word' }}
        className="alertTxErrorMsg"
        onClose={() => setTxError('')}
      >
        {txError}
      </Alert>}

      <Stack spacing="3.33rem" sx={{ mt: '2.67rem', textAlign: 'center' }}>
        <DefaultButton
          className={styles.defaultButton}
          loading={isLoading}
          onClick={returnBorrowerNFT}
        >
          Confirm
        </DefaultButton>
      </Stack>
    </Box>

    <SwitchNetwork
      showDialog={showSwitchNetworkDialog}
      closeDialog={() => {
        setShowSwitchNetworkDialog(false)
        setHiddenDialog(true)
      }}
      callback={() => {
        setShowSwitchNetworkDialog(false)
      }}
      targetNetwork={CHAIN_ID_MAP[chain] as number}
    />

    <TxLoadingDialog showTxDialog={showTxDialog} txHash={abortTxHash || ''} />
  </AppDialog>
}

export default ReturnNFTModal