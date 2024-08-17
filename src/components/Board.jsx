import React, { useEffect, useMemo, useState } from 'react'
import styles from '../styles/Board.module.scss'
import Square from './Square'
import { statusEnum } from '../App'

const Board = ({turnsCount, setTurnsCount, currentPlayer, setIsThereWinner, isThereWinner}) => {
  const [squareArray, setSquareArray] = useState(Array(42).fill(0).map(() => statusEnum.EMPTY))
  useEffect(() => {
    for(let i = 41; i >= 0; i--){
      if(squareArray[i]){

        if(i + 3 < 42){
          if((squareArray[i] === squareArray[i + 1]) && (squareArray[i] === squareArray[i + 2]) && (squareArray[i] === squareArray[i + 3])){
            console.log(squareArray[i] + " winner");
            setIsThereWinner(true)
          }
        }
        if(i + 21 < 42){
          if((squareArray[i] === squareArray[i + 7]) && (squareArray[i] === squareArray[i + 14]) && (squareArray[i] === squareArray[i + 21])){
            console.log(squareArray[i] + " winner");
            setIsThereWinner(true)
          }
        }
        if(i + 24 < 42){
          if((squareArray[i] === squareArray[i + 8]) && (squareArray[i] === squareArray[i + 16]) && (squareArray[i] === squareArray[i + 24])){
            console.log(squareArray[i] + " winner");
            setIsThereWinner(true)
          }
        }
        if(i + 18 < 42){
          if((squareArray[i] === squareArray[i + 6]) && (squareArray[i] === squareArray[i + 12]) && (squareArray[i] === squareArray[i + 18])){
            console.log(squareArray[i] + " winner");
            setIsThereWinner(true)
          }
        }
      }
    }
  }, [turnsCount])

  return (
    <div className={styles.boardContainer}>
        {
            squareArray.map((fill, index) =>(
            <Square 
              isThereWinner={isThereWinner}
              key={index}
              index={index}
              fill={fill}
              playByIndex={(index) => {
                if(isThereWinner) return false
                const findFreeSquare = (column) => {
                  for(let i = 41 - (6 - column); i >= 0 ; i -= 7){
                    if(!(squareArray[i])) return i
                  }
                  return false
                }
                const finalIndex = findFreeSquare(index % 7);
                if(finalIndex) {
                  setSquareArray((prev) => {
                    const newArray = [...prev]
                    newArray[finalIndex] = currentPlayer;
                    return newArray
                  })
                  setTurnsCount(prev => prev + 1);
                }
              }} 
            />))
        }
    </div>
  )
}

export default Board