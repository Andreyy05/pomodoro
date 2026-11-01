import React, { useState } from 'react';
import { Plus, Check, Trash2, Target, CheckCircle2, ListTodo } from 'lucide-react';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (title: string, targetPomodoros: number) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSelectActiveTask: (id: string) => void;
  onClearCompleted: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onSelectActiveTask,
  onClearCompleted,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [targetPomos, setTargetPomos] = useState(2);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), targetPomos);
    setNewTitle('');
    setTargetPomos(2);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalPomosCompleted = tasks.reduce((acc, t) => acc + t.pomodorosCompleted, 0);

  return (
    <div className="tasklist-container glass-card">
      <div className="tasklist-header">
        <div className="tasklist-title">
          <ListTodo size={22} className="accent-icon" />
          <h3>Focus Tasks</h3>
          <span className="task-count-pill">{tasks.length}</span>
        </div>
        <div className="task-stats-pill">
          <span>🍅 {totalPomosCompleted} completed</span>
        </div>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleSubmit} className="task-form">
        <div className="task-input-row">
          <input
            type="text"
            className="task-input"
            placeholder="What are you working on next?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            maxLength={100}
          />
          <div className="pomo-stepper">
            <label htmlFor="pomo-count" title="Estimated Pomodoros">🍅</label>
            <input
              id="pomo-count"
              type="number"
              min="1"
              max="16"
              value={targetPomos}
              onChange={(e) => setTargetPomos(Math.max(1, parseInt(e.target.value) || 1))}
              className="pomo-input"
            />
          </div>
          <button type="submit" className="btn-add-task" disabled={!newTitle.trim()}>
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="task-filters">
        <div className="filter-group">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {completedCount > 0 && (
          <button className="btn-clear-completed" onClick={onClearCompleted}>
            Clear completed ({completedCount})
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="tasks-scroll-list">
        {filteredTasks.length === 0 ? (
          <div className="tasks-empty">
            <span className="empty-emoji">📝</span>
            <p>
              {filter === 'completed'
                ? 'No completed tasks yet. Keep focusing!'
                : filter === 'active'
                ? 'No active tasks. Add one above!'
                : 'Your task list is empty. Add a task to focus on!'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isActive = task.id === activeTaskId;
            return (
              <div
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''} ${
                  isActive ? 'active-target' : ''
                }`}
              >
                <button
                  className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                  onClick={() => onToggleTask(task.id)}
                  title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && <Check size={14} />}
                </button>

                <div className="task-content" onClick={() => onSelectActiveTask(task.id)}>
                  <div className="task-title-row">
                    <span className="task-title">{task.title}</span>
                    {isActive && <span className="active-badge">Active</span>}
                  </div>
                  <div className="task-meta">
                    <span className="task-pomo-counter">
                      🍅 {task.pomodorosCompleted} / {task.pomodorosTarget}
                    </span>
                    {task.completed && (
                      <span className="task-completed-label">
                        <CheckCircle2 size={12} /> Finished
                      </span>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  {!task.completed && (
                    <button
                      className={`btn-task-action ${isActive ? 'btn-active-pin' : ''}`}
                      onClick={() => onSelectActiveTask(task.id)}
                      title={isActive ? 'Currently focused' : 'Set as focus target'}
                    >
                      <Target size={16} />
                    </button>
                  )}
                  <button
                    className="btn-task-action btn-delete"
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
