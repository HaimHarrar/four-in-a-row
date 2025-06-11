import { useEffect, useState, useMemo } from 'react'
import styles from '../styles/InputSelector.module.scss'
import OutsideClickHandler from 'react-outside-click-handler';
import Fuse from 'fuse.js';

const InputSelector = ({ options, placeholder, selected, setSelected }) => {
    const [isSelectorOpen, setIsSelectorOpen] = useState(false)
    const [text, setText] = useState(selected || "")
    const renderOptions = useMemo(() => {
        const fuse = new Fuse(options, {
            includeScore: true,
            threshold: 0.25,
        })
        return text === "" ? options : fuse.search(text).map(({ item }) => item)
    }, [text, options])

    useEffect(() => {
        const onEscape = (e) => e.key === "Escape" && setIsSelectorOpen(false)
        document.addEventListener("keydown", onEscape)
        return () => document.removeEventListener("keydown", onEscape)
    }, [])

    useEffect(() => {
        setText(selected || text)
    }, [selected])

    useEffect(() => {
        if (options.includes(text)) setSelected(text)
        else setSelected("")
    }, [text])

    return (
        <div className={styles.inputSelector}>
            <input className={styles.input} value={text} type="text" onChange={(e) => setText(e.target.value)} placeholder={placeholder} onClick={() => setIsSelectorOpen(!isSelectorOpen)} />

            {isSelectorOpen && !!(renderOptions.length) &&
                <OutsideClickHandler
                    onOutsideClick={() => {
                        setIsSelectorOpen(false);
                    }}
                >
                    <div className={styles.options}>
                        {
                            renderOptions.map((option) => (<div key={option} onClick={() => { setIsSelectorOpen(false); setSelected(option) }} className={styles.option}>
                                {option}
                            </div>))
                        }
                    </div>
                </OutsideClickHandler>
            }
        </div>
    )
}

export default InputSelector