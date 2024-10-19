import { statusEnum } from '../App'
import styles from '../styles/Board.module.scss'
import cross from '../assets/icons/cross.svg'
const Board = ({board, playerPlay}) => {
  return (
    <div className={styles.boardContainer}>
        {
            board.map((color, index) =>(
            <Square 
              key={index}
              index={index}
              fillcolor={color}
              playerPlay={playerPlay}
            />))
        }
    </div>
  )
}

const Square = ({ fillcolor, playerPlay, index }) => {
  return (
    <div className={styles.squareContainer}>
        <div className={styles.bgCircle}></div>
        <Circle fillcolor={fillcolor} index={index} playerPlay={playerPlay}/>
    </div>
  )
}

const Circle = ({ playerPlay, index, fillcolor }) => {
  return (
    <div onClick={() => {playerPlay(index);}} className={styles.circleContainer} fillcolor={fillcolor}></div>
  )
}

export default Board