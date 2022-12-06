import { Box, InputBase, Stack, ToggleButtonGroup, Typography } from "@mui/material"
import InputNumber from "rc-input-number"
import styles from './style.module.scss'
import * as ether from 'ethers'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useState, useMemo } from "react"
import DefaultButton from "../Buttons/DefaultButton";
import { UserLendConfigInfo } from "./ChooseNFTModal";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DEFAULT_LEND_TRIAL_MODEL_DAYS } from "../../constants";

interface TrialModeLendConfigProps {
  setNextStep?: () => any;
  setUserLendConfigInfo?: (info: UserLendConfigInfo) => any;
}

const TrialModeLendConfig: React.FC<TrialModeLendConfigProps> = (props) => {
  const { setNextStep = () => { }, setUserLendConfigInfo = (info: UserLendConfigInfo) => { } } = props

  const [lendingDays, setLendingDays] = useState<number>(DEFAULT_LEND_TRIAL_MODEL_DAYS)
  const [whitelist, setWhitelist] = useState<string>('')
  const [isErrorFormatAddress, setIsErrorFormatAddress] = useState<boolean>(false)

  const isReady = useMemo(() => {
    if (isErrorFormatAddress) return false
    if (!lendingDays) return false
    return true
  }, [isErrorFormatAddress, lendingDays])

  const handleNextStep = () => {
    if (isReady) {
      setNextStep()
      setUserLendConfigInfo({
        whiteList: whitelist,
        lendingDay: lendingDays
      })
    }
  }

  return <Box className={styles.trialModeBox} component="form">
    <Stack className={styles.formItems}>
      <Box >
        <Typography className={styles.formLabel}>Lending Time&nbsp;<span>*</span></Typography>
        <Box className={styles.lendingTime}>
          <Box className={`${styles.formItem}`} sx={{ width: '14.67rem' }}>
            <InputNumber
              min={1}
              value={lendingDays}
              onChange={(val: number) => {
                setLendingDays(val)
              }}
              upHandler={<ArrowDropUpIcon />}
              downHandler={<ArrowDropDownIcon />}
              className={styles.customRatio}
            />
          </Box>
          <Typography sx={{ ml: '1rem' }}>Day</Typography>
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

export default TrialModeLendConfig