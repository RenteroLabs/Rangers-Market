import React from 'react'
import Image from 'next/image'
import { GameItem } from '../../types'
import ChooseNFTModal from '../LendNFT/ChooseNFTModal'
import styles from './index.module.scss'
import Upcoming from '../../public/game-upcoming.svg'

interface IntegrationCardProps {
  index: number
  gameItem: GameItem
  updateGame: (index: number) => any
}

const IntegrationCard: React.FC<IntegrationCardProps> = (props) => {
  const { gameItem, updateGame, index } = props

  return <div className={styles.card}>
    <div className={styles.cover_image}>
      {
        gameItem.gameCover ? <Image src={gameItem.gameCover} alt="game_cover" layout="fill" /> : <Image src={Upcoming} width="90" height="90" />
      }
    </div>
    {gameItem.gameStatus === 0 &&
      <div className={styles.game_logo}>
        <Image alt='game_logo' src={gameItem.gameLogo} layout="fill" />
      </div>}
    <div >
      <h4>{gameItem.gameName || 'Upcoming...'}</h4>
      <p>{gameItem.gameDesc || 'Submit the game name and reasons for us to support in time.'}</p>
    </div>
    {
      gameItem.gameStatus === 0 ?
        <div
          className={styles.depositButton}
          onClick={() => updateGame(index)}
        >Deposit</div>
        : <div className={`${styles.depositButton} ${styles.disableButton}`}  >
          Deposit
        </div>}

    {/* <ChooseNFTModal
          gameName={gameItem.gameName}
          gameNFTCollection={gameItem.gameNFTCollection}
        /> */}
  </div >
}

export default IntegrationCard