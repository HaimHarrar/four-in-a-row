import React, { useEffect, useMemo, useState } from 'react'
import styles from '../styles/Board.module.scss'
import Square from './Square'
import { statusEnum } from '../App'
import { clientIO } from '../utils/io'

const Board = ({board, setBoard, turnsCount, setTurnsCount, currentPlayer, isCurrentPlayerTurn, setIsThereWinner, isThereWinner}) => {
  
  useEffect(() => {
    const onPlay = ({board, next}) => {
      if(next){
        setBoard(board)
        setTurnsCount(prev => prev + 1)
      }
    }
    
    clientIO.on("play", onPlay)
    return () => {
      clientIO.off("play", onPlay)
    }
  })
  useEffect(() => {
    for(let i = 41; i >= 0; i--){
      if(board[i]){

        if(i + 3 < 42){
          if((board[i] === board[i + 1]) && (board[i] === board[i + 2]) && (board[i] === board[i + 3])){
            console.log(board[i] + " winner");
            setIsThereWinner(true)
          }
        }
        if(i + 21 < 42){
          if((board[i] === board[i + 7]) && (board[i] === board[i + 14]) && (board[i] === board[i + 21])){
            console.log(board[i] + " winner");
            setIsThereWinner(true)
          }
        }
        if(i + 24 < 42){
          if((board[i] === board[i + 8]) && (board[i] === board[i + 16]) && (board[i] === board[i + 24])){
            console.log(board[i] + " winner");
            setIsThereWinner(true)
          }
        }
        if(i + 18 < 42){
          if((board[i] === board[i + 6]) && (board[i] === board[i + 12]) && (board[i] === board[i + 18])){
            console.log(board[i] + " winner");
            setIsThereWinner(true)
          }
        }
      }
    }
  }, [turnsCount])

  return (
    <div className={styles.boardContainer}>
        {
            board.map((fill, index) =>(
            <Square 
              isThereWinner={isThereWinner}
              key={index}
              index={index}
              fill={fill}
              playByIndex={(index) => {
                console.log(isCurrentPlayerTurn);
                
                if(isThereWinner || !isCurrentPlayerTurn) return false
                clientIO.emit("play", ({index, color: currentPlayer}))
              }} 
            />))
        }
    </div>
  )
}

export default Board