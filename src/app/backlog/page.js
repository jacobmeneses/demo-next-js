'use client';
import React, { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { fetchTasks } from '../board/fetchTasks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function Backlog() {
    const [ tasks, setTasks ] = useState([]);

    useEffect(() => {
        const fn = async () => {
            try {
                const response = await fetchTasks(null, { plain_response: true });

                setTasks(response.tasks);
            } catch (e) {
                console.log(e)
            }
        };

        fn();
    }, [])

    const onClickDelete = function(e) {

    };

    return (
        <main>
            <div className={styles.stack}>
                { tasks.map((v) => {
                    return  (<div key={v.id} className={styles.task}>
                         <FontAwesomeIcon onClick={(e) => {
                            e.stopPropagation()
                            onClickDelete(e)
                        }} className={styles.xmarkIcon} icon={faXmark} />
                        <div className={styles.taskInner} >
                            <p key={v.id}>{v.title}</p>
                        </div>
                    </div>)
                })}
            </div>
        </main>
    )
}