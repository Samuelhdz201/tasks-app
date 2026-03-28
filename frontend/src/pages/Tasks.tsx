import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const res = await api.get(`/tasks${params}`);
      setTasks(res.data.tasks);
    } catch {
      navigate('/');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { title, description, status, due_date: dueDate });
      setTitle(''); setDescription(''); setStatus('pending'); setDueDate('');
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error creating task');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      await api.put(`/tasks/${editingTask.id}`, {
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        due_date: editingTask.due_date,
      });
      setEditingTask(null);
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error updating task');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch {
      setError('Error deleting task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const statusColor = (s: string) => {
    if (s === 'done') return 'bg-green-100 text-green-800';
    if (s === 'in_progress') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
            Logout
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Create Task Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">New Task</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3">
            <input
              type="text" placeholder="Title" value={title}
              onChange={e => setTitle(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text" placeholder="Description" value={description}
              onChange={e => setDescription(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit"
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              Add Task
            </button>
          </form>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {['', 'pending', 'in_progress', 'done'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-200'}`}>
              {s === '' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 && (
            <p className="text-center text-gray-500 py-8">No tasks found</p>
          )}
          {tasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-start">
              {editingTask?.id === task.id ? (
                <form onSubmit={handleUpdate} className="flex-1 grid grid-cols-1 gap-2 mr-4">
                  <input value={editingTask.title}
                    onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input value={editingTask.description}
                    onChange={e => setEditingTask({...editingTask, description: e.target.value})}
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select value={editingTask.status}
                    onChange={e => setEditingTask({...editingTask, status: e.target.value})}
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Save</button>
                    <button type="button" onClick={() => setEditingTask(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{task.title}</h3>
                  {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                  {task.due_date && <p className="text-xs text-gray-400 mt-1">Due: {new Date(task.due_date).toLocaleDateString()}</p>}
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${statusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              )}
              {editingTask?.id !== task.id && (
                <div className="flex gap-2 ml-4">
                  <button onClick={() => setEditingTask(task)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded text-sm hover:bg-yellow-500">Edit</button>
                  <button onClick={() => handleDelete(task.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}