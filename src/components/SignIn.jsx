import React, { useEffect, useState } from 'react'
import { clientIO } from '../utils/io'
import styles from '../styles/SignIn.module.scss'
import InputSelector from './InputSelector'
import classNames from 'classnames'

const SignIn = () => {
  const [name, setName] = useState("")
  const [room, setRoom] = useState("")
  const [roomsList, setRoomsList] = useState(new Set());
  
  useEffect(() => {
    const setSpceficRooms = (rooms) => {
      setRoomsList(() => new Set(rooms));
    }

    clientIO.on("updateRoomsList", setSpceficRooms)
    return () => {
      clientIO.off("updateRoomsList", setSpceficRooms)
    }
  }, [])

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
  const playOnOnPC = () => {
    clientIO.emit("OnePC")
  }

  return (
    <div className={styles.signInContainer}>
      <div className={styles.inputContainer}>
        <input placeholder='enter your name please' className={styles.input} type="text" max={20} value={name} onChange={(e) => setName(e.target.value)} />
        <div className={styles.inputSelectorContainer}>
          <InputSelector setSelected={setRoom} selected={room} options={Array.from(roomsList)} placeholder='Join to room:' />
        </div>
      </div>
        <div  className={classNames(styles.buttons)}>
          <div onClick={joinSpecificRoom} className={classNames(styles.btn, {[styles.disabled]: (!name || !roomsList.has(room))})}>join to specific room</div>
          <div onClick={createRoom} className={classNames(styles.btn, {[styles.disabled]: !name})}>open a room</div>
          <div onClick={joinRandomRoom} className={classNames(styles.btn, {[styles.disabled]: !name})}>play with a random player</div>
          <div onClick={playOnOnPC}className={styles.btn}>OnePC</div>
        </div>
    </div>
  )
}

export default SignIn