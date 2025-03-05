import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LucideCheck, 
  LucideTrash, 
  LucidePlus, 
  LucideX, 
  LucideEdit3,
  LucideSun,
  LucideMoon,
  LucideCheckCircle2,
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
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [theme, setTheme] = useState<Theme>('light')
  const [isInputFocused, setIsInputFocused] = useState(false)
  
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
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
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
  }).sort((a, b) => {
    // Sort by completion status first, then by creation time (newest first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return b.createdAt - a.createdAt
  })

  // Count remaining active todos
  const activeTodoCount = todos.filter(todo => !todo.completed).length
  const completedTodoCount = todos.filter(todo => todo.completed).length

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800",
      "flex flex-col items-center justify-center p-4"
    )}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "max-w-md w-full rounded-xl shadow-lg overflow-hidden",
          "bg-white dark:bg-slate-800",
          "transition-colors duration-300"
        )}
      >
        {/* Header */}
        <div className={cn(
          "bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700",
          "p-6 text-white relative"
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
          
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "flex items-center justify-center rounded-full w-8 h-8",
              "bg-white/20 text-white"
            )}>
              {activeTodoCount}
            </div>
            <span className="text-sm font-medium">active tasks</span>
            
            {completedTodoCount > 0 && (
              <>
                <div className="w-px h-4 bg-white/30 mx-1"></div>
                <div className={cn(
                  "flex items-center justify-center rounded-full w-8 h-8",
                  "bg-white/20 text-white"
                )}>
                  {completedTodoCount}
                </div>
                <span className="text-sm font-medium">completed</span>
              </>
            )}
          </div>
          
          {/* Add Todo Form */}
          <div className={cn(
            "relative mt-4 transition-all duration-300 ease-in-out",
            "rounded-lg overflow-hidden",
            isInputFocused ? "ring-2 ring-white/50" : ""
          )}>
            <input
              ref={inputRef}
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Add a new task..."
              className={cn(
                "w-full px-4 py-3 pr-12",
                "text-slate-800 placeholder:text-slate-400",
                "border-none outline-none"
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
        <div className={cn(
          "flex border-b dark:border-slate-700",
          "transition-colors duration-300"
        )}>
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
                <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                  {todos.length}
                </span>
              )}
              {filterType === 'active' && activeTodoCount > 0 && (
                <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                  {activeTodoCount}
                </span>
              )}
              {filterType === 'completed' && completedTodoCount > 0 && (
                <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                  {completedTodoCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className={cn(
          "max-h-[350px] overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600",
          "scrollbar-track-transparent"
        )}>
          <AnimatePresence>
            {filteredTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex flex-col items-center justify-center py-12 px-4",
                  "text-slate-400 dark:text-slate-500"
                )}
              >
                {filter === 'all' ? (
                  <>
                    <LucideListTodo className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-center">Your task list is empty. Add your first task!</p>
                  </>
                ) : filter === 'active' ? (
                  <>
                    <LucideCheckCircle2 className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-center">No active tasks. Great job!</p>
                  </>
                ) : (
                  <>
                    <LucideCheckCircle2 className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-center">No completed tasks yet.</p>
                  </>
                )}
              </motion.div>
            ) : (
              <ul className="py-2">
                {filteredTodos.map(todo => (
                  <motion.li
                    key={todo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.2 }}
                    layout
                    className={cn(
                      "px-4 py-3 group",
                      "border-b last:border-b-0 dark:border-slate-700",
                      "transition-colors duration-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleTodo(todo.id)}
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                          "transition-colors duration-200",
                          todo.completed 
                            ? "bg-green-500 text-white" 
                            : "border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400"
                        )}
                      >
                        {todo.completed && <LucideCheck size={14} />}
                      </motion.button>
                      
                      {editingId === todo.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            className={cn(
                              "flex-1 px-2 py-1 rounded",
                              "border border-slate-300 dark:border-slate-600",
                              "bg-white dark:bg-slate-700",
                              "text-slate-800 dark:text-slate-200",
                              "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                            )}
                          />
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={saveEdit}
                            className="p-1 text-green-500 hover:text-green-600 dark:hover:text-green-400"
                          >
                            <LucideCheck size={18} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={cancelEdit}
                            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          >
                            <LucideX size={18} />
                          </motion.button>
                        </div>
                      ) : (
                        <>
                          <span 
                            className={cn(
                              "flex-1 transition-all duration-200",
                              todo.completed 
                                ? "text-slate-400 dark:text-slate-500 line-through" 
                                : "text-slate-700 dark:text-slate-200"
                            )}
                          >
                            {todo.text}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => startEditing(todo)}
                              className="p-1 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
                            >
                              <LucideEdit3 size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteTodo(todo.id)}
                              className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                              <LucideTrash size={16} />
                            </motion.button>
                          </div>
                        </>
                      )}
                    </div>
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
            "bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700",
            "text-slate-500 dark:text-slate-400",
            "flex justify-between items-center",
            "transition-colors duration-300"
          )}>
            <span>
              {activeTodoCount} task{activeTodoCount !== 1 ? 's' : ''} left
            </span>
            {completedTodoCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTodos(todos.filter(todo => !todo.completed))}
                className="text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors text-xs font-medium"
              >
                Clear completed
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
      
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-slate-500 dark:text-slate-400 text-sm text-center"
      >
        <p>Double-click or use the edit button to edit a task</p>
        <p className="mt-1 text-xs opacity-70">Your tasks are saved locally</p>
      </motion.footer>
    </div>
  )
}

export default App