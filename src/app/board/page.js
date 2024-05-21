'use client';

import React, { useState } from 'react';
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
    const { title } = props;
    const {isOver, setNodeRef} = useDroppable({
      id: props.id,
    });
    const style = {
      color: isOver ? 'green' : undefined,
    };

    return (
      <div className={styles.stack} ref={setNodeRef} style={style}>
        <div className={styles.center}><p>{title}</p></div>
        {props.children}
      </div>
    );
  }

export default function Board() {
    const [ stacks, setStacks ] = useState([
        { tasks: [], title: 'Todo', key: 'todo' },
        { tasks: [
            {
                title: 'React',
            },
            {
                title: 'Build',
            },
            {
                title: 'Deploy',
            },
        ], title: 'In progress', key: 'inprogress' },
        { tasks: [], title: 'Done', key: 'done' },
    ])

    function handleDragEnd(event) {
        const { active, over } = event;
        const id_splitted = active.id.split('-');
        const source = id_splitted[1];
        const index = parseInt(id_splitted[0], 10);

        if ( !over ) {
            return;
        } 

        console.log(event);

        let fn, stack, fnrm;

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

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <main>
                <div className={styles.grid}>
                    {
                        stacks.map((obj) => (
                            <Droppable id={obj.key} key={obj.key} title={obj.title}>
                                { obj.tasks.map((v, i) => (<Draggable key={`${i}-${obj.key}`} id={`${i}-${obj.key}`} v={v}></Draggable>))}
                            </Droppable>
                        ))
                    }
                </div>
            </main>
        </DndContext>
    );
}