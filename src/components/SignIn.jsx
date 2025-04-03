import React, { useEffect, useState } from 'react'
import { clientIO } from '../utils/io'
import styles from '../styles/SignIn.module.scss'
import InputSelector from './InputSelector'
import classNames from 'classnames'
import socketEvents from '../../socketEvents.json'

const SignIn = () => {
  const [name, setName] = useState("")
  const [room, setRoom] = useState("")
  const [roomsList, setRoomsList] = useState(new Set());

  useEffect(() => {
    const setSpecificRooms = (rooms) => {
      setRoomsList(() => new Set(rooms));
    }

    setName(() => localStorage.getItem("name"))
    clientIO.on(socketEvents.updateRoomsList, setSpecificRooms)

    return () => {
      clientIO.off(socketEvents.updateRoomsList, setSpecificRooms)
    }
  }, [])

  const setLocalStorageName = () => {
    if(name !== localStorage.getItem("name")){
      localStorage.setItem("name", name)
    }
  }

  const joinSpecificRoom = () => {
    setLocalStorageName()
    if(new Set(roomsList).has(room)){
      clientIO.emit(socketEvents.playerEnterSpecific, { name, room })
    }
  }
  const createRoom = () => {
    setLocalStorageName()
    clientIO.emit(socketEvents.playerEnterSpecific, { name })
  }

  const joinRandomRoom = () => {
    setLocalStorageName()
    clientIO.emit(socketEvents.playerEnterRandom, { name })
  }
  const playOnOnPC = () => {
    clientIO.emit(socketEvents.OnePC)
  }

  return (
    <div className={styles.signInContainer}>
      <div className={styles.inputContainer}>
        <input placeholder='enter your name please' className={styles.input} type="text" max={20} value={name} onChange={(e) => setName(e.target.value)} />
        <div className={styles.inputSelectorContainer}>
          <InputSelector setSelected={setRoom} selected={room} options={Array.from(roomsList)} placeholder='Join to room:' />
        </div>
      </div>
        <div className={classNames(styles.buttons)}>
          <div onClick={joinSpecificRoom} className={classNames(styles.btn, {[styles.disabled]: (!name || !roomsList.has(room))})}>join to specific room</div>
          <div onClick={createRoom} className={classNames(styles.btn, {[styles.disabled]: !name})}>open a room</div>
          <div onClick={joinRandomRoom} className={classNames(styles.btn, {[styles.disabled]: !name})}>play with a random player</div>
          <div onClick={playOnOnPC}className={styles.btn}>OnePC</div>
        </div>
    </div>
  )
}

export default SignIn