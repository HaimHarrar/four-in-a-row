import React, { useEffect, useMemo, useState } from 'react'
import styles from '../styles/Board.module.scss'
// import Square from './Square'
import { statusEnum } from '../App'
import { clientIO } from '../utils/io'

const Board = ({board, playerPlay}) => {
  return (
    <div className={styles.boardContainer}>
        {
            board.map((color, index) =>(
            <Square 
              key={index}
              index={index}
              fillColor={color}
              playerPlay={playerPlay}
            />))
        }
    </div>
  )
}

const Square = ({ fillColor, playerPlay, index }) => {
  return (
    <div className={styles.squareContainer}>
        <Circle fillColor={fillColor} index={index} playerPlay={playerPlay}/>
    </div>
  )
}

const Circle = ({ playerPlay, index, fillColor }) => {
  return (
    <div onClick={() => {playerPlay(index);}} className={styles.circleContainer} fillColor={fillColor}></div>
  )
}

export default Board