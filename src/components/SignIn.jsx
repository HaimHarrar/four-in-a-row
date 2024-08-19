import React, { useState } from 'react'
import { clientIO } from '../utils/io'
import styles from '../styles/SignIn.module.scss'
import send from '../assets/icons/send.svg'
import loader from '../assets/icons/loader.svg'
const SignIn = ({ isWaitingForPlayer}) => {
    const [name, setName] = useState("")
    const onSend = () => {
      console.log("onsend");
      
      clientIO.connect()
      clientIO.emit("playerEnter", {name})
    }

  return (
    <div className={styles.signInContainer}>
      {
        isWaitingForPlayer ? <img className={styles.loader} src={loader} alt=""/> : 
        <div>
          <input placeholder='enter your name please' className={styles.input} type="text" max={20} value={name} onKeyPress={(e) => e.key === "Enter" && onSend()} onChange={(e) =>  setName(e.target.value)}/>
          <img className={styles.send} src={send} alt=""  onClick={() => onSend()}/>
        </div>
      }
       
    </div>
  )
}

export default SignIn