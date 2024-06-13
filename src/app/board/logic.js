import {
    getSprints,
    fetchTasks,
    moveTask as postMoveTask,
    newTask,
    deleteTask as doDeleteTask,
} from "./fetchTasks";

export async function getAllSprints({ setSelectedSprint, onError }) {
    try {
        const body = await getSprints();

        setSelectedSprint({
            index: 0,
            sprints: body.sprints,
        })
    } catch (e) {
        if ( onError ){
            onError(e)
        }
    }
}

export async function changeSelectedSprint({ selectedSprint, onError, setStacks}) {
    if ( selectedSprint.index === -1 ) {
        return;
    }

    try {
        const stacks = await fetchTasks(selectedSprint.sprints[selectedSprint.index].id);

        setStacks(stacks);
    } catch (e) {
        if ( onError ) {
            onError(e)
        }
    }
}

export async function moveTask({ updating, onError }) {
    try {
        if ( updating.columnId !== 0 && updating.taskId !== 0 ){
            await postMoveTask(updating);
        }
    } catch (e) {
        if ( onError ){
            onError(e)
        }
    }
}

export async function createNewTask({ newTaskRequest, setStacks, onError }) {
    try {
        const index = newTaskRequest.index;
        const cond = index !== -1 && newTaskRequest.task !== null;

        if ( cond ) {
            const result = await newTask(newTaskRequest.task);

            setStacks(prev => {
                const next = prev.map(v => Object.assign({}, v));

                next[index].newTaskText = '';

                const previous_tasks = next[index].tasks.map(v => Object.assign({}, v));

                previous_tasks.unshift(result.task);

                next[index].tasks = previous_tasks;

                return next;
            })
        } 
    } catch (e) {
        if ( onError ) {
            onError(e)
        }
    }
}

export async function deleteTask({ deleteTaskRequest, setStacks, onError }) {
    try {
        const { index_column, index_task } = deleteTaskRequest;
        const condition = index_column !== -1 && index_task !== -1;
        if ( condition ) {
            const response = await doDeleteTask({
                taskId: deleteTaskRequest.taskId,
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
        if ( onError ) {
            onError(e)
        }
    }
}