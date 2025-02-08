import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

const PORT = 3001

const todoLists = {
  '0000000001': {
    id: '0000000001',
    title: 'First List',
    todos: [],
  },
  '0000000002': {
    id: '0000000002',
    title: 'Second List',
    todos: [],
  },
}

// Get all todo lists
app.get('/todo-lists', (req, res) => {
  res.json(todoLists)
})

// Add a new todo to the list with the given id
app.post('/todo-lists/:id/todos', (req, res) => {
  const { id } = req.params
  const { todo } = req.body
  if (todoLists[id]) {
    todoLists[id].todos.push(todo)
    res.status(201).json(todoLists[id])
  } else {
    res.status(404).send('Todo list not found')
  }
})

// Delete the todo at the given index from the list with the given id
app.delete('/todo-lists/:id/todos/:index', (req, res) => {
  const { id } = req.params
  const index = parseInt(req.params.index, 10)
  if (todoLists[id] && typeof todoLists[id].todos[index] !== 'undefined') {
    todoLists[id].todos.splice(index, 1)
    res.status(200).json(todoLists[id])
  } else {
    res.status(404).send('Todo or todo list not found')
  }
})

// Update (save) a todo list with the given id
app.put('/todo-lists/:id', (req, res) => {
  const { id } = req.params
  const { todos } = req.body
  if (todoLists[id]) {
    todoLists[id].todos = todos
    res.status(200).json(todoLists[id])
  } else {
    res.status(404).send('Todo list not found')
  }
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
