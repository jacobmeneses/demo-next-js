'use client';

import React, { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { DndContext, useDroppable, useDraggable } from '@dnd-kit/core';

function Draggable(props) {
    const { id, v } = props;
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: id,
    });
    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
      <div key={id} ref={setNodeRef} className={styles.task} style={style} {...listeners} {...attributes}><p key={id}>{v.title}</p></div>
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

    useEffect(() => {
        return async () => {
            const response = await fetch('http://localhost:3012/api/v1/tasks');
            const result = await response.json();
            const stacksIndexes = {};
            const stacks = result.columns.map((v, index) => {
                stacksIndexes[v.id] = index;

                return {
                    tasks: [],
                    title: v.title,
                    key: v.id + v.title.toLowerCase().replace(/\s+/g, ''),
                    newTaskText: ''
                };
            });
            result.tasks.forEach(element => {
                const index = stacksIndexes[element.columnId];

                stacks[index].tasks.push({
                    title: element.title,
                })
            });

            setStacks(stacks);
        };
    }, [])

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
        }, [])
    }

    function handleEnterDown(index, e) {
        if ( e.key === 'Enter' ) {
            setStacks(prev => {
                if ( prev[index].newTaskText.length === 0 ) {
                    return prev;
                }

                const next = prev.map(v => Object.assign({}, v));
                const newTaskTitle = next[index].newTaskText;

                next[index].newTaskText = '';

                const previous_tasks = next[index].tasks.map(v => Object.assign({}, v));

                previous_tasks.unshift({ title: newTaskTitle });

                next[index].tasks = previous_tasks;

                return next;
            }, [])
        }
    }

    function handleChangeNewTaskText(e, index) {
        setStacks(prev => {
            const next = prev.map(v => Object.assign({}, v));

            next[index].newTaskText = e.target.value;

            return next;
        }, [])
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <main>
                <div className={styles.grid}>
                    {
                        stacks.map((obj, index) => (
                            <Droppable id={obj.key} key={obj.key} title={obj.title}
                                onChangeNewTaskText={(e) => handleChangeNewTaskText(e, index)}
                                onKeyDownNewTask={(e) => handleEnterDown(index, e)} newTaskText={obj.newTaskText}>
                                { obj.tasks.map((v, i) => (<Draggable key={`${i}-${obj.key}`} id={`${i}-${obj.key}`} v={v}></Draggable>))}
                            </Droppable>
                        ))
                    }
                </div>
            </main>
        </DndContext>
    );
}