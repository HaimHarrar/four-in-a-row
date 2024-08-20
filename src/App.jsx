import { createContext, useEffect, useMemo, useState } from 'react';
import styles from './App.module.scss'
import Board from './components/Board'
import arrow from './assets/icons/arrow.svg'
import crown from './assets/icons/crown.svg'
import { clientIO } from './utils/io';
import classNames from 'classnames';
import SignIn from './components/SignIn';
export const statusEnum = {
  EMPTY: 0,
  YELLOW: 1,
  RED: 2
}
function App() {
  const [playersName, setPlayersName] = useState({[statusEnum.RED]: "", [statusEnum.YELLOW]: ""});
  const [playerColor, setPlayerColor] = useState() 
  const [turnsCount, setTurnsCount] = useState(0);
  const [isThereWinner, setIsThereWinner] = useState(false);
  const currentPlayer = useMemo(() => turnsCount % 2 ? statusEnum.YELLOW : statusEnum.RED, [turnsCount])
  const isCurrentPlayerTurn = useMemo(() => currentPlayer === playerColor, [playerColor, currentPlayer])
  const [canStart, setCanStart] = useState(false)
  const [board, setBoard] = useState();
  const [isWaitingForPlayer, setIsWaitingForPlayer] = useState(false);;
  
  useEffect(() => {
    clientIO.connect();

    const onGetColor = ({playerColor}) => {
      setPlayerColor(playerColor);
      setIsWaitingForPlayer(true)
    }

    const startPlaying = ({board, names}) => {
      setPlayersName(() => ({[statusEnum.RED]: names.first, [statusEnum.YELLOW]: names.second}))
      setCanStart(true)
      setBoard(board)
    }

    const playerLeft = () => {
      setCanStart(false)
      setIsWaitingForPlayer(false)
    }

    clientIO.on("getColor", onGetColor)
    clientIO.on("startPlaying", startPlaying)
    clientIO.on("playerLeft", playerLeft)

    return () => {
      clientIO.off("getColor", onGetColor)
      clientIO.off("startPlaying", startPlaying)
      clientIO.off("playerLeft", playerLeft)
    }
  }, [])

  return (
    <div className={styles.appContainer}>
        {
          !canStart ? <SignIn isWaitingForPlayer={isWaitingForPlayer}/> :
          <div className={styles.gameContainer}>
            <img className={styles.arrow} turn={currentPlayer} src={arrow} alt="" />
            <div className={classNames(styles.player, styles.first)}>
              <div className={styles.name}>{playersName[statusEnum.RED]}</div>
              {playerColor === statusEnum.RED && <div className={styles.turn}>{isCurrentPlayerTurn ? "your" : "his"} turn</div>}
            </div>
            <div className={classNames(styles.player, styles.second)}>
              <div className={styles.name}>{playersName[statusEnum.YELLOW]}</div>
              {playerColor === statusEnum.YELLOW &&<div className={styles.turn}>{isCurrentPlayerTurn ? "your" : "his"} turn</div>}
            </div>
            <Board board={board} setBoard={setBoard} currentPlayer={currentPlayer} isCurrentPlayerTurn={isCurrentPlayerTurn} isThereWinner={isThereWinner} setIsThereWinner={setIsThereWinner} turnsCount={turnsCount} setTurnsCount={setTurnsCount}/>
            {
              isThereWinner && <img className={styles.crown} turn={currentPlayer} src={crown} alt="" />
            }
          </div>
        }

    </div>
  )
}

export default App
