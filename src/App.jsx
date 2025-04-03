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
import ChatBox from './components/ChatBox';
import PreparedMessages from './components/PreparedMessages';
import socketEvents from '../socketEvents.json'
export const statusEnum = {
  EMPTY: 0,
  FIRST: 1,
  SECOND: 2,
  FIRST_WIN: 3,
  SECOND_WIN: 4
}

function App() {
  const [playersName, setPlayersName] = useState({ [statusEnum.SECOND]: "", [statusEnum.FIRST]: "" });
  const [playerIndex, setPlayerIndex] = useState(statusEnum.EMPTY);
  const [turnsCount, setTurnsCount] = useState(0);
  const [isOnePC, setIsOnePC] = useState(false);
  const [firstPlayer, setFirstPlayer] = useState();
  const [winnerIndex, setWinnerIndex] = useState(statusEnum.EMPTY);
  const currentPlayer = useMemo(() => turnsCount % 2 ? (firstPlayer % 2) + 1 : firstPlayer, [turnsCount, firstPlayer])
  const isAllowedToPlay = useMemo(() => isOnePC || currentPlayer === playerIndex, [playerIndex, currentPlayer])
  const [canStartGame, setCanPlay] = useState(false)
  const [board, setBoard] = useState(Array(42).fill(statusEnum.EMPTY));
  const [loaderTitle, setLoaderTitle] = useState("Waiting for player...")
  const [victoryCount, setVictoryCount] = useState({ [statusEnum.SECOND]: 0, [statusEnum.FIRST]: 0 })
  const [isWaitingForRematch, setIsWaitingForRematch] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("wooden");
  const [isWaitingForAction, setIsWaitingForAction] = useState(false);
  
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
        setIsWaitingForAction(false)
        setTurnsCount(prev => prev + 1);
        if(isOnePC) {
          setPlayerIndex((prev) => prev === statusEnum.FIRST ? statusEnum.SECOND : statusEnum.FIRST)
        }
      } else {
        setIsWaitingForAction(false)
      }
    }

    const onWinner = ({ playerIndex, board }) => {
      setWinnerIndex(playerIndex)
      setBoard(board)
    }

    const setPlayerData = ({ playerIndex }) => {
      setPlayerIndex(playerIndex)
    }

    const onWaitForSpecificRoom = ({ room }) => {
      setLoaderTitle(`Waiting for player in Room: ${room}`)
    }

    const onOnePC = ({board, firstPlayer}) => {
      setCanPlay(true)
      setBoard(board)
      setIsOnePC(true)
      setPlayerIndex(firstPlayer)
      setFirstPlayer(firstPlayer)
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

    clientIO.on(socketEvents.play, onPlay)
    clientIO.on(socketEvents.startPlaying, startPlaying)
    clientIO.on(socketEvents.playerEnterData, setPlayerData)
    clientIO.on(socketEvents.winner, onWinner)
    clientIO.on(socketEvents.waitForSpecificRoom, onWaitForSpecificRoom)
    clientIO.on(socketEvents.playerLeft, playerLeft)
    clientIO.on(socketEvents.rematch, onRematch)
    clientIO.on(socketEvents.waitForRematch, onWaitForRematch)
    clientIO.on(socketEvents.OnePC, onOnePC)

    return () => {
      clientIO.off(socketEvents.play, onPlay)
      clientIO.off(socketEvents.startPlaying, startPlaying)
      clientIO.off(socketEvents.playerEnterData, setPlayerData)
      clientIO.off(socketEvents.winner, onWinner)
      clientIO.on(socketEvents.waitForSpecificRoom, onWaitForSpecificRoom)
      clientIO.off(socketEvents.playerLeft, playerLeft)
      clientIO.off(socketEvents.rematch, onRematch)
      clientIO.off(socketEvents.waitForRematch, onWaitForRematch)
      clientIO.off(socketEvents.OnePC, onOnePC)
    }
  }, [isOnePC])

  const playerPlay = (index) => {
    if (isAllowedToPlay && !isWaitingForAction && !winnerIndex) {
      setIsWaitingForAction(true)
      clientIO.emit(socketEvents.playerPlay, { playerIndex, index })
    }
  }

  const onOut = () => {
    window.location.reload()
  }

  const onRematch = () => {
    clientIO.emit(socketEvents.rematch)
  }

  return (
    <div theme={selectedTheme} className={classNames(styles.appContainer, "app-container")}>
      <div className={styles.themeSelectorContainer}>
        <InputSelector placeholder={"Theme"} selected={selectedTheme} setSelected={setSelectedTheme} title={"Theme"} options={["monochrome", "wooden"]}/>
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
                    !isOnePC &&
                    <>
                      <ChatBox player={playerIndex}/>
                      <PreparedMessages player={playerIndex}/>
                    </>
                    
                  }
                  {
                    !!winnerIndex && 
                    // true && 
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