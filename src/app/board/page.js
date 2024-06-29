'use client';

import React, { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { DndContext } from '@dnd-kit/core';
import { Draggable, Droppable } from './components';
import { getAllSprints, changeSelectedSprint, moveTask, createNewTask, deleteTask } from './logic';
import { getSettings, postSettings, getSprints } from './fetchTasks';
import { handleDragEnd, handleNewTaskAtEnterDown } from './handlers';
import { create } from 'zustand'
import { DefaultBoardSettings, BoardSettingsKey } from '../constants';

const useStore = create((set) => ({
    settings: {},
    firstFetch: null,

    updateSettings: (newSettings, firstFetch) => set({
        settings: newSettings,
        firstFetch
    }),
}));

export default function Board() {
    const settings = useStore((state) => state.settings);
    const firstFetch = useStore((state) => state.firstFetch);

    const updateSettings = useStore(state => state.updateSettings);
    const [ sprints, setSprints ] = useState([])

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
        const fn = async () => {
            try {
                const result = await getSettings({ key: BoardSettingsKey });

                updateSettings(result.settings, true);
            } catch (e) {
                console.log(e);
                updateSettings({}, true)
            }
        };

        fn();
    }, [])

    useEffect(() => {
        const fn = async () => {
            try {
                const body = await getSprints();

                setSprints(body.sprints);
            } catch (e) {
                console.log(e);
            }
        };

        fn();  
    }, [])

    
    useEffect(() => {
        const fn = async () => {
            let _selectedSprintId;

            if ( settings.sprintId ) {
                _selectedSprintId = settings.sprintId;
            } else {
                _selectedSprintId = sprints[0].id;
            }

            const index = sprints.findIndex((v) => v.id === _selectedSprintId);

            const new_settings = { 
                sprintId: settings.sprintId ? settings.sprintId : _selectedSprintId
            };

            setSelectedSprint({
                index,
                sprints,
            })
            if ( settings.sprintId !== new_settings.sprintId ) {
                updateSettings(new_settings, false)
            } 
        };

        if ( firstFetch && sprints.length > 0 ) {            
            fn();
        }
    }, [ settings, sprints ])

    useEffect(() => {
        const fn = async () => {
            try {
                await postSettings({
                    key: BoardSettingsKey,
                    values: settings
                });
            } catch (e) {
                console.log(e);
            }
        };

        if ( settings.sprintId && !firstFetch ) {
            fn();
        }
           
    }, [ settings ]);

    useEffect(() => {
        // fetch the tasks
        changeSelectedSprint({ selectedSprint, settings, updateSettings, setStacks, onError: console.log })
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