import React, { useEffect, useState } from 'react'
import { clientIO } from '../utils/io'
import styles from '../styles/SignIn.module.scss'
import InputSelector from './InputSelector'
import classNames from 'classnames'

const SignIn = ({ roomsList }) => {
  const [name, setName] = useState("")
  const [room, setRoom] = useState("")

  const joinSpecificRoom = () => {
    if(new Set(roomsList).has(room)){
      clientIO.emit("playerEnterSpecific", { name, room })
    }
  }
  const createRoom = () => {
    clientIO.emit("playerEnterSpecific", { name })
  }

  const joinRandomRoom = () => {
    clientIO.emit("playerEnterRandom", { name })
  }

  return (
    <div className={styles.signInContainer}>
      <div className={styles.inputContainer}>
        <input placeholder='enter your name please' className={styles.input} type="text" max={20} value={name} onChange={(e) => setName(e.target.value)} />
        <div className={styles.inputSelectorContainer}>
          <InputSelector setSelected={setRoom} selected={room} options={Array.from(roomsList)} title='Join to room:' />
        </div>
      </div>
        <div  className={classNames(styles.buttons, {[styles.disabled]: !name})}>
          <div onClick={joinSpecificRoom} className={styles.btn}>join to specific room</div>
          <div onClick={createRoom} className={styles.btn}>open a room</div>
          <div onClick={joinRandomRoom} className={styles.btn}>play with a random player</div>
        </div>
    </div>
  )
}

export default SignIn