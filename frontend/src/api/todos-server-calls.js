import { SERVER_URL } from '../config';

/**
 * Fetch all todo lists
 * @returns {Promise<Object>} A promise that resolves to an object with todo lists
 */
export const fetchTodoLists = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/todo-lists`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * Add a new todo to the list with the given id
 * @param {string} listId The id of the list to add the todo to
 * @param {string} todo The todo to add
 * @returns {Promise<Object>} A promise that resolves to an object with the updated todo list
 */
export const addTodo = async (listId, todo) => {
  try {
    const response = await fetch(`${SERVER_URL}/todo-lists/${listId}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todo }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * Delete the todo at the given index from the list with the given id
 * @param {string} listId The id of the list to delete the todo from
 * @param {number} index The index of the todo to delete
 * @returns {Promise<Object>} A promise that resolves to an object with the updated todo list
 */
export const deleteTodo = async (listId, index) => {
  try {
    const response = await fetch(`${SERVER_URL}/todo-lists/${listId}/todos/${index}`, {
      method: 'DELETE',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * Update (save) a todo list with the given id
 * @param {string} listId The id of the list to update
 * @param {Array<string>} todos The updated todos
 * @returns {Promise<Object>} A promise that resolves to an object with the updated todo list
 */
export const saveTodoList = async (listId, todos) => {
  try {
    const response = await fetch(`${SERVER_URL}/todo-lists/${listId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todos }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * Handle an HTTP response.
 * @param {Response} response The fetch Response object
 * @returns {Promise<Object>} The parsed JSON if response is OK
 * @throws {Error} With a descriptive error message if response is not OK
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    // Default error message from status code and text
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      // Try to extract more details from the JSON response if available.
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMsg = errorData.message;
      }
    } catch (jsonError) {
      // If the error body is not JSON, log the error.
      console.error('Error parsing JSON response:', jsonError);
    }
    return { error: true, message: errorMsg };
  }
  return response.json();
}