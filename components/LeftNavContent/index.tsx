import { Box, IconButton, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import styles from './styles.module.scss'
import WestIcon from '@mui/icons-material/West';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { GAME_LOGOS, GAME_NAMES } from "../../constants";
import classNames from "classnames/bind";
import { useQueryParam, StringParam, withDefault } from 'use-query-params';
import { useRouter } from "next/router";

const cx = classNames.bind(styles)

interface LeftNavContentProps {
  isLeftNav?: boolean
  showLeftBar: boolean
  setShowLeftBar?: (arg: boolean) => any;
  currentGame?: number;
  setCurrentGame: (arg: number) => any;
  callback?: () => any
}

const LeftNavContent: React.FC<LeftNavContentProps> = (props) => {
  const { currentGame = -1, setCurrentGame, showLeftBar, setShowLeftBar = (arg) => { }, isLeftNav = true, callback } = props

  const router = useRouter()
  const [curGame, setCurGame] = useState<number>(0)
  const [name, setName] = useQueryParam('game', withDefault(StringParam, 'all'));

  useEffect(() => {
    switch (router.query?.game) {
      // case GAME_NAMES.METALINE:
      //   setCurrentGame(1);
      //   break;
      case GAME_NAMES.DEHERO:
        setCurGame(0);
        // setName(GAME_NAMES.DEHERO)
        break
      default:
        setCurGame(0);
        break;
    }
  }, [router])

  return <Stack className={cx({
    leftGameList: isLeftNav,
    headerGameFilter: !isLeftNav,
    minLeftGameList: !showLeftBar && isLeftNav
  })}>
    {isLeftNav &&
      <Box className={showLeftBar ? styles.sidebarController : styles.sidebarControllerMin}>
        <IconButton onClick={() => setShowLeftBar(!showLeftBar)}>
          {
            showLeftBar ?
              <WestIcon fontSize="inherit" /> :
              <FilterAltIcon fontSize="large" />
          }
        </IconButton>
      </Box>}
    {/* <Link href={{ pathname: '/' }} > */}
    {/* <Box
      className={cx({ 'gameItem': true, 'activeItem': currentGame == 0 })}
      onClick={() => setCurrentGame(0)}
    >
      <img src={GAME_LOGOS['0']} alt='rentero' />
      {showLeftBar && <Typography>All Game</Typography>}
    </Box> */}
    {/* </Link> */}
    {/* <Link href={{
      pathname: '/',
      query: { game: GAME_NAMES.METALINE }
    }} > */}
    {/* <Box
      className={cx({ 'gameItem': true, 'activeItem': currentGame == 1 })}
      onClick={() => setCurrentGame(1)}
    >
      <img src={GAME_LOGOS['1']} alt={GAME_NAMES.METALINE} />
      {showLeftBar && <Typography>Metaline</Typography>}
    </Box> */}
    {/* </Link> */}
    <Box className={cx({
      'gameItem': true,
      'activeItem': (currentGame == 0 || curGame == 0)
    })}
      onClick={() => {
        if (isLeftNav && setCurrentGame) {
          setCurrentGame(0)
        } else {
          setCurGame(0)
          setName(GAME_NAMES.DEHERO)
          if (callback) {
            callback()
          }
        }
      }}
    >
      <img src={GAME_LOGOS['2']} alt={GAME_NAMES.DEHERO} />
      {showLeftBar && <Typography>DeHeroGame</Typography>}
    </Box>
  </Stack>
}

export default LeftNavContent