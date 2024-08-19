import React from 'react'

const Game = () => {
    const [playerColor, setPlayerColor] = useState() 
  const [turnsCount, setTurnsCount] = useState(0);
  const [isThereWinner, setIsThereWinner] = useState(false);
  const currentPlayer = useMemo(() => turnsCount % 2 ? statusEnum.YELLOW : statusEnum.RED, [turnsCount])
  const isCurrentPlayerTurn = useMemo(() => currentPlayer === playerColor, [playerColor, currentPlayer])

  useEffect(() => {
    const onGetColor = ({playerColor}) => {
      console.log(playerColor);
      setPlayerColor(playerColor)
    }

    clientIO.on("getColor", onGetColor)

    return () => {
      clientIO.off("getColor", onGetColor)
    }
  }, [])

  return (
    <div className={styles.gameContainer}>
        <img className={styles.arrow} turn={currentPlayer} src={arrow} alt="" />
        <div className={classNames(styles.player, styles.first)}>
          <div className={styles.name}>{players.red}</div>
          {playerColor === statusEnum.RED && <div className={styles.turn}>{isCurrentPlayerTurn ? "your" : "his"} turn</div>}
        </div>
        <div className={classNames(styles.player, styles.second)}>
          <div className={styles.name}>{players.yellow}</div>
          {playerColor === statusEnum.YELLOW &&<div className={styles.turn}>{isCurrentPlayerTurn ? "your" : "his"} turn</div>}
        </div>
        <Board currentPlayer={currentPlayer} isCurrentPlayerTurn={isCurrentPlayerTurn} isThereWinner={isThereWinner} setIsThereWinner={setIsThereWinner} turnsCount={turnsCount} setTurnsCount={setTurnsCount}/>
        {
          isThereWinner && <img className={styles.crown} turn={currentPlayer} src={crown} alt="" />
        }
    </div>
  )
}

export default Game