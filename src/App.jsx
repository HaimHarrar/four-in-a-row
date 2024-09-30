import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './App.module.scss'
import Board from './components/Board'
import arrow from './assets/icons/arrow.svg'
import crown from './assets/icons/crown.svg'
import { clientIO } from './utils/io';
import classNames from 'classnames';
import SignIn from './components/SignIn';
import loader from './assets/icons/loader.svg'
export const statusEnum = {
  EMPTY: 0,
  YELLOW: 1,
  RED: 2
}

function App() {
  const [playersName, setPlayersName] = useState({[statusEnum.RED]: "", [statusEnum.YELLOW]: ""});
  const [playerColor, setPlayerColor] = useState(statusEnum.EMPTY); 
  const [turnsCount, setTurnsCount] = useState(0);
  const [winnerColor, setWinnerColor] = useState(statusEnum.EMPTY);
  const currentPlayer = useMemo(() => turnsCount % 2 ? statusEnum.YELLOW : statusEnum.RED, [turnsCount])
  const isAllowedToPlay = useMemo(() => currentPlayer === playerColor, [playerColor, currentPlayer])
  const [canStartGame, setCanPlay] = useState(false)
  const [roomsList, setRoomsList] = useState(new Set());
  const [board, setBoard] = useState();
  const [loaderTitle, setLoaderTitle] = useState("Waiting for player...")
  useEffect(() => {
    clientIO.connect();


    const startPlaying = ({board, yellowName, redName}) => {
      setPlayersName(() => ({[statusEnum.RED]: redName, [statusEnum.YELLOW]: yellowName}))
      setCanPlay(true)
      setBoard(board)
    }

    const playerLeft = () => {
      setCanPlay(false)
      setLoaderTitle("player left")
    } 
    const onPlay = ({board, next}) => {
      if(next){
        setBoard(board)
        setTurnsCount(prev => prev + 1);
      }
    }
    const onWinner = ({color}) => {
      setWinnerColor(color)
    }

    const setPlayerData = ({color}) => {
      setPlayerColor(color)
    }

    const setSpceficRooms = (rooms) => {
      console.log(rooms)
      setRoomsList(rooms);
    }

    const onWaitForSpecificRoom = ({room}) => {
      setLoaderTitle(`Waiting for player in ${room}...`)
    }
    clientIO.on("play", onPlay)
    clientIO.on("startPlaying", startPlaying)
    clientIO.on("playerEnterData", setPlayerData)
    clientIO.on("winner", onWinner)
    clientIO.on("updateSpecificRooms", setSpceficRooms)
    clientIO.on("waitForSpecificRoom", onWaitForSpecificRoom)
    clientIO.on("playerLeft", playerLeft)
    return () => {
      clientIO.off("startPlaying", startPlaying)
      clientIO.off("playerLeft", playerLeft)
      clientIO.off("playerEnterData", setPlayerData)
      clientIO.off("play", onPlay)
      clientIO.off("updateSpecificRooms", setSpceficRooms)
    }
  }, [])



  const playerPlay = (index) => {
    if(isAllowedToPlay)
      clientIO.emit("playerPlay", {color: playerColor, index})
  }

  return (
    <div className={styles.appContainer}>
        {
          playerColor === statusEnum.EMPTY ? <SignIn roomsList={roomsList} /> :
          !canStartGame ? <Loader title={loaderTitle} /> :
          <div className={styles.gameContainer}>
            <img className={styles.arrow} turn={currentPlayer} src={arrow} alt="" />
            <div className={classNames(styles.player, styles.first)}>
              <div className={styles.name}>{playersName[statusEnum.RED]}</div>
              {playerColor === statusEnum.RED && <div className={styles.turn}>{isAllowedToPlay ? "your" : "his"} turn</div>}
            </div>
            <div className={classNames(styles.player, styles.second)}>
              <div className={styles.name}>{playersName[statusEnum.YELLOW]}</div>
              {playerColor === statusEnum.YELLOW &&<div className={styles.turn}>{isAllowedToPlay ? "your" : "his"} turn</div>}
            </div>
            <Board board={board} playerPlay={playerPlay} isAllowedToPlay={isAllowedToPlay}/>
            {
              !!winnerColor && <img className={styles.crown} turn={currentPlayer} src={crown} alt="" />
            }
          </div>
        }
    </div>
  )
}

const Loader = ({title}) => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.title}>{title}</div>
      <img className={styles.loader} src={loader} alt=""/>
    </div>
  )
}

export default App