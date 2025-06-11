import React, { useState } from 'react'
import styles from '../styles/PreparedMessages.module.scss'
import arrowUp from '../assets/icons/arrow-up.svg'
import arrowDown from '../assets/icons/arrow-down.svg'
import { clientIO } from '../utils/io'
import socketEvents from '../../socketEvents.json'
const options = [
    "😀 מהלך יפה",
    "👑 איזה מלך",
    "👋 נעים להכיר",
    "עוד משחק",
    "משחק יפה",
    "נראה אותך",
    "👊 אני אקרע אותך",
    "?מילים אחרונות",
    "אין עליך",
    "אין עליי",
    "...מממ",
    "🤏 כזה קטן",
    "לא ציפיתי",
]

const PreparedMessages = ({player}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.preparedMessagesContainer}>
        <div className={styles.header}>
            <h2>Prepared messages</h2>
            <div onClick={() => setIsOpen(!isOpen)} className={styles.arrowContainer}>
                <img src={isOpen ? arrowDown : arrowUp} className={styles.arrowIcon} alt="" />
            </div>
        </div>
        { isOpen &&
            <div className={styles.messages}>
                {
                    options.map((option, index) => (
                        <div onClick={() => clientIO.emit(socketEvents.message, {message: option, player})} className={styles.message} key={index}>
                            {option}
                        </div>
                    ))
                }
            </div>
        }
    </div>
  )
}

export default PreparedMessages