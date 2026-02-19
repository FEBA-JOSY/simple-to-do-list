
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, BrainCircuit, Loader2, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from './types';
import { getSmartEncouragement } from './services/gemini';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [motivation, setMotivation] = useState('Get things done with a touch of pink.');
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initial theme detection
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zentask_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Apply theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('zentask_theme', theme);
  }, [theme]);

  // Load tasks from local storage
  useEffect(() => {
    const savedTasks = localStorage.getItem('zentask_tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse saved tasks", e);
      }
    }
  }, []);

  // Save tasks to local storage
  useEffect(() => {
    localStorage.setItem('zentask_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmedValue,
      completed: false,
      createdAt: Date.now(),
    };

    setTasks(prev => [newTask, ...prev]);
    setInputValue('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const askCoach = async () => {
    setIsCoachLoading(true);
    const tip = await getSmartEncouragement(tasks);
    setMotivation(tip);
    setIsCoachLoading(false);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-pink-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <header className="mb-10 relative">
          <div className="absolute right-0 top-0">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-pink-200/50 dark:shadow-none border border-pink-100 dark:border-slate-800 text-pink-600 dark:text-pink-400 hover:text-pink-500 dark:hover:text-pink-300 transition-all active:scale-90"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-center pt-2">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2 tracking-tight"
            >
              My To-Do List
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 group cursor-pointer"
              onClick={askCoach}
            >
              <p className="text-pink-400 dark:text-pink-500/80 italic text-sm max-w-[80%] min-h-[1.25rem]">
                {motivation}
              </p>
              {isCoachLoading ? (
                <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
              ) : (
                <BrainCircuit className="w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </motion.div>
          </div>
        </header>

        {/* Form Container */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-pink-100/50 dark:shadow-none p-6 mb-8 border border-pink-50 dark:border-slate-800 transition-all duration-300">
          <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 bg-pink-50/30 dark:bg-slate-800 border border-transparent focus:border-pink-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-pink-500/10 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-pink-300 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-pink-600 dark:bg-pink-500 hover:bg-pink-700 dark:hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-600/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          </form>

          {/* Stats Bar */}
          {totalCount > 0 && (
            <div className="mt-8 pt-6 border-t border-pink-50 dark:border-slate-800">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{completedCount}</span>
                  <span className="text-pink-400 dark:text-slate-500 text-sm ml-1">/ {totalCount} completed</span>
                </div>
                <span className="text-pink-600 dark:text-pink-400 font-semibold text-sm">{progressPercent}%</span>
              </div>
              <div className="w-full bg-pink-50 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="bg-pink-500 dark:bg-pink-400 h-full rounded-full"
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Task List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-pink-200 dark:text-slate-600"
              >
                <div className="w-16 h-16 bg-pink-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-pink-200 dark:text-slate-700" />
                </div>
                <p>Your list is empty. Start adding tasks!</p>
              </motion.div>
            ) : (
              tasks.map(task => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                    task.completed 
                      ? 'bg-pink-50/20 dark:bg-slate-900/40 border-pink-100/50 dark:border-slate-800' 
                      : 'bg-white dark:bg-slate-900 border-white dark:border-slate-800 shadow-sm hover:shadow-md hover:border-pink-200 dark:hover:border-slate-700'
                  }`}
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`shrink-0 transition-colors ${
                      task.completed ? 'text-pink-500 dark:text-pink-400' : 'text-pink-200 dark:text-slate-700 hover:text-pink-400 dark:hover:text-pink-500'
                    }`}
                  >
                    {task.completed ? (
                      <CheckCircle className="w-6 h-6 fill-pink-50 dark:fill-pink-900/20" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  
                  <span className={`flex-1 text-base transition-all duration-300 ${
                    task.completed ? 'text-pink-300 dark:text-slate-600 line-through font-light' : 'text-slate-700 dark:text-slate-200 font-medium'
                  }`}>
                    {task.text}
                  </span>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-pink-200 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Delete task"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        {totalCount > 0 && (
          <footer className="mt-12 text-center text-pink-300 dark:text-slate-600 text-xs font-medium">
            <p>My To-Do List &copy; {new Date().getFullYear()} • Stay Organized</p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default App;
