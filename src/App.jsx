import { createContext, useEffect, useMemo, useState } from 'react';
import styles from './App.module.scss'
import Board from './components/Board'
import arrow from './assets/icons/arrow.svg'
import crown from './assets/icons/crown.svg'
export const statusEnum = {
  EMPTY: 0,
  YELLOW: 1,
  RED: 2
}
function App() {
  const players = {first: "haim", second: "avi"}
  const [turnsCount, setTurnsCount] = useState(0);
  const [isThereWinner, setIsThereWinner] = useState(false);
  const currentPlayer = useMemo(() => turnsCount % 2 ? statusEnum.YELLOW : statusEnum.RED, [turnsCount])

  return (
    <div className={styles.appContainer}>
        <img className={styles.arrow} turn={currentPlayer} src={arrow} alt="" />
        <div className={styles.firstPlayer}>{players.first}</div>
        <Board currentPlayer={currentPlayer} isThereWinner={isThereWinner} setIsThereWinner={setIsThereWinner} turnsCount={turnsCount} setTurnsCount={setTurnsCount}/>
        <div className={styles.secondPlayer}>{players.second}</div>
        {
          isThereWinner && <img className={styles.crown} turn={currentPlayer} src={crown} alt="" />
        }
    </div>
  )
}

export default App
