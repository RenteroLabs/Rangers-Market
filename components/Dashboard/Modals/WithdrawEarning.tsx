import { Box, Stack, Typography } from '@mui/material'
import React from 'react'
import { useAccount } from 'wagmi'
import AppDialog from '../../Dialog'
import styles from './modal.module.scss'

interface WithdrawEarningModalProps {
  trigger: React.ReactElement
}

const WithdrawEarningModal: React.FC<WithdrawEarningModalProps> = (props) => {
  const { trigger } = props
  const { address } = useAccount()

  return <AppDialog
    trigger={trigger}
    title="Withdraw Earnings"
  >
    <Box sx={{ p: '3.33rem', pt: '2.67rem' }}>
      <Typography className={styles.normalText} >
        Are you sure to withdraw your earnings? your earnings will be sent to the address below <span className={styles.tipsText}>(once confirmed, couldn&#39;t be changed, please check it carefully)</span>
      </Typography>
      <Box className={styles.addressBox}>{address}</Box>
      <Stack direction="row" spacing="3.33rem" sx={{ mt: '2.67rem' }}>
        <Box className={styles.primaryButton}>Confirm</Box>
        <Box className={styles.defaultButton}>Cancel</Box>
      </Stack>
    </Box>
  </AppDialog>
}

export default WithdrawEarningModal