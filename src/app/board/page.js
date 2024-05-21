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
    const stack_title = 'TO DO';
    const tasks = [
        {
            title: 'React',
        },
        {
            title: 'Build',
        },
        {
            title: 'Deploy',
        },
    ];

    const [ stack1, setStack1 ] = useState([])
    const [ stack2, setStack2 ] = useState([])

    function handleDragEnd(event) {
        const { active, over } = event;
        const id_splitted = active.id.split('-');
        const source = id_splitted[1];
        const index = parseInt(id_splitted[0], 10);

        console.log(event);

        let fn, stack;

        if ( source !== 'middle') {
            console.log('Source not valid for now');
            return;
        }

        const item = tasks[index];

        switch (over.id) {
            case 'droppable': fn = setStack1; stack = stack1; break;
            case 'container': fn = setStack2; stack = stack2; break;
        }

        fn((prev) => {
            const new_list = Object.assign([], prev);

            new_list.push(item);

            return new_list;
        }, [])
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <main>
                <div className={styles.grid}>
                    <Droppable id="droppable" title={stack_title}>
                        { stack1.map((v, i) => (<Draggable key={i + '-stack1'} id={i + '-stack1'} v={v} />)) }
                    </Droppable>

                    <div className={styles.stack}>
                        { tasks.map((v, i) => (<Draggable key={i + '-middle'} id={i + '-middle'} v={v} />)) }
                    </div>

                    <Droppable id="container" title="demo">
                    { stack2.map((v, i) => (<Draggable key={i + '-demo'} id={i + '-demo'} v={v} />)) }
                    </Droppable>
                </div>
            </main>
        </DndContext>
    );
}