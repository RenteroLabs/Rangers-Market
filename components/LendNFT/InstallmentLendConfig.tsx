import { Alert, Box, InputBase, Link, MenuItem, Select, SelectChangeEvent, Stack, Switch, Typography } from '@mui/material'
import InputNumber from 'rc-input-number'
import React, { useEffect, useMemo, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import styles from './style.module.scss'
import DefaultButton from '../Buttons/DefaultButton';
import { UserLendConfigInfo } from './ChooseNFTModal';
import classNames from 'classnames/bind'
import { erc721ABI, useAccount, useContract, useSigner, useWaitForTransaction } from 'wagmi';
import { INSTALLMENT_MARKET, INSTALLMENT_MARKET_ABI } from '../../constants/contractABI';
import { ADDRESS_TOKEN_MAP, CHAIN_ID_MAP, DEPOSIT_DAYS, MAX_RENTABLE_DAYS, MIN_RENTABLE_DAYS, SUPPORT_CHAINS, SUPPORT_TOKENS, TOKEN_LIST, ZERO_ADDRESS } from '../../constants';
import { BigNumber, ethers, utils } from 'ethers';
import TxLoadingDialog from '../TxLoadingDialog';
import { LeaseItem } from '../../types';

const cx = classNames.bind(styles)
interface LendConfigProps {
  nftInfo: { tokenId: string, nftAddress: string, chain: string } | LeaseItem;
  configType?: '@add' | '@modify';
  setUserLendConfigInfo?: (info: UserLendConfigInfo) => any;
  handleClose: () => any
}

/**
 * 分期支付出借配置
 * @param props 
 * @returns 
 */
const InstallmentLendConfig: React.FC<LendConfigProps> = (props) => {
  const { configType = '@add', nftInfo, handleClose } = props
  console.log(nftInfo)
  const [isLended, setLended] = useState<boolean>(false)

  const [whitelist, setWhitelist] = useState<string>('')
  const [isErrorFormatAddress, setIsErrorFormatAddress] = useState<boolean>(false)
  const [lendDailyPrice, setLendDailyPrice] = useState<number>()
  const [showDailyPriceError, setShowDailyPriceError] = useState<boolean>(false)
  const [minDuration, setMinDuration] = useState<number>(MIN_RENTABLE_DAYS)
  const [maxDuration, setMaxDuration] = useState<number>(365)
  const [paymentCoinType, setPaymentCoinType] = useState<string>(SUPPORT_TOKENS[CHAIN_ID_MAP[nftInfo.chain] as number][0].name)
  const [payPeriod, setPayPeriod] = useState<number>(1)
  const [isNeedDeposit, setNeedDeposit] = useState<boolean>(true) // 默认需要押金
  const [isShowMoreOptions, setShowMoreOption] = useState<boolean>(false)

  const { data: signer } = useSigner()
  const { address } = useAccount()

  const [isApproved, setIsApproved] = useState<boolean>(false)
  const [alreadyApproved, setAlreadyApproved] = useState<boolean>(false)

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [showTxDialog, setShowTxDialog] = useState<boolean>(false)

  const [approveTxHash, setApproveTxHash] = useState<string | undefined>()
  useWaitForTransaction({
    hash: approveTxHash,
    onSuccess: () => {
      setIsApproved(true)
    },
    onSettled: () => {
      setIsLoading(false)
      setShowTxDialog(false)
      setApproveTxHash('')
    }
  })

  const [listMarketTxHash, setListMarketTxHash] = useState<string | undefined>()
  useWaitForTransaction({
    hash: listMarketTxHash,
    onSuccess: () => setLended(true),
    onSettled: () => {
      setIsLoading(false)
      setShowTxDialog(false)
      setListMarketTxHash('')
    }
  })

  const [updateOrderTxHash, setUpdateOrderTxHash] = useState<string | undefined>()
  useWaitForTransaction({
    hash: updateOrderTxHash,
    onSuccess() {
      setLended(true)
    },
    onSettled() {
      setIsLoading(false)
      setShowTxDialog(false)
      setListMarketTxHash('')
    }
  })

  // 授权 ERC721 NFT 合约
  const contractERC721 = useContract({
    addressOrName: nftInfo.nftAddress,
    contractInterface: erc721ABI,
    signerOrProvider: signer
  })

  // 新版 Rentero Market 合约
  const RenteroMarket = useContract({
    addressOrName: INSTALLMENT_MARKET[CHAIN_ID_MAP[nftInfo.chain]],
    contractInterface: INSTALLMENT_MARKET_ABI,
    signerOrProvider: signer
  })

  const isReady = useMemo(() => {
    if (isErrorFormatAddress) return false
    if (!lendDailyPrice) return
    return true
  }, [isErrorFormatAddress, lendDailyPrice])

  useEffect(() => {
    (async () => {
      const result = await contractERC721.isApprovedForAll(address, INSTALLMENT_MARKET[CHAIN_ID_MAP[nftInfo.chain]])
      if (result) {
        setAlreadyApproved(true)
      }
    })();

    if (configType === '@modify') {
      // 初始化表单数据
      const erc20address = (nftInfo as LeaseItem).erc20Address
      const erc20Info = ADDRESS_TOKEN_MAP[erc20address]
      const dailPrice = BigNumber.from((nftInfo as LeaseItem).rentPerDay)
      setLendDailyPrice(parseFloat(utils.formatUnits(dailPrice, erc20Info.decimal))) // 每天单价
      setPaymentCoinType(erc20Info.name) // 支付 erc20 Token
      setPayPeriod(parseInt((nftInfo as LeaseItem).daysPerPeriod)) // 结算周期
      setMinDuration(parseInt((nftInfo as LeaseItem).minRentalDays)) // 最小租借天数
      setMaxDuration(parseInt((nftInfo as LeaseItem).maxRentalDays)) // 最大租借天数
      const whitelist = (nftInfo as LeaseItem).whitelist
      if (whitelist !== ZERO_ADDRESS) {
        setWhitelist(whitelist) // 白名单地址
      }
      const deposit = parseInt((nftInfo as LeaseItem).deposit)
      if (deposit === 0) {
        setNeedDeposit(false) // 是否需要押金
      }
    }
  }, [])

  // 出借 NFT
  const handleLendNFT = async () => {
    if (!lendDailyPrice) {
      setShowDailyPriceError(true)
      return
    }
    if (isLoading || (!isApproved && !alreadyApproved) || !isReady) return
    setErrorMessage('')
    setIsLoading(true)
    setShowTxDialog(true)

    const rentDailyPrice = utils.parseUnits(lendDailyPrice?.toString() || '', TOKEN_LIST[paymentCoinType].decimal)

    try {
      const { hash } = await RenteroMarket.lend(
        nftInfo.nftAddress,  // NFT address
        nftInfo.tokenId, // NFT id
        TOKEN_LIST[paymentCoinType].address, // pay token address
        whitelist || ZERO_ADDRESS, // whitelist address
        isNeedDeposit ? rentDailyPrice.mul(DEPOSIT_DAYS) : 0, // deposit
        rentDailyPrice, // daily rent price
        payPeriod, // pay period
        minDuration, // min rent day
        maxDuration // max rent day
      )
      // 等待交易被打包上链
      setListMarketTxHash(hash)
    } catch (err: any) {
      setErrorMessage(err?.error?.message || err?.message)
      setIsLoading(false)
      setShowTxDialog(false)
    }
  }

  // 更新出借 NFT 订单信息
  const handleUpdateOrder = async () => {
    if (!lendDailyPrice) {
      setShowDailyPriceError(true)
      return
    }
    if (isLoading || (!isApproved && !alreadyApproved) || !isReady) return
    setErrorMessage('')
    setIsLoading(true)
    setShowTxDialog(true)

    const rentDailyPrice = utils.parseUnits(lendDailyPrice?.toString() || '', TOKEN_LIST[paymentCoinType].decimal)

    try {
      const { hash } = await RenteroMarket.reLend(
        nftInfo.nftAddress,  // NFT address
        nftInfo.tokenId, // NFT id
        TOKEN_LIST[paymentCoinType].address, // pay token address
        whitelist || ZERO_ADDRESS, // whitelist address
        isNeedDeposit ? rentDailyPrice.mul(DEPOSIT_DAYS) : 0, // deposit
        rentDailyPrice, // daily rent price
        payPeriod, // pay period
        minDuration, // min rent day
        maxDuration // max rent day 
      )
      setUpdateOrderTxHash(hash)
    } catch (err: any) {
      setErrorMessage(err?.error?.message || err?.message)
      setIsLoading(false)
      setShowTxDialog(false)
    }
  }

  // 授权指定 ERC721 NFT
  const handleApproveErc721 = async () => {
    if (isLoading) return
    setErrorMessage('')
    setIsLoading(true)
    setShowTxDialog(true)

    try {
      const { hash } = await contractERC721.setApprovalForAll(INSTALLMENT_MARKET[CHAIN_ID_MAP[nftInfo.chain]], true)
      setApproveTxHash(hash)
    } catch (err: any) {
      setErrorMessage(err?.error?.message || err?.message)
      setIsLoading(false)
      setShowTxDialog(false)
    }
  }

  return !isLended ?
    <Box className={styles.installmentBox} component="form" >
      <Stack className={styles.lendForm}>
        <Box className={styles.lendFormItem}>
          <Typography>Daily Price</Typography>
          <Stack direction="row" spacing="1.33rem" className={styles.rentDailyPrice}>
            <Box className={styles.rentFormValueBox}>
              <Box>
                <InputNumber
                  min={0.0001}
                  value={lendDailyPrice}
                  onChange={(val) => {
                    if (val >= 0.0001) {
                      setLendDailyPrice(val)
                      setShowDailyPriceError(false)
                    }
                  }}
                />
              </Box>
            </Box>
            <Select
              className={`${styles.payCoinType} ${styles.formValueBox}`}
              value={paymentCoinType}
              onChange={(event: SelectChangeEvent) => setPaymentCoinType(event.target.value as string)}
            >
              {
                SUPPORT_TOKENS[CHAIN_ID_MAP[nftInfo.chain] as number].map(item =>
                  <MenuItem value={item?.name} className={styles.coinTypeItem} key={item?.address}>
                    <img src={item?.logo} alt={`${item?.name}_LOGO`} />
                    {item?.name?.split('-')[1]}
                  </MenuItem>)
              }
            </Select>
          </Stack>
          {showDailyPriceError && <Typography className={styles.errorFormat}>
            <ErrorOutlineIcon />&nbsp;Please input daily renting price
          </Typography>}
        </Box>

        <Box className={styles.lendFormItem}>
          <Typography>Rental Period</Typography>
          <Stack direction="row" spacing="1.33rem" sx={{ maxWidth: '40rem' }}>
            <Box className={styles.durationValueBox}>
              <Typography>Min</Typography>
              <InputNumber
                min={MIN_RENTABLE_DAYS}
                max={MAX_RENTABLE_DAYS}
                value={minDuration}
                placeholder="Min"
                onChange={(val) => {
                  if (val >= MIN_RENTABLE_DAYS && val <= maxDuration && Number.isInteger(val)) {
                    setMinDuration(val)
                  }
                }}
              />
            </Box>
            <Box className={styles.durationValueBox}>
              <Typography>Max</Typography>
              <InputNumber
                min={MIN_RENTABLE_DAYS}
                max={MAX_RENTABLE_DAYS}
                value={maxDuration}
                placeholder="Max"
                onChange={(val) => {
                  if (val <= MAX_RENTABLE_DAYS && val >= minDuration && Number.isInteger(val)) {
                    setMaxDuration(val)
                  }
                }}
              />
            </Box>
          </Stack>
        </Box>

        <Box className={styles.lendFormItemBox}>
          <Typography>Payment Cycle</Typography>
          <Box className={styles.billingCycle}>
            <InputNumber
              min={1}
              max={365}
              value={payPeriod}
              onChange={(val) => {
                if (val >= 1 && val <= 365 && Number.isInteger(val)) {
                  setPayPeriod(val)
                }
              }}
            />
            <Typography>Days</Typography>
          </Box>
        </Box>

        {
          isShowMoreOptions &&
          <>
            <Box className={styles.lendFormItemBox}>
              <Typography>Whitelist</Typography>
              <Box>
                <InputBase
                  sx={{ width: '100%', height: '2rem' }}
                  value={whitelist}
                  placeholder="Please Input Wallet Address..."
                  onChange={(e: any) => {
                    const newVal = e.target.value
                    setWhitelist(newVal)
                    if (newVal && !ethers.utils.isAddress(newVal)) {
                      setIsErrorFormatAddress(true)
                    } else {
                      setIsErrorFormatAddress(false)
                    }
                  }}
                />
              </Box>
              {isErrorFormatAddress && <Typography className={styles.errorFormat}><ErrorOutlineIcon />&nbsp; Error format address</Typography>}
            </Box>
            <Box className={styles.renetDeposit}>
              <Typography>
                <span>Renter pays deposit</span>
                <Switch checked={isNeedDeposit} onChange={(_, checked: boolean) => setNeedDeposit(checked)} />
              </Typography>
              <Box>* The deposit amount is one day rent. It will compensate You  when the Renter defaults.</Box>
            </Box>
          </>
        }
        <Box className={styles.moreOptions}>
          {
            isShowMoreOptions ?
              <span onClick={() => setShowMoreOption(false)}>Fewer Options <KeyboardArrowUpIcon /></span>
              : <span onClick={() => setShowMoreOption(true)}>More Options <KeyboardArrowDownIcon /></span>
          }
        </Box>
        <Box className={styles.serviceFee}>
          <Typography>Service fee</Typography>
          <Typography variant="h5">10%</Typography>
        </Box>

        {errorMessage &&
          <Alert
            variant="outlined"
            severity="error"
            onClose={() => setErrorMessage('')}
            sx={{
              width: '40rem !important',
              minWidth: 'unset !important',
              marginTop: '2rem',
              wordBreak: 'break-word'
            }}
          >{errorMessage}</Alert>}
      </Stack>

      <Stack direction="row" spacing="2rem" className={styles.buttonAsset}>
        {
          configType === '@add' ?
            <>
              {!alreadyApproved && <DefaultButton
                className={cx({
                  baseContractButton: true,
                  disableButton: isApproved
                })}
                onClick={handleApproveErc721}
              >Approve</DefaultButton>}
              <DefaultButton
                className={cx({
                  baseContractButton: true,
                  disableButton: !isApproved && !alreadyApproved
                })}
                onClick={handleLendNFT}
              >Lend</DefaultButton>
            </> :
            <DefaultButton
              className={cx({ baseContractButton: true })}
              onClick={handleUpdateOrder}
            >Update</DefaultButton>
        }
      </Stack>

      <TxLoadingDialog
        showTxDialog={showTxDialog}
        txHash={approveTxHash || listMarketTxHash || updateOrderTxHash || ''} />
    </Box >
    :
    <Box sx={{ m: '6rem 4rem 4rem' }} className={styles.lendSuccess}>
      <img src='/success_smile.png' alt='success_smile' />
      <Typography variant='h3' >
        {configType === '@add' ?
          'Successful Lend Your NFT' :
          'Successful Update Lend NFT Order'}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: '1rem', fontSize: '1.5rem' }}>
        Your Lend NFT Will List In Market In Minutes!
        <Link href="/">
          <Typography variant='overline' className={styles.linkStyle}>Go To Market</Typography>
        </Link>
      </Typography>
      <DefaultButton sx={{ margin: '2rem auto' }}
        onClick={handleClose}
      >Finished</DefaultButton>
    </Box>
}

export default InstallmentLendConfig