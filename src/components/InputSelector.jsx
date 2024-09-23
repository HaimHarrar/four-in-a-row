import React, { useEffect, useState, useMemo } from 'react'
import styles from '../styles/InputSelector.module.scss'
import OutsideClickHandler from 'react-outside-click-handler';
import Fuse from 'fuse.js';

const InputSelector = ({ options, title }) => {
    const [isSelectorOpen, setIsSelectorOpen] = useState(false)
    const [searchText, setSearchText] = useState("");
    const renderOptions = useMemo(() => {
        const fuse = new Fuse(options, {
            includeScore: true,
            threshold: 0.25,
        })
        return searchText === "" ? options : fuse.search(searchText).map(({ item }) => item)
    })
    useEffect(() => {
        const onEscape = (e) => e.key === "Escape" && setIsSelectorOpen(false)
        document.addEventListener("keydown", onEscape)
        return () => document.removeEventListener("keydown", onEscape)
    }, [])

    return (
        <div className={styles.inputSelector}>
            <input className={styles.input} value={searchText} type="text" onChange={(e) => setSearchText(e.target.value)} placeholder={title} onClick={() => setIsSelectorOpen(!isSelectorOpen)}/>

            {isSelectorOpen &&
                <OutsideClickHandler
                    onOutsideClick={() => {
                        setIsSelectorOpen(false);
                    }}
                >
                    <div className={styles.options}>
                        {
                            renderOptions.map((option) => (<div key={option} onClick={() => {setIsSelectorOpen(false); setSearchText(option)}} className={styles.option}>
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