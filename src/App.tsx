import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LucideCheck, LucideTrash, LucidePlus, LucideX } from 'lucide-react'
import { cn } from './lib/utils'

// Define the Todo type
type Todo = {
  id: string
  text: string
  completed: boolean
}

// Filter types
type FilterType = 'all' | 'active' | 'completed'

function App() {
  // State for todos and new todo input
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  // Load todos from localStorage on initial render
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // Add a new todo
  const addTodo = () => {
    if (newTodo.trim() !== '') {
      const newTodoItem: Todo = {
        id: crypto.randomUUID(),
        text: newTodo.trim(),
        completed: false
      }
      setTodos([...todos, newTodoItem])
      setNewTodo('')
    }
  }

  // Toggle todo completion status
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  // Delete a todo
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  // Start editing a todo
  const startEditing = (todo: Todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  // Save edited todo
  const saveEdit = () => {
    if (editingId && editText.trim() !== '') {
      setTodos(
        todos.map(todo => 
          todo.id === editingId ? { ...todo, text: editText.trim() } : todo
        )
      )
      setEditingId(null)
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
  }

  // Filter todos based on current filter
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  // Count remaining active todos
  const activeTodoCount = todos.filter(todo => !todo.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-6"
      >
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary-700">
            Todo List
          </h1>
          <motion.div 
            className="mt-1 text-secondary-500 text-sm"
            whileHover={{ scale: 1.05 }}
          >
            <span>Stay organized, get things done</span>
          </motion.div>
        </header>

        {/* Add Todo Form */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-2 rounded-md border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addTodo}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <LucidePlus size={20} />
            </motion.button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex mb-4 border-b border-secondary-200">
          {(['all', 'active', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-medium transition-colors",
                filter === filterType 
                  ? "text-primary-600 border-b-2 border-primary-600" 
                  : "text-secondary-500 hover:text-primary-600"
              )}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {filteredTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6 text-secondary-400"
              >
                {filter === 'all' 
                  ? "Add your first todo!" 
                  : filter === 'active' 
                    ? "No active todos" 
                    : "No completed todos"}
              </motion.div>
            ) : (
              filteredTodos.map(todo => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  layout
                  className="bg-white border border-secondary-200 rounded-lg p-3 flex items-center gap-3 group"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                      todo.completed 
                        ? "bg-primary-600 text-white" 
                        : "border-2 border-secondary-300 hover:border-primary-500"
                    )}
                  >
                    {todo.completed && <LucideCheck size={14} />}
                  </button>
                  
                  {editingId === todo.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                        className="flex-1 px-2 py-1 rounded border border-secondary-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button 
                        onClick={saveEdit}
                        className="p-1 text-primary-600 hover:text-primary-800"
                      >
                        <LucideCheck size={18} />
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="p-1 text-secondary-500 hover:text-secondary-700"
                      >
                        <LucideX size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span 
                        className={cn(
                          "flex-1",
                          todo.completed && "text-secondary-400 line-through"
                        )}
                        onDoubleClick={() => startEditing(todo)}
                      >
                        {todo.text}
                      </span>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-secondary-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <LucideTrash size={18} />
                      </button>
                    </>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="text-sm text-secondary-500 flex justify-between items-center">
            <span>{activeTodoCount} item{activeTodoCount !== 1 ? 's' : ''} left</span>
            {todos.some(todo => todo.completed) && (
              <button
                onClick={() => setTodos(todos.filter(todo => !todo.completed))}
                className="text-secondary-500 hover:text-primary-600 transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>
        )}
      </motion.div>
      
      <footer className="mt-8 text-secondary-500 text-sm">
        <p>Double-click to edit a todo</p>
      </footer>
    </div>
  )
}

export default App