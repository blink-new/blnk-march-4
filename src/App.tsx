import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LucideCheck, 
  LucideTrash, 
  LucidePlus, 
  LucideEdit3,
  LucideMoon,
  LucideSun,
  LucideListTodo
} from 'lucide-react'
import { cn } from './lib/utils'

// Define the Todo type
type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

// Filter types
type FilterType = 'all' | 'active' | 'completed'

// Theme types
type Theme = 'light' | 'dark'

function App() {
  // State for todos and new todo input
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState<FilterType>('active')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [theme, setTheme] = useState<Theme>('dark')
  
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Load todos and theme from localStorage on initial render
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
    
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])
  
  // Update theme in localStorage and apply it to document
  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  
  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  // Add a new todo
  const addTodo = () => {
    if (newTodo.trim() !== '') {
      const newTodoItem: Todo = {
        id: crypto.randomUUID(),
        text: newTodo.trim(),
        completed: false,
        createdAt: Date.now()
      }
      setTodos([...todos, newTodoItem])
      setNewTodo('')
      inputRef.current?.focus()
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

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
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
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      "bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100",
      "transition-colors duration-300"
    )}>
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "overflow-hidden rounded-2xl shadow-lg",
            "bg-white dark:bg-slate-900",
            "transition-colors duration-300"
          )}
        >
          {/* Header */}
          <div className={cn(
            "bg-gradient-to-r from-blue-500 to-indigo-600",
            "p-6 text-white"
          )}>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <LucideListTodo className="h-6 w-6" />
                <span>TaskMaster</span>
              </h1>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <LucideMoon size={18} /> : <LucideSun size={18} />}
              </motion.button>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center rounded-full w-8 h-8 bg-white/20 text-white">
                {activeTodoCount}
              </div>
              <span className="text-sm font-medium">active tasks</span>
            </div>
            
            {/* Add Todo Form */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Add a new task..."
                className={cn(
                  "w-full px-4 py-3 pr-12 rounded-full",
                  "text-slate-800 placeholder:text-slate-400",
                  "border-none outline-none focus:ring-2 focus:ring-white/30",
                  "transition-all duration-200"
                )}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={addTodo}
                disabled={newTodo.trim() === ''}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2",
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "bg-blue-500 text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors hover:bg-blue-600"
                )}
              >
                <LucidePlus size={18} />
              </motion.button>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex border-b dark:border-slate-800">
            {(['all', 'active', 'completed'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-medium transition-all",
                  filter === filterType 
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" 
                    : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                {filterType === 'all' && todos.length > 0 && (
                  <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                    {todos.length}
                  </span>
                )}
                {filterType === 'active' && activeTodoCount > 0 && (
                  <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                    {activeTodoCount}
                  </span>
                )}
                {filterType === 'completed' && (todos.length - activeTodoCount) > 0 && (
                  <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                    {todos.length - activeTodoCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Todo List */}
          <div className="max-h-[350px] overflow-y-auto">
            <AnimatePresence>
              {filteredTodos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 px-4 text-slate-400 dark:text-slate-500"
                >
                  <p className="text-center">
                    {filter === 'all' 
                      ? "Your task list is empty" 
                      : filter === 'active' 
                        ? "No active tasks" 
                        : "No completed tasks"}
                  </p>
                </motion.div>
              ) : (
                <ul>
                  {filteredTodos.map(todo => (
                    <motion.li
                      key={todo.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "border-b dark:border-slate-800 last:border-b-0",
                        "transition-colors duration-300"
                      )}
                    >
                      {editingId === todo.id ? (
                        <div className="p-4 flex items-center gap-2">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            className={cn(
                              "flex-1 px-3 py-2 rounded",
                              "bg-slate-100 dark:bg-slate-800",
                              "text-slate-800 dark:text-slate-200",
                              "border-none outline-none focus:ring-2 focus:ring-blue-500"
                            )}
                          />
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={saveEdit}
                            className="p-2 text-green-500"
                          >
                            <LucideCheck size={18} />
                          </motion.button>
                        </div>
                      ) : (
                        <div className="p-4 flex items-center gap-3 group">
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className={cn(
                              "w-6 h-6 rounded-full flex-shrink-0",
                              "border border-slate-300 dark:border-slate-700",
                              "transition-colors duration-200",
                              todo.completed && "bg-blue-500 border-blue-500"
                            )}
                          >
                            {todo.completed && <LucideCheck className="w-4 h-4 text-white" />}
                          </button>
                          
                          <span 
                            className={cn(
                              "flex-1 transition-all duration-200",
                              todo.completed && "text-slate-400 dark:text-slate-600 line-through"
                            )}
                            onDoubleClick={() => startEditing(todo)}
                          >
                            {todo.text}
                          </span>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => startEditing(todo)}
                              className="p-1 text-slate-400 hover:text-blue-500"
                            >
                              <LucideEdit3 size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteTodo(todo.id)}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <LucideTrash size={16} />
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {todos.length > 0 && (
            <div className={cn(
              "px-4 py-3 text-sm border-t",
              "bg-slate-50 dark:bg-slate-900 dark:border-slate-800",
              "text-slate-500 dark:text-slate-400",
              "transition-colors duration-300"
            )}>
              {activeTodoCount} tasks left
            </div>
          )}
        </motion.div>
        
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center text-slate-500 dark:text-slate-400 text-sm"
        >
          <p>Double-click or use the edit button to edit a task</p>
          <p className="mt-1 text-xs opacity-70">Your tasks are saved locally</p>
        </motion.footer>
      </div>
    </div>
  )
}

export default App