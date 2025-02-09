import React, { Fragment, useState, useEffect, useMemo } from 'react'
import { debounce } from 'lodash'
import {
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material'
import ReceiptIcon from '@mui/icons-material/Receipt'
import { TodoListForm } from './TodoListForm'
import { fetchTodoLists, addTodo, deleteTodo, saveTodoList } from '../../api/todos-server-calls'

export const TodoLists = ({ style }) => {
  const [todoLists, setTodoLists] = useState({})
  const [activeList, setActiveList] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTodoLists()
        if (data.error) {
          setError(data.message)
        } else {
          setTodoLists(data)
        }
      } catch (error) {
        setError(error.message)
      }
    }
    fetchData()
  }, [])

  const debouncedSave = useMemo(() =>
      debounce((id, todos) => {
        saveTodoList(id, todos).catch((error) => {
          setError(error.message)
        })
      }, 500), [] // empty array ensures it is created only once
  )

  const updateTodoText = (index, value) => {
    const currentList = todoLists[activeList]
    const updatedTodos = [...currentList.todos]
    updatedTodos[index] = { ...updatedTodos[index], text: value }
    setTodoLists({
      ...todoLists,
      [activeList]: { ...currentList, todos: updatedTodos },
    })
    debouncedSave(activeList, updatedTodos)
  }

  const toggleTodoCompletion = (index) => {
    const currentList = todoLists[activeList]
    const updatedTodos = [...currentList.todos]
    updatedTodos[index] = {
      ...updatedTodos[index],
      completed: !updatedTodos[index].completed,
    }
    setTodoLists({
      ...todoLists,
      [activeList]: { ...currentList, todos: updatedTodos },
    })
    saveTodoList(activeList, updatedTodos).catch((error) => {
      setError(error.message)
    })
  }

  const addTodoHandler = async () => {
    try {
      const todo = { text: "", completed: false }
      const updatedList = await addTodo(activeList, todo)
      if (updatedList.error) {
        setError(updatedList.message)
      } else {
        setTodoLists({
          ...todoLists,
          [activeList]: updatedList,
        })
      }
    } catch (error) {
      setError(error.message)
    }
  }

  const deleteTodoHandler = async (index) => {
    try {
      const updatedList = await deleteTodo(activeList, index)
      if (updatedList.error) {
        setError(updatedList.message)
      } else {
        setTodoLists({
          ...todoLists,
          [activeList]: updatedList,
        })
      }
    } catch (error) {
      setError(error.message)
    }
  }

  if (!Object.keys(todoLists).length) return null
  return (
    <Fragment>
      <Card style={style}>
        <CardContent>
          <Typography component='h2'>My Todo Lists</Typography>
          <List>
            {Object.keys(todoLists).map((key) => {
              const list = todoLists[key]
              const isCompleted =
                list.todos.length > 0 && list.todos.every((todo) => todo.completed)
              return (
                <ListItemButton key={key} onClick={() => setActiveList(key)}>
                  <ListItemIcon>
                    <ReceiptIcon color={isCompleted ? 'success' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText primary={list.title} secondary={isCompleted ? 'Completed' : ''} />
                </ListItemButton>
              )
            })}
          </List>
        </CardContent>
      </Card>
      {todoLists[activeList] && (
        <TodoListForm
          key={activeList} // use key to make React recreate component to reset internal state
          todoList={todoLists[activeList]}
          updateTodoText={updateTodoText}
          toggleTodoCompletion={toggleTodoCompletion}
          addTodo={addTodoHandler}
          deleteTodo={deleteTodoHandler}
        />
      )}
      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Fragment>
  )
}
