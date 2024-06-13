'use client';

import React, { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { DndContext } from '@dnd-kit/core';
import { Draggable, Droppable } from './components';
import { getAllSprints, changeSelectedSprint, moveTask, createNewTask, deleteTask } from './logic';
import { handleDragEnd, handleNewTaskAtEnterDown } from './handlers';

export default function Board() {
    const [ stacks, setStacks ] = useState([
        { tasks: [], title: 'Todo', key: 'todo', newTaskText: '' },
        { tasks: [], title: 'In progress', key: 'inprogress', newTaskText: '' },
        { tasks: [], title: 'Done', key: 'done', newTaskText: '' },
    ])
    const [ updating, setUpdating ] = useState({ taskId: 0, columnId: 0 });
    const [ newTaskRequest, setNewTaskRequest] = useState({ index: -1, task: null });
    const [ deleteTaskRequest, setDeleteTaskRequest ] = useState({ index_column: -1, index_task: -1, taskId: -1 })
    const [ selectedSprint, setSelectedSprint ] = useState({ index: -1, sprints: [] });

    useEffect(() => {
        getAllSprints({ setSelectedSprint, onError: console.log })
    }, [])
    useEffect(() => {
        changeSelectedSprint({ selectedSprint, setStacks, onError: console.log })
    }, [ selectedSprint ]);

    useEffect(() => {
        moveTask({ updating, onError: console.log })
    }, [ updating ] )

    useEffect(() => {
        createNewTask({ newTaskRequest, setStacks, onError: console.log })
    }, [ newTaskRequest ])

    useEffect(() => {
        deleteTask({ deleteTaskRequest, setStacks, onError: console.log })
    }, [ deleteTaskRequest ])

    //function handleDragEnd(event) {}
    const _handleDragEnd = handleDragEnd({ stacks, setStacks, setUpdating })

    // function handleEnterDown(index, e) {}
    const _handleEnterDown = handleNewTaskAtEnterDown({ stacks, selectedSprint, setNewTaskRequest })

    function handleChangeNewTaskText(e, index) {
        setStacks(prev => {
            const next = prev.map(v => Object.assign({}, v));

            next[index].newTaskText = e.target.value;

            return next;
        })
    }

    function handleOnClickDelete(e, index_column, index_task) {
        console.log('clicked on delete')
        setDeleteTaskRequest({
            index_column,
            index_task,
            taskId: stacks[index_column].tasks[index_task].id
        })
    }

    function handleDragStart(e) {
        console.log('drag start', e)
    }

    function handleChangeSprint(event) {
        setSelectedSprint((prev) => {
            const newState = Object.assign({}, prev);

            newState.index = event.target.value;

            return newState;
        })
    }

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={_handleDragEnd}>
            <main>
                <label htmlFor="sprint-selector">Sprint: </label>
                <select id="sprint-selector" value={selectedSprint.index} onChange={handleChangeSprint}>
                    { selectedSprint.sprints.map((v, i) => (<option key={v.id} value={i}>{v.title}</option>))}
                </select>

                <div className={styles.grid} style={{ 'display' : (selectedSprint.index === -1) ? 'none' : undefined }}>
                    {
                        stacks.map((obj, index) => (
                            <Droppable id={obj.key} key={obj.key} title={obj.title}
                                onChangeNewTaskText={(e) => handleChangeNewTaskText(e, index)}
                                onKeyDownNewTask={(e) => _handleEnterDown(index, e)} newTaskText={obj.newTaskText}>
                                { obj.tasks.map((v, i) => (
                                    <Draggable onClickDelete={(e) => handleOnClickDelete(e, index, i)}
                                        key={`${i}-${obj.key}`}
                                        id={`${i}-${obj.key}`} v={v}
                                        isDone={obj.isColumnDone}
                                        >
                                        </Draggable>))}
                            </Droppable>
                        ))
                    }
                </div>
            </main>
        </DndContext>
    );
}