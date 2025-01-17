const todoInput = document.getElementById('todo-input');
const mediaInput = document.getElementById('media-input');
const addTodoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
});

const dbRequest = indexedDB.open('PTodoDB', 1);
let db;

dbRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
};

dbRequest.onsuccess = (event) => {
    db = event.target.result;
    loadTodos();
};

function saveTodoToDB(todo) {
    const transaction = db.transaction(['todos'], 'readwrite');
    const store = transaction.objectStore('todos');
    store.add(todo);
}

function loadTodos() {
    const transaction = db.transaction(['todos'], 'readonly');
    const store = transaction.objectStore('todos');
    const request = store.getAll();
    request.onsuccess = () => {
        request.result.forEach(addTodoToDOM);
    };
}

function deleteTodoFromDB(id) {
    const transaction = db.transaction(['todos'], 'readwrite');
    const store = transaction.objectStore('todos');
    store.delete(id);
}

function addTodoToDOM(todo) {
    const li = document.createElement('li');
    li.textContent = todo.text;

    // If the todo contains a media (image/video)
    if (todo.media) {
        const mediaElement = document.createElement(todo.media.type === 'video' ? 'video' : 'img');
        mediaElement.src = todo.media.src;
        mediaElement.alt = 'Uploaded media';
        mediaElement.style.maxWidth = '100px';
        mediaElement.style.marginTop = '10px';
        if (todo.media.type === 'video') {
            mediaElement.controls = true;
        }
        li.appendChild(mediaElement);
    }

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', () => {
        li.remove();
        deleteTodoFromDB(todo.id);
    });

    li.appendChild(deleteButton);
    todoList.appendChild(li);
}

addTodoButton.addEventListener('click', () => {
    const text = todoInput.value.trim();
    const file = mediaInput.files[0];

    if (text || file) {
        const todo = { text };

        // Handle file upload
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                todo.media = {
                    type: file.type.includes('video') ? 'video' : 'image',
                    src: reader.result
                };
                addTodoToDOM(todo);
                saveTodoToDB(todo);
            };
            reader.readAsDataURL(file);
        } else {
            addTodoToDOM(todo);
            saveTodoToDB(todo);
        }

        todoInput.value = '';
        mediaInput.value = '';  // Reset the file input
    }
});
