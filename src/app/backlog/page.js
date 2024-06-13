'use client';
import React, { useState, useEffect } from 'react';
import { fetchTasks } from '../board/fetchTasks'

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

    return (
        <main>
            <ul>
                { tasks.map((v) => {
                    return (<li key={v.id}>{v.title}</li>)
                })}
            </ul>
        </main>
    )
}