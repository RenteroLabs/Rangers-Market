import { Box, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close';
import styles from './index.module.scss'

export interface AppDialogProps {
  trigger: React.ReactNode;
  title: string;
  hiddenDialog?: boolean;
  children?: React.ReactNode;
  width?: string;
}

const AppDialog: React.FC<AppDialogProps> = (props) => {
  const { children, title, trigger, hiddenDialog, width } = props
  const [visibile, setVisibile] = useState<boolean>(false)

  useEffect(() => {
    if (hiddenDialog) {
      setVisibile(false)
    }
  }, [hiddenDialog])

  return <React.Fragment>
    <Box sx={{ width: '100%' }} onClick={() => { setVisibile(true) }}>
      {trigger}
    </Box>
    <Dialog open={visibile} className={styles.container} key={title} >
      <DialogTitle className={styles.dialogTitle} sx={{ width: width || 'auto' }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={() => setVisibile(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: "2rem",
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <div className={styles.dialogContent}>
        {children}
      </div>
    </Dialog>
  </React.Fragment >
}

export default AppDialog