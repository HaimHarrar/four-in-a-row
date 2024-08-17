import React from 'react'
import styles from '../styles/Square.module.scss'

const Square = ({setTurnsCount, isThereWinner, index, playByIndex, fill}) => {
  return (
    <div className={styles.squareContainer}>
        <Circle fill={fill} index={index} isThereWinner={isThereWinner} playByIndex={playByIndex} setTurnsCount={setTurnsCount}/>
    </div>
  )
}

const Circle = ({ playByIndex, index, fill, isThereWinner }) => {
    return (
        <div is-over={isThereWinner.toString()} onClick={() => {playByIndex(index);}} className={styles.circleContainer} fill={fill}></div>
    )
}

export default Square