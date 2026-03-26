import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Navbar from './components/Navbar';
import { getTasks, createTask, updateTask, deleteTask } from './api/tasks';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await createTask(taskData);
      setTasks([response.data, ...tasks]);
      toast.success('Tâche créée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      const response = await updateTask(id, taskData);
      setTasks(tasks.map(task => task.id === id ? response.data : task));
      setEditingTask(null);
      toast.success('Tâche mise à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Supprimer cette tâche ?')) {
      try {
        await deleteTask(id);
        setTasks(tasks.filter(task => task.id !== id));
        toast.success('Tâche supprimée');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="App">
      <Toaster position="top-right" />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TaskForm
              onSubmit={editingTask ? 
                (data) => handleUpdateTask(editingTask.id, data) : 
                handleCreateTask}
              initialData={editingTask}
              onCancel={() => setEditingTask(null)}
            />
          </div>
          <div className="lg:col-span-2">
            <TaskList
              tasks={tasks}
              loading={loading}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;