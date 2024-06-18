'use client';
import React, { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { fetchTasks, deleteTask } from '../board/fetchTasks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


export default function Backlog() {
    const [ tasks, setTasks ] = useState([]);
    const [ deleteIndex, setDeleteIndex ] = useState(-1)

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

    useEffect(() => {
        const fn = async () => {
            if ( deleteIndex === -1 ) {
                return;
            }

            try {
                await deleteTask({
                    taskId: tasks[deleteIndex].id
                })

                setTasks(prev => {
                    const next = prev.map(v => Object.assign({}, v));

                    next.splice(deleteIndex, 1);

                    return next;
                })
            } catch (e) {
                console.log(e);
            }
        };

        fn();
    }, [ deleteIndex ])

    const onClickDelete = function(index) {
        setDeleteIndex(index);
    };

    return (
        <main>
            <div className={styles.stack}>
                { tasks.map((v, index) => {
                    return  (<div key={v.id} className={styles.task}>
                         <FontAwesomeIcon onClick={(e) => {
                            e.stopPropagation()
                            onClickDelete(index)
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