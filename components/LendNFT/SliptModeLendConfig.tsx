import { Box, Button, InputBase, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import InputNumber from 'rc-input-number'
import React, { useMemo, useState } from 'react'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import styles from './style.module.scss'
import DefaultButton from '../Buttons/DefaultButton';
import { UserLendConfigInfo } from './ChooseNFTModal';
import * as ether from 'ethers'

interface LendConfigProps {
  configType?: '@add' | '@modify';
  setNextStep?: () => any;
  setUserLendConfigInfo?: (info: UserLendConfigInfo) => any;
}

/**
 * 分成模式出借配置
 * @param props 
 * @returns 
 */
const SliptModeLendConfig: React.FC<LendConfigProps> = (props) => {
  const { setNextStep = () => { },
    setUserLendConfigInfo = (info: UserLendConfigInfo) => { },
    configType = '@add' } = props

  const [ratioType, setRatioType] = useState<number>(30)
  const [customRatio, setCustomRatio] = useState<number | undefined>()
  const [securityMoney, setSecurityMoney] = useState<number | string>("")
  const [whitelist, setWhitelist] = useState<string>('')
  const [isErrorFormatAddress, setIsErrorFormatAddress] = useState<boolean>(false)

  const isReady = useMemo(() => {
    if (isErrorFormatAddress) return false
    if (ratioType === -1 && (!customRatio && customRatio != 0)) {
      return false
    }
    if (!securityMoney && securityMoney !== 0) {
      return false
    }
    return true
  }, [customRatio, ratioType, securityMoney, isErrorFormatAddress])

  const handleNextStep = () => {
    if (isReady) {
      setNextStep()
      setUserLendConfigInfo({
        borrowerRatio: ratioType !== -1 ? ratioType : customRatio,
        securityMoney: parseFloat(securityMoney as string),
        whiteList: whitelist
      })
    }
  }

  return <Box className={styles.stepConfig} component="form">
    <Stack className={styles.formItems}>
      <Box>
        <Typography className={styles.formLabel}>Share Ratio To Renter&nbsp;<span>*</span></Typography>
        <ToggleButtonGroup
          value={ratioType}
          exclusive
          sx={{ width: '41.67rem' }}
          onChange={(_, newRatio: number) => {
            newRatio && setRatioType(newRatio)
          }}
        >
          <ToggleButton value={30} className={styles.ratioButton} >30%</ToggleButton>
          <ToggleButton value={40} className={styles.ratioButton} >40%</ToggleButton>
          <ToggleButton value={50} className={styles.ratioButton} >50%</ToggleButton>
          <ToggleButton value={-1} className={styles.ratioButton} disableRipple sx={{ width: '14.67rem !important' }}>
            <InputNumber
              min={0}
              max={100}
              value={customRatio}
              placeholder="Customize Ratio"
              onChange={(val: number) => {
                if (!val || val > 100 || val < 0) {
                  return
                }
                setCustomRatio(val)
              }}
              className={styles.customRatio}
              formatter={(val: any) => {
                if (!val || val > 100 || val < 0) {
                  return ''
                }
                return `${val}%`
              }}
              upHandler={<ArrowDropUpIcon />}
              downHandler={<ArrowDropDownIcon />}
            />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box>
        <Typography className={styles.formLabel}>Security Money&nbsp;<span>*</span></Typography>
        <Box className={styles.formItem} sx={{ width: '41.67rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <InputNumber
            min={0}
            className={styles.securityInput}
            onChange={(val: number) => setSecurityMoney(val)}
          />
          <Box>ETH</Box>
        </Box>
      </Box>
      <Box>
        <Typography className={styles.formLabel}>Whitelist</Typography>
        <Box className={styles.formItem} sx={{ width: '41.67rem' }}>
          <InputBase
            sx={{ width: '100%', height: '2rem' }}
            value={whitelist}
            onChange={(e: any) => {
              const newVal = e.target.value
              setWhitelist(newVal)
              if (newVal && !ether.utils.isAddress(newVal)) {
                setIsErrorFormatAddress(true)
              } else {
                setIsErrorFormatAddress(false)
              }
            }}
          />
        </Box>
      </Box>
      <Box sx={{ marginTop: '1rem !important' }}>
        <Typography className={styles.formLabel}></Typography>
        {isErrorFormatAddress ?
          <Typography className={styles.errorFormat}><ErrorOutlineIcon />&nbsp; Error format address</Typography> :
          <Typography className={styles.tipInfo}>* Specify the address to use. Check that the address is filled in correctly.</Typography>
        }
      </Box>
    </Stack>

    <DefaultButton
      className={`${!isReady ? styles.noDoneButton : styles.DoneButton}`}
      onClick={handleNextStep}
    >
      Confirm and Next
    </DefaultButton>
  </Box>
}

export default SliptModeLendConfig