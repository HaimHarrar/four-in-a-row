import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './App.module.scss'
import Board from './components/Board'
import arrow from './assets/icons/arrow.svg'
import crown from './assets/icons/crown.svg'
import { clientIO } from './utils/io';
import classNames from 'classnames';
import SignIn from './components/SignIn';
import loader from './assets/icons/loader.svg'
import restart from './assets/icons/restart.svg'
import exit from './assets/icons/exit.svg'
export const statusEnum = {
  EMPTY: 0,
  YELLOW: 1,
  RED: 2
}

function App() {
  const [playersName, setPlayersName] = useState({ [statusEnum.RED]: "", [statusEnum.YELLOW]: "" });
  const [playerColor, setPlayerColor] = useState(statusEnum.EMPTY);
  const [turnsCount, setTurnsCount] = useState(0);
  const [winnerColor, setWinnerColor] = useState(statusEnum.EMPTY);
  const currentPlayer = useMemo(() => turnsCount % 2 ? statusEnum.YELLOW : statusEnum.RED, [turnsCount])
  const isAllowedToPlay = useMemo(() => currentPlayer === playerColor, [playerColor, currentPlayer])
  const [canStartGame, setCanPlay] = useState(false)
  const [roomsList, setRoomsList] = useState(new Set());
  const [board, setBoard] = useState(Array(42).fill(statusEnum.EMPTY));
  const [loaderTitle, setLoaderTitle] = useState("Waiting for player...")
  const [victoryCount, setVictoryCount] = useState({ [statusEnum.RED]: 0, [statusEnum.YELLOW]: 0 })
  const [isWaitingForRematch, setIsWaitingForRematch] = useState(false)


  useEffect(() => {
    clientIO.connect();

    const startPlaying = ({ board, names }) => {
      setPlayersName(() => ({ [statusEnum.RED]: names[statusEnum.RED], [statusEnum.YELLOW]: names[statusEnum.YELLOW] }))
      setCanPlay(true)
      setBoard(board)
    }

    const playerLeft = () => {
      setCanPlay(false)
      setLoaderTitle("player left")
    }

    const onPlay = ({ board, next }) => {
      if (next) {
        setBoard(board)
        setTurnsCount(prev => prev + 1);
      }
    }

    const onWinner = ({ color }) => {
      setWinnerColor(color)
    }

    const setPlayerData = ({ color }) => {
      setPlayerColor(color)
    }

    const setSpceficRooms = (rooms) => {
      console.log(rooms)
      setRoomsList(rooms);
    }

    const onWaitForSpecificRoom = ({ room }) => {
      setLoaderTitle(`Waiting for player in ${room}...`)
    }
    const onRematch = ({ board, victoryCount }) => {
      setTurnsCount(0);
      setWinnerColor(statusEnum.EMPTY);
      setBoard(board);
      setVictoryCount(victoryCount)
      setIsWaitingForRematch(false)
    }

    const onWaitForRematch = () => {
      setIsWaitingForRematch(true)
    }

    clientIO.on("play", onPlay)
    clientIO.on("startPlaying", startPlaying)
    clientIO.on("playerEnterData", setPlayerData)
    clientIO.on("winner", onWinner)
    clientIO.on("updateSpecificRooms", setSpceficRooms)
    clientIO.on("waitForSpecificRoom", onWaitForSpecificRoom)
    clientIO.on("playerLeft", playerLeft)
    clientIO.on("rematch", onRematch)
    clientIO.on("waitForRematch", onWaitForRematch)

    return () => {
      clientIO.off("play", onPlay)
      clientIO.off("startPlaying", startPlaying)
      clientIO.off("playerEnterData", setPlayerData)
      clientIO.off("winner", onWinner)
      clientIO.off("updateSpecificRooms", setSpceficRooms)
      clientIO.on("waitForSpecificRoom", onWaitForSpecificRoom)
      clientIO.off("playerLeft", playerLeft)
      clientIO.off("rematch", onRematch)
      clientIO.off("waitForRematch", onWaitForRematch)
    }
  }, [])

  const playerPlay = (index) => {
    if (isAllowedToPlay)
      clientIO.emit("playerPlay", { color: playerColor, index })
  }

  const onOut = () => {
    window.location.reload()
  }

  const onRematch = () => {
    clientIO.emit("rematch")
  }

  return (
    <div className={styles.appContainer}>
      {
        playerColor === statusEnum.EMPTY ? <SignIn roomsList={roomsList} /> :
          <>
            <div className={styles.exitBtn} onClick={onOut}>
              <img className={styles.exitIcon} src={exit} alt="" />
            </div>
            {
              !canStartGame ? <Loader title={loaderTitle} /> :
                <div className={styles.gameContainer}>
                  <div className={styles.victoryCountBoard}>
                    <div className={classNames(styles.counter, styles.red)}>
                      {victoryCount[statusEnum.RED]}
                    </div>
                    <div className={classNames(styles.counter, styles.yellow)}>
                      {victoryCount[statusEnum.YELLOW]}
                    </div>
                  </div>
                  <img className={styles.arrow} turn={currentPlayer} src={arrow} alt="" />
                  <div className={classNames(styles.player, styles.red)}>
                    <div className={styles.name}>{playersName[statusEnum.RED]}</div>
                    {playerColor === statusEnum.RED && <div className={styles.turn}>{isAllowedToPlay ? "your" : "his"} turn</div>}
                  </div>
                  <div className={classNames(styles.player, styles.yellow)}>
                    <div className={styles.name}>{playersName[statusEnum.YELLOW]}</div>
                    {playerColor === statusEnum.YELLOW && <div className={styles.turn}>{isAllowedToPlay ? "your" : "his"} turn</div>}
                  </div>
                  <Board board={board} playerPlay={playerPlay} isAllowedToPlay={isAllowedToPlay} />
                  {
                    !!winnerColor && 
                    <div className={styles.winnerContainer}>
                      {
                        isWaitingForRematch ? <Loader title="Waiting for opponent..." /> :
                          <>
                            <img className={styles.crown} playerColor={winnerColor} src={crown} alt="" />
                            <div onClick={onRematch} className={styles.rematchBtn}>
                              <img className={styles.rematchIcon} src={restart} alt="" />
                            </div>
                          </>
                      }
                    </div>
                  }
                </div>
            }
          </>
      }
    </div>
  )
}

const Loader = ({ title }) => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loaderBg}></div>
      <div className={styles.title}>{title}</div>
      <img className={styles.loader} src={loader} alt="" />
    </div>
  )
}

export default App