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
      processApiResponse(fetchTodoLists(), (lists) => setTodoLists(lists))
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
    const updatedTodos = updateTodoAtIndex(index, (todo) => ({ ...todo, text: value }))
    debouncedSave(activeList, updatedTodos)
  }

  const toggleTodoCompletion = (index) => {
    const updatedTodos = updateTodoAtIndex(index, (todo) => ({
      ...todo,
      completed: !todo.completed,
    }))
    saveTodoList(activeList, updatedTodos).catch((error) => {
      setError(error.message)
    })
  }

  const addTodoHandler = async () => {
    const newTodo = { text: '', completed: false }
    handleUpdatedListApiResponse(addTodo(activeList, newTodo))
  }

  const deleteTodoHandler = async (index) => {
    handleUpdatedListApiResponse(deleteTodo(activeList, index))
  }

  /**
   * Update todo at index in the current active list
   * @param {number} index - index of the todo to update
   * @param {function} updaterFn - function to update the todo
   * @returns {Array} - updated todos
   */
  const updateTodoAtIndex = (index, updaterFn) => {
    const currentTodos = todoLists[activeList].todos
    const updatedTodos = currentTodos.map((todo, idx) => (idx === index ? updaterFn(todo) : todo))
    setTodoLists((prevLists) => {
      const currentList = prevLists[activeList]
      return {
        ...prevLists,
        [activeList]: { ...currentList, todos: updatedTodos },
      }
    })
    return updatedTodos
  }

  /**
   * Update the current active list with the updated list from the API response
   * @param {Promise} apiCallPromise - promise returned from the API call
   * @returns {Promise<void>}
   */
  const handleUpdatedListApiResponse = async (apiCallPromise) => {
    processApiResponse(apiCallPromise, (updatedList) => {
      setTodoLists((prevLists) => ({
        ...prevLists,
        [activeList]: updatedList,
      }))
    })
  }

  /**
   * Process the API response and update the state accordingly
   * @param {Promise} apiCallPromise - promise returned from the API call
   * @param {function} updateStateFn - function to update the state
   * @returns {Promise<void>}
   */
  const processApiResponse = async (apiCallPromise, updateStateFn) => {
    try {
      const result = await apiCallPromise
      if (result.error) {
        setError(result.message)
      } else {
        updateStateFn(result)
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
