import { Alert, Box, Stack, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { erc20ABI, useAccount, useContract, useNetwork, useSigner, useWaitForTransaction } from 'wagmi'
import classNames from 'classnames/bind';
import { INSTALLMENT_MARKET, INSTALLMENT_MARKET_ABI } from '../../../constants/contractABI'
import AppDialog from '../../Dialog'
import styles from './modal.module.scss'
import DefaultButton from '../../Buttons/DefaultButton';
import { LeaseItem } from '../../../types';
import { BigNumber, ethers, utils } from 'ethers';
import TxLoadingDialog from '../../TxLoadingDialog';
import { ADDRESS_TOKEN_MAP, CHAIN_ID_MAP, ONEDAY, ZERO_ADDRESS } from '../../../constants';
import { dateFormat, formatTokenId } from '../../../utils/format';
import SwitchNetwork from '../../SwitchNetwork';

const cx = classNames.bind(styles)
interface WithdrawNFTModalProps {
  trigger: React.ReactElement,
  rentInfo: LeaseItem;
  reloadTable: () => any;
}

const WithdrawNFTModal: React.FC<WithdrawNFTModalProps> = (props) => {
  const { trigger, rentInfo, reloadTable } = props
  const [hiddenDialog, setHiddenDialog] = useState<boolean>(false)
  const [txError, setTxError] = useState<string | undefined>()
  const [buttonLoading, setButtonLoading] = useState<boolean>(false)
  const [showSwitchNetworkDialog, setShowSwitchNetworkDialog] = useState<boolean>(false)

  const { address } = useAccount()
  const { chain } = useNetwork()
  const [isApproved, setIsApproved] = useState<boolean>(false)
  const [alreadyApproved, setAlreadyApproved] = useState<boolean>(false)

  const [showTxDialog, setShowTxDialog] = useState<boolean>(false)

  const { data: signer } = useSigner()

  useEffect(() => {
    if (!hiddenDialog && chain?.id != CHAIN_ID_MAP[rentInfo.chain]) {
      setShowSwitchNetworkDialog(true)
    }
  }, [hiddenDialog])

  const isNormalRedeem = useMemo(() => {
    return rentInfo.expires < (new Date().getTime() / 1000).toFixed()
  }, [rentInfo])

  // 计算一个周期内还未使用消耗的天数费用
  const [unUsedDaysInPeriod, totalReturn] = useMemo(() => {
    const currentTime = Math.round(Number(new Date()) / 1000)

    if (!rentInfo.expires || parseInt(rentInfo.expires) < currentTime) return [0, 0]

    // 已支付但未使用天数
    const days = (parseInt(rentInfo.paidExpires) - currentTime) / ONEDAY

    const unUsedDaysInPeriod = Math.ceil(days)

    const totalReturn = BigNumber.from(rentInfo.rentPerDay).mul(BigNumber.from(unUsedDaysInPeriod)).add(BigNumber.from(rentInfo.deposit))

    return [unUsedDaysInPeriod, totalReturn]
  }, [rentInfo])

  const contractMarket = useContract({
    addressOrName: INSTALLMENT_MARKET[CHAIN_ID_MAP[rentInfo.chain]],
    contractInterface: INSTALLMENT_MARKET_ABI,
    signerOrProvider: signer
  })

  const contractERC20 = useContract({
    addressOrName: rentInfo.erc20Address,
    contractInterface: erc20ABI,
    signerOrProvider: signer
  })

  const [approveTxHash, setApproveTxHash] = useState<string | undefined>()
  useWaitForTransaction({
    hash: approveTxHash,
    onSuccess: () => setIsApproved(true),
    onSettled: () => {
      setShowTxDialog(false)
      setApproveTxHash('')
      setButtonLoading(false)
    }
  })

  const [redeemTxHash, setRedeemTxHash] = useState<string | undefined>()
  useWaitForTransaction({
    hash: redeemTxHash,
    onSuccess: () => {
      setHiddenDialog(true)
      reloadTable()
    },
    onSettled: () => {
      setShowTxDialog(false)
      setButtonLoading(false)
      setRedeemTxHash('')
    }
  })

  useEffect(() => {
    (async () => {
      // TODO: 调用 allowance 方法前需处于正确网络中, 不然执行该合约调用会报错

      try {
        const approveToken = await contractERC20.allowance(address, INSTALLMENT_MARKET[CHAIN_ID_MAP[rentInfo.chain]])

        // 此处暂时设置一个 较大值(MaxInt256) 进行判断 
        const compareAmount = ethers.constants.MaxInt256
        if (ethers.BigNumber.from(approveToken).gte(compareAmount)) {
          setAlreadyApproved(true)
        }
      } catch (err) {
        console.error(err)
      }

    })()
  }, [rentInfo])

  const handleApproveERC20 = async () => {
    setTxError('')
    setButtonLoading(true)
    setShowTxDialog(true)
    try {
      const { hash } = await contractERC20.approve(INSTALLMENT_MARKET[CHAIN_ID_MAP[rentInfo.chain]], totalReturn)
      setApproveTxHash(hash)
    } catch (err: any) {
      setTxError(err?.error?.message || err.message)
      setButtonLoading(false)
      setShowTxDialog(false)
    }
  }

  const redeemNFT = async () => {
    if (buttonLoading) return
    setButtonLoading(true)
    setTxError('')
    setShowTxDialog(true)
    try {
      const { hash } = await contractMarket.reclaim(rentInfo.nftAddress, BigNumber.from(rentInfo.tokenId))
      setRedeemTxHash(hash)
    } catch (err: any) {
      setTxError(err?.error?.message || err.message)
      setButtonLoading(false)
      setShowTxDialog(false)
    }
  }

  return <AppDialog
    trigger={trigger}
    title={`Redeeming NFT #${formatTokenId(rentInfo.tokenId)}`}
    hiddenDialog={hiddenDialog}
  >
    {
      isNormalRedeem ?
        <Box className={styles.normalRedeemBox}>
          <Typography>Are you sure you want to get your NFT back?</Typography>
          {txError &&
            <Alert
              variant="outlined"
              severity="error"
              sx={{ m: '1rem auto' }}
              onClose={() => setTxError('')}
              className="alertTxErrorMsg"
            >{txError}</Alert>}
          <Stack>
            <DefaultButton
              onClick={() => redeemNFT()}
              loading={buttonLoading}
              className={styles.baseButton} >
              Redeem
            </DefaultButton>
          </Stack>
        </Box>
        :
        <Box className={styles.redeemNFTBox}>
          <Stack className={styles.redeemInfo} spacing="1.33rem">
            <Box >
              <Box>Original Expiry Time</Box>
              <Box>{dateFormat("YYYY-mm-dd HH:MM", new Date(parseInt(rentInfo.expires) * 1000))}</Box>
            </Box>
            {/* <Box>
                  <Box>Total Amount</Box>
                  <Box></Box>
                </Box> */}
          </Stack>
          <Box className={styles.stackLine}></Box>
          <Stack className={styles.payDetail} spacing="1.33rem">
            <Box>
              <Box className={styles.totalLabelValue}>Total  liquidated damages</Box>
              <Box>
                <img src={ADDRESS_TOKEN_MAP[rentInfo?.erc20Address]?.logo} />
                {parseFloat(utils.formatUnits(totalReturn, ADDRESS_TOKEN_MAP[rentInfo?.erc20Address]?.decimal))}
              </Box>
            </Box>
            <Box>
              <Box>Unrealized Amount</Box>
              <Box>
                <img src={ADDRESS_TOKEN_MAP[rentInfo?.erc20Address]?.logo} />
                {unUsedDaysInPeriod} * {utils.formatUnits(BigNumber.from(rentInfo?.rentPerDay), ADDRESS_TOKEN_MAP[rentInfo?.erc20Address]?.decimal)}
              </Box>
            </Box>
            {Number(rentInfo.deposit) !== 0 &&
              <Box>
                <Box>Compensation To Renter</Box>
                <Box>
                  <img src={ADDRESS_TOKEN_MAP[rentInfo?.erc20Address]?.logo} />
                  {utils.formatUnits(BigNumber.from(rentInfo?.deposit), ADDRESS_TOKEN_MAP[rentInfo?.erc20Address]?.decimal)}
                </Box>
              </Box>}
          </Stack>
          {txError &&
            <Alert
              variant="outlined"
              severity="error"
              sx={{ m: '1rem auto' }}
              onClose={() => setTxError('')}
              className="alertTxErrorMsg"
            >{txError}</Alert>}

          <Stack direction="row" spacing="2rem">
            {!alreadyApproved && <DefaultButton
              className={cx({ 'baseButton': true, 'disableButton': isApproved })}
              loading={buttonLoading && !isApproved}
              onClick={() => handleApproveERC20()}
            >
              {isApproved ? 'Approved' : 'Approve'}
            </DefaultButton>}
            <DefaultButton
              className={cx({ 'baseButton': true, 'disableButton': !isApproved && !alreadyApproved })}
              loading={buttonLoading && (isApproved || alreadyApproved)}
              onClick={() => {
                if (isApproved || alreadyApproved) {
                  redeemNFT()
                }
              }}
            >
              Redeem
            </DefaultButton>
          </Stack>
        </Box>
    }

    <SwitchNetwork
      showDialog={showSwitchNetworkDialog}
      closeDialog={() => {
        setShowSwitchNetworkDialog(false)
        setHiddenDialog(true)
      }}
      callback={() => {
        setShowSwitchNetworkDialog(false)
      }}
      targetNetwork={CHAIN_ID_MAP[rentInfo.chain] as number}
    />
    <TxLoadingDialog showTxDialog={showTxDialog} txHash={approveTxHash || redeemTxHash || ''} />
  </AppDialog>
}

export default WithdrawNFTModal