const API_BASE_URL = 'http://localhost:3012/api/v1';

export async function fetchTasks() {
    const response = await fetch(API_BASE_URL + '/tasks');
    const result = await response.json();
    const stacksIndexes = {};
    const stacks = result.columns.map((v, index) => {
        stacksIndexes[v.id] = index;

        return {
            tasks: [],
            id: v.id,
            title: v.title,
            key: v.id + v.title.toLowerCase().replace(/\s+/g, ''),
            newTaskText: ''
        };
    });

    result.tasks.forEach(element => {
        const index = stacksIndexes[element.columnId];

        stacks[index].tasks.push({
            title: element.title,
            id: element.id,
        })
    });

    return stacks;
}

export async function moveTask(body) {
    const response = await fetch(API_BASE_URL + '/tasks/move', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const result = await response.json();

    if (response.status !== 200 ){
        throw new Error(result);
    }  
}

export async function newTask(body) {
    const response = await fetch(API_BASE_URL + '/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const result = await response.json();

    if (response.status !== 200 ){
        throw new Error(result);
    }

    return result;
}