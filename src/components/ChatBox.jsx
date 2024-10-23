import React, { useEffect, useState } from 'react'
import styles from '../styles/ChatBox.module.scss'
import { clientIO } from '../utils/io'
import send from '../assets/icons/send.svg'
import arrowUp from '../assets/icons/arrow-up.svg'
import arrowDown from '../assets/icons/arrow-down.svg'
const ChatBox = ({player}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [messageToSend, setMessageToSend] = useState("")

  useEffect(() => {
    const onMessage = ({messages}) => {
      setMessages(messages)
    }
    clientIO.on("message", onMessage)
    return () => {
      clientIO.off("message", onMessage)
    }
  }, [])

  const sendMessage = () => {
    clientIO.emit("message", {message: messageToSend, player})
    setMessageToSend("")
  }

  return (
    <div className={styles.chatBoxContainer}>
      <div is-open={isOpen.toString()} className={styles.title}>
        <p>chat box</p>
        <div onClick={() => setIsOpen(!isOpen)} className={styles.arrowContainer}>
          <img src={isOpen ? arrowDown : arrowUp} className={styles.arrowIcon} alt="" />
        </div>
      </div>
      {
        isOpen && 
        <>
          <div className={styles.messagesContainer} is-open={isOpen.toString()}>
            {messages.map((message, index) => <div className={styles.message} player={message.player} key={index}>{message.message}</div>)}
          </div>
            <div className={styles.inputContainer}>
              <input value={messageToSend} onChange={(e) => setMessageToSend(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} className={styles.input} type="text" />
              <img src={send} className={styles.sendIcon} onClick={sendMessage} type="submit" alt="" />
            </div>
        </>
      }
    </div>
  )
}

export default ChatBox