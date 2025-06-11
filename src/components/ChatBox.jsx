import { useEffect, useRef, useState } from 'react'
import styles from '../styles/ChatBox.module.scss'
import { clientIO } from '../utils/io'
import send from '../assets/icons/send.svg'
import arrowUp from '../assets/icons/arrow-up.svg'
import arrowDown from '../assets/icons/arrow-down.svg'
import newMessages from '../assets/icons/new-messages.svg'
import socketEvents from '../../socketEvents.json'
import classNames from 'classnames'

const ChatBox = ({ player }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [messageToSend, setMessageToSend] = useState("")
  const [hasRead, setHasRead] = useState(true)
  const messagesRef = useRef(null);

  useEffect(() => {
    const onMessage = ({ messages }) => {
      setMessages(messages)
      if (!isOpen) {
        setHasRead(false);
      }
      requestAnimationFrame(() => {
        messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
      })
    }

    clientIO.on(socketEvents.message, onMessage)
    return () => {
      clientIO.off(socketEvents.message, onMessage)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
      setHasRead(true)
    }
  }, [isOpen])

  const sendMessage = () => {
    if (!messageToSend) return
    clientIO.emit(socketEvents.message, { message: messageToSend, player })
    setMessageToSend("")
  }

  return (
    <div className={styles.chatBoxContainer}>
      <div is-open={isOpen.toString()} className={styles.header}>
        <p>chat box</p>
        {!hasRead && !isOpen && <img src={newMessages} className={styles.newMessagesIcon} alt="" />}
        <div onClick={() => setIsOpen(!isOpen)} className={styles.arrowContainer}>
          <img src={isOpen ? arrowDown : arrowUp} className={styles.arrowIcon} alt="" />
        </div>
      </div>
      <div className={classNames(styles.messagesContainer, { [styles.open]: isOpen })}>
        <div className={styles.messages} ref={messagesRef} is-open={isOpen.toString()}>
          {messages.map((message, index) => <div className={styles.message} player={message.player} key={index}>{message.message}</div>)}
        </div>
        <div className={styles.inputContainer}>
          <input value={messageToSend} onChange={(e) => setMessageToSend(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} className={styles.input} type="text" />
          <img src={send} className={styles.sendIcon} onClick={sendMessage} type="submit" alt="" />
        </div>
      </div>
    </div>
  )
}

export default ChatBox