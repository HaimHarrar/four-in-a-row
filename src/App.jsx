import { useEffect, useMemo, useState } from 'react';
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
import "./App.scss"
import InputSelector from './components/InputSelector';

export const statusEnum = {
  EMPTY: 0,
  FIRST: 1,
  SECOND: 2
}

function App() {
  const [playersName, setPlayersName] = useState({ [statusEnum.SECOND]: "", [statusEnum.FIRST]: "" });
  const [playerIndex, setPlayerIndex] = useState(statusEnum.EMPTY);
  const [turnsCount, setTurnsCount] = useState(0);
  const [firstPlayer, setFirstPlayer] = useState();
  const [winnerIndex, setWinnerIndex] = useState(statusEnum.EMPTY);
  const currentPlayer = useMemo(() => turnsCount % 2 ? (firstPlayer % 2) + 1 : firstPlayer, [turnsCount, firstPlayer])
  const isAllowedToPlay = useMemo(() => currentPlayer === playerIndex, [playerIndex, currentPlayer])
  const [canStartGame, setCanPlay] = useState(false)
  const [board, setBoard] = useState(Array(42).fill(statusEnum.EMPTY));
  const [loaderTitle, setLoaderTitle] = useState("Waiting for player...")
  const [victoryCount, setVictoryCount] = useState({ [statusEnum.SECOND]: 0, [statusEnum.FIRST]: 0 })
  const [isWaitingForRematch, setIsWaitingForRematch] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState("")

  useEffect(() => {
    clientIO.connect();

    const startPlaying = ({ board, names, firstPlayer }) => {
      setPlayersName(() => ({ [statusEnum.SECOND]: names[statusEnum.SECOND], [statusEnum.FIRST]: names[statusEnum.FIRST] }))
      setCanPlay(true)
      setBoard(board)
      setFirstPlayer(firstPlayer)
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

    const onWinner = ({ playerIndex }) => {
      setWinnerIndex(playerIndex)
    }

    const setPlayerData = ({ playerIndex }) => {
      setPlayerIndex(playerIndex)
    }

    const onWaitForSpecificRoom = ({ room }) => {
      setLoaderTitle(`Waiting for player in ${room}...`)
    }
    const onRematch = ({ board, victoryCount, firstPlayer }) => {
      setTurnsCount(0);
      setWinnerIndex(statusEnum.EMPTY);
      setBoard(board);
      setVictoryCount(victoryCount)
      setIsWaitingForRematch(false)
      setFirstPlayer(firstPlayer);
    }

    const onWaitForRematch = () => {
      setIsWaitingForRematch(true)
    }

    clientIO.on("play", onPlay)
    clientIO.on("startPlaying", startPlaying)
    clientIO.on("playerEnterData", setPlayerData)
    clientIO.on("winner", onWinner)
    clientIO.on("waitForSpecificRoom", onWaitForSpecificRoom)
    clientIO.on("playerLeft", playerLeft)
    clientIO.on("rematch", onRematch)
    clientIO.on("waitForRematch", onWaitForRematch)

    return () => {
      clientIO.off("play", onPlay)
      clientIO.off("startPlaying", startPlaying)
      clientIO.off("playerEnterData", setPlayerData)
      clientIO.off("winner", onWinner)
      clientIO.on("waitForSpecificRoom", onWaitForSpecificRoom)
      clientIO.off("playerLeft", playerLeft)
      clientIO.off("rematch", onRematch)
      clientIO.off("waitForRematch", onWaitForRematch)
    }
  }, [])

  const playerPlay = (index) => {
    if (isAllowedToPlay)
      clientIO.emit("playerPlay", { playerIndex, index })
  }

  const onOut = () => {
    window.location.reload()
  }

  const onRematch = () => {
    clientIO.emit("rematch")
  }

  return (
    <div theme={selectedTheme} className={classNames(styles.appContainer, "app-container")}>
      <div className={styles.themeSelectorContainer}>
        <InputSelector placeholder={"Theme"} selected={selectedTheme} setSelected={setSelectedTheme} title={"Theme"} options={["regular", "monochrome"]}/>
      </div>
      {
        playerIndex === statusEnum.EMPTY ? <SignIn/> :
          <>
            <div className={classNames(styles.exitBtn)} onClick={onOut}>
              <img className={styles.exitIcon} src={exit} alt="" />
            </div>
            {
              !canStartGame ? <Loader title={loaderTitle} /> :
              // false ? <Loader title={loaderTitle} /> :
                <div className={styles.gameContainer}>
                  <div className={styles.victoryCountBoard}>
                    <div className={classNames(styles.counter, styles.second)}>
                      {victoryCount[statusEnum.SECOND]}
                    </div>
                    <div className={classNames(styles.counter, styles.first)}>
                      {victoryCount[statusEnum.FIRST]}
                    </div>
                  </div>
                  <img className={classNames(styles.arrow)} turn={currentPlayer} src={arrow} alt="" />
                  <div className={classNames(styles.player, styles.second)}>
                    <div className={styles.name}>{playersName[statusEnum.SECOND]}</div>
                    {playerIndex === statusEnum.SECOND && <div className={styles.turn}>{isAllowedToPlay ? "your" : "his"} turn</div>}
                  </div>
                  <div className={classNames(styles.player, styles.first)}>
                    <div className={styles.name}>{playersName[statusEnum.FIRST]}</div>
                    {playerIndex === statusEnum.FIRST && <div className={styles.turn}>{isAllowedToPlay ? "your" : "his"} turn</div>}
                  </div>
                  <Board board={board} playerPlay={playerPlay} isAllowedToPlay={isAllowedToPlay} />
                  {
                    !!winnerIndex && 
                    <div className={styles.winnerContainer}>
                      {
                        isWaitingForRematch ? <Loader title="Waiting for opponent..." /> :
                          <>
                            <img className={styles.crown} playerindex={winnerIndex} src={crown} alt="" />
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