import { Box, Dialog, DialogTitle, Grid, IconButton, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import IntegrationCard from '../IntegrationCard'
import styles from './style.module.scss'
import ChooseNFTModal from './ChooseNFTModal';
import { GameList } from '../../constants';
import ConnectWallet from '../ConnectWallet';
import { useAccount } from 'wagmi';

interface LendNFTModalProps {
  trigger: React.ReactElement
}

const LendNFTModal: React.FC<LendNFTModalProps> = (props) => {
  const { trigger } = props
  const [visibile, changeVisibile] = useState<boolean>(false)
  const [showConnect, setShowConnect] = useState<boolean>(false)
  const [NFTModalShow, setNFTModalShow] = useState<boolean>(false)
  const [choosedGame, setChoosedGame] = useState<number>(-1)

  const { address } = useAccount()

  useEffect(() => {
    if (visibile && !address) {
      setShowConnect(true)
    }
  }, [visibile, address])

  const updateChooseGame = (index: number) => {
    setChoosedGame(index)
    setNFTModalShow(true)
    changeVisibile(false)
  }

  return <React.Fragment>
    <div onClick={() => { changeVisibile(true) }} style={{ display: 'inline-block', marginTop: '4.67rem', width: 'auto' }}>
      {trigger}
    </div>
    <Dialog open={visibile} className={styles.container} >
      <DialogTitle className={styles.gameModalTitle} sx={{ width: 'auto' }}>
        <Typography>Choose Game</Typography>
        <IconButton
          aria-label="close"
          onClick={() => changeVisibile(false)}
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
        <Box sx={{ flexGrow: 1 }} width="65rem">
          <Grid
            container
            rowSpacing="2.67rem"
            columnSpacing="2.5rem"
            sx={{ p: '3.33rem', maxHeight: '46.66rem', overflowY: 'scroll' }} >

            {/* TODO: 判断当前是否正确处于当前游戏所在区块链网络 */}
            {GameList.map((item, index) => {
              return <Grid item xs="auto" key={index}>
                <IntegrationCard
                  key={`${index}_${new Date().getTime()}`}
                  gameItem={item}
                  index={index}
                  updateGame={updateChooseGame}
                />
              </Grid>
            })}
          </Grid>
        </Box>
      </div>
    </Dialog>
    {choosedGame !== -1 &&
      <ChooseNFTModal
        visibile={NFTModalShow}
        setVisibile={setNFTModalShow}
        gameName={GameList[choosedGame].gameName}
        gameNFTCollection={GameList[choosedGame].gameNFTCollection}
        targetChainId={GameList[choosedGame].chainId}
      />}

    <ConnectWallet
      trigger={<></>}
      closeCallback={() => { }}
      showConnect={showConnect}
    />
  </React.Fragment >
}

export default LendNFTModal