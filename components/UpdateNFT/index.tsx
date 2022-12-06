import React, { useState } from 'react'
import { LeaseItem } from '../../types'
import AppDialog from '../Dialog'
import InstallmentLendConfig from '../LendNFT/InstallmentLendConfig'

interface UpdateNFTProps {
  trigger: React.ReactElement
  rentInfo: LeaseItem
  reloadInfo: () => any
}

const UpdateNFTModal: React.FC<UpdateNFTProps> = (props) => {
  const { trigger, rentInfo, reloadInfo } = props
  const [hiddenDialog, setHiddenDialog] = useState<boolean>(false)

  return <AppDialog
    trigger={trigger}
    title={`Edit Lend Order #${rentInfo.tokenId}`}
    hiddenDialog={hiddenDialog}
  >
    <InstallmentLendConfig
      nftInfo={rentInfo}
      configType="@modify"
      handleClose={() => {
        reloadInfo()
        setHiddenDialog(true)
      }}
    />
  </AppDialog>
}

export default UpdateNFTModal