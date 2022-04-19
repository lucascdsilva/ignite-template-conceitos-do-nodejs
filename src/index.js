const express = require('express');
const cors = require('cors');

const {
  v4: uuidv4
} = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {
    username
  } = request.headers;

  const user = users.find((user) => user.username == username);
  if (!user) {
    return response.status(404).json({
      error: 'user not found'
    });
  }

  request.user = user;
  return next();
}

function checkExistsTask(request, response, next) {
  const {
    todos
  } = request.user;

  const {
    id
  } = request.params;

  const task = todos.find((task) => task.id = id);
  if (!task) {
    return response.status(404).json({
      error: 'task not found'
    });
  }

  request.task = task;
  return next();
}

app.post('/users', (request, response) => {
  const {
    name,
    username
  } = request.body;

  const userAlreadyExist = users.find((user) => user.username == username);
  if (userAlreadyExist) {
    return response.status(400).json({
      error: 'User already exist'
    });
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user);
  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {
    todos
  } = request.user;

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {
    title,
    deadline
  } = request.body;

  const {
    todos
  } = request.user;

  const task = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  todos.push(task);
  return response.status(201).json(task);

});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTask, (request, response) => {
  const {
    task
  } = request;

  const {
    title,
    deadline
  } = request.body;

  Object.assign(task, {
    title,
    deadline: new Date(deadline)
  });
  return response.status(200).json(task);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTask, (request, response) => {
  const {
    task
  } = request;

  Object.assign(task, {
    done: true
  });
  return response.status(200).json(task);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTask, (request, response) => {
  const {
    task,
    user: {
      todos
    }
  } = request;

  todos.splice(todos.indexOf(task), 1);
  return response.status(204).send();
});

module.exports = app;