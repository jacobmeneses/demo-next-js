import { ApiBaseUrl, keyTokenLocalStorage } from '../constants';


export async function fetchTasks() {
    const _token = localStorage.getItem(keyTokenLocalStorage);

    const response = await fetch(ApiBaseUrl + '/tasks', {
        headers: {
            'Authorization': `bearer ${_token}`
        }
    });
    const result = await response.json();
    
    if (response.status !== 200 ){
        throw new Error(result);
    }  

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
    const _token = localStorage.getItem(keyTokenLocalStorage);

    const response = await fetch(ApiBaseUrl + '/tasks/move', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `bearer ${_token}`
        },
        body: JSON.stringify(body),
    });
    const result = await response.json();

    if (response.status !== 200 ){
        throw new Error(result);
    }  
}

export async function newTask(body) {
    const _token = localStorage.getItem(keyTokenLocalStorage);

    const response = await fetch(ApiBaseUrl + '/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `bearer ${_token}`
        },
        body: JSON.stringify(body),
    });
    const result = await response.json();

    if (response.status !== 200 ){
        throw new Error(result);
    }

    return result;
}

export async function deleteTask(request) {
    const _token = localStorage.getItem(keyTokenLocalStorage);

    const response = await fetch(ApiBaseUrl + '/tasks/' + request.taskId, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `bearer ${_token}`
        }
    });
    const result = await response.json();

    if (response.status !== 200 ){
        throw new Error(result);
    }

    return result;
}