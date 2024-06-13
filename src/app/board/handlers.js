
export function handleDragEnd({ stacks, setStacks, setUpdating }) {
    return (e) => {
        const { active, over } = e;
        const id_splitted = active.id.split('-');
        const source = id_splitted[1];
        const index = parseInt(id_splitted[0], 10);

        if ( !over ) {
            return;
        } 

        const source_index = stacks.findIndex((x) => {
            return x.key === source;
        });
        const target_index = stacks.findIndex((x) => {
            return x.key === over.id;
        });

        // console.log(over.id, target_index, source, source_index, index);
        /*const body = {
            taskId: stacks[source_index].tasks[index].id,
            columnId: stacks[target_index].id,
        };*/

        // console.log('body = ', body);
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
            // console.log(item)

            return next;
        })
    }
}

export function handleNewTaskAtEnterDown({ stacks, selectedSprint, setNewTaskRequest}) {
    return (index, e) => {
        if ( e.key === 'Enter' ) {
            // console.log('hola', index, stacks[index].newTaskText )

            setNewTaskRequest(prev => {
                if ( stacks[index].newTaskText.length === 0 ) {
                    return prev;
                }

                const next = Object.assign({}, prev);

                next.index = index;
                next.task = {
                    title: stacks[index].newTaskText,
                    columnId: stacks[index].id,
                    sprintId: selectedSprint.sprints[selectedSprint.index].id,
                };

                return next;
            })
        }
    };
}