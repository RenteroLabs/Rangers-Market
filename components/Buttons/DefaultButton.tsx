import { Box, CircularProgress } from "@mui/material"
import { PropsWithChildren } from "react";
import styles from './button.module.scss'

interface DefaultButtonProps {
  onClick?: () => any;
  btnText?: string;
  sx?: Record<string, any>
  className?: string;
  loading?: boolean;
}

const DefaultButton: React.FC<PropsWithChildren<DefaultButtonProps>> = (props) => {
  const { onClick, children, sx, btnText, className, loading = false } = props

  return <Box
    className={`${className} ${styles.defaultButton}`}
    onClick={onClick}
    sx={sx}
  >
    {loading &&
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={18} />&nbsp;&nbsp;Pending</Box>}
    {(children && !loading) ? children : btnText}
  </Box>
}

export default DefaultButton