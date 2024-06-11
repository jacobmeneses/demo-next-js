'use client';

import React, { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { DndContext, useDroppable, useDraggable, useDrag } from '@dnd-kit/core';
import { fetchTasks, moveTask, newTask, deleteTask, getSprints } from './fetchTasks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

function Draggable(props) {
    const { id, v, onClickDelete, isDone } = props;
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: id,
    });
    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
    const isDoneStyle = isDone ? {
        'textDecoration' : 'line-through'
    } : undefined;

    return (
      <div key={id} ref={setNodeRef} className={styles.task} style={style} {...attributes}>
        <FontAwesomeIcon onClick={(e) => {
            e.stopPropagation()
            onClickDelete(e)
        }} className={styles.xmarkIcon} icon={faXmark} />
        <div className={styles.taskInner} >
            <p style={isDoneStyle} {...listeners} key={id}>{v.title}</p>
            </div>
      </div>
    );
}


function Droppable(props) {
    const { title, onKeyDownNewTask, newTaskText, onChangeNewTaskText } = props;
    const { isOver, setNodeRef } = useDroppable({
      id: props.id,
    });
    const style = {
      color: isOver ? 'green' : undefined,
    };

    return (
      <div className={styles.stack} ref={setNodeRef} style={style}>
        <div className={styles.center}><p>{title} {props.children.length}</p></div>
        <div key={props.id+'-add-new'} className={styles.task}>
            <input placeholder='Type new task title and press ENTER' className={styles.newTaskInput} onChange={onChangeNewTaskText} onKeyDown={(e) => onKeyDownNewTask(e)} value={newTaskText} type="text"/></div>
        {props.children}
      </div>
    );
  }

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
        const fn = async() => {
            try {
                const body = await getSprints();

                setSelectedSprint({
                    index: 0,
                    sprints: body.sprints,
                })
            } catch (e) {
                console.log(e);
            }
        };

        fn();
    }, [])

    useEffect(() => {
        if ( selectedSprint.index === -1 ) {
            return;
        }

        const fn = async () => {
            try {
                const stacks = await fetchTasks(selectedSprint.sprints[selectedSprint.index].id);

                setStacks(stacks);
            } catch (e) {
                console.log(JSON.stringify(e))
            }
        };

        fn();
    }, [ selectedSprint ]);

    useEffect(() => {
        const fn =  async () => {
            try {
                if ( updating.columnId !== 0 && updating.taskId !== 0 ){
                    await moveTask(updating);
                }
            } catch {
            }
        };

        fn();
    }, [ updating ] )

    useEffect(() => {
        const fn = async () => {
            try {
                const index = newTaskRequest.index;
                const cond = index !== -1 && newTaskRequest.task !== null;
                console.log('fetch cond = ', cond);
                console.log('new task request = ', newTaskRequest)

                if ( cond ) {
                    const result = await newTask(newTaskRequest.task);
                    console.log('result = ', result);

                    setStacks(prev => {
                        const next = prev.map(v => Object.assign({}, v));

                        next[index].newTaskText = '';

                        const previous_tasks = next[index].tasks.map(v => Object.assign({}, v));

                        previous_tasks.unshift(result.task);

                        next[index].tasks = previous_tasks;

                        return next;
                    })
                } else {
                    console.log('here!')
                }
            } catch (e) {
                console.log(e)
            }
        };

        fn();
    }, [ newTaskRequest ])

    useEffect(() => {
        const fn = async () => {
            try {
                const { index_column, index_task } = deleteTaskRequest;
                const condition = index_column !== -1 && index_task !== -1;
                if ( condition ) {
                    const response = await deleteTask({
                        taskId: stacks[index_column].tasks[index_task].id
                    });

                    setStacks((prev) => {
                        const next = prev.map(v => Object.assign({}, v));

                        const previous_tasks = next[index_column].tasks.map(v => Object.assign({}, v));

                        previous_tasks.splice(index_task, 1);

                        next[index_column].tasks = previous_tasks;

                        return next;
                    })
                }
            } catch (e) {
                console.log(e)
            }
        };

        fn();
    }, [ deleteTaskRequest ])

    function handleDragEnd(event) {
        const { active, over } = event;
        const id_splitted = active.id.split('-');
        const source = id_splitted[1];
        const index = parseInt(id_splitted[0], 10);

        if ( !over ) {
            return;
        } 

        console.log(event);

        const source_index = stacks.findIndex((x) => {
            return x.key === source;
        });
        const target_index = stacks.findIndex((x) => {
            return x.key === over.id;
        });

        console.log(over.id, target_index, source, source_index, index);
        const body = {
            taskId: stacks[source_index].tasks[index].id,
            columnId: stacks[target_index].id,
        };

        console.log('body = ', body);
        setUpdating( prev => {
            return {
                taskId: stacks[source_index].tasks[index].id,
                columnId: stacks[target_index].id,
            };
        })

        setStacks(prev => {
            const next = prev.map(v => Object.assign({}, v));

            const item = Object.assign({}, next[source_index].tasks[index]);
            
            const source_tasks = next[source_index].tasks.map(v => Object.assign({}, v));

            source_tasks.splice(index, 1);
            next[source_index].tasks = source_tasks;
            const target_tasks = next[target_index].tasks.map(v => Object.assign({}, v));

            target_tasks.push(item);
            next[target_index].tasks = target_tasks;
            console.log(item)

            return next;
        })
    }

    function handleEnterDown(index, e) {
        if ( e.key === 'Enter' ) {
            console.log('hola', index, stacks[index].newTaskText )

            setNewTaskRequest(prev => {
                if ( stacks[index].newTaskText.length === 0 ) {
                    return prev;
                }

                const next = Object.assign({}, prev);

                next.index = index;
                next.task = {
                    title: stacks[index].newTaskText,
                    columnId: stacks[index].id,
                };

                return next;
            })
        }
    }

    function handleChangeNewTaskText(e, index) {
        setStacks(prev => {
            const next = prev.map(v => Object.assign({}, v));

            next[index].newTaskText = e.target.value;

            return next;
        })
    }

    function handleOnClickDelete(e, index_column, index_task) {
        console.log('clicked on delete')
        setDeleteTaskRequest({ index_column, index_task})
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
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                                onKeyDownNewTask={(e) => handleEnterDown(index, e)} newTaskText={obj.newTaskText}>
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