'use client'

import { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function IssueModal({ project, sprint, issue, onClose, onIssueCreated, onIssueDeleted }) {
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'task',
    priority: 'medium', assignee: '', reporter: '',
    storyPoints: '', labels: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!issue;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        title: issue.title || '',
        description: issue.description || '',
        type: issue.type || 'task',
        priority: issue.priority || 'medium',
        assignee: issue.assignee || '',
        reporter: issue.reporter || '',
        storyPoints: issue.storyPoints || '',
        labels: issue.labels ? issue.labels.join(', ') : ''
      });
    }
  }, [issue, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const issueData = {
        ...formData,
        projectId: project._id,
        sprintId: sprint?._id || null,
        storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : null,
        labels: formData.labels ? formData.labels.split(',').map(l => l.trim()).filter(l => l) : []
      };

      let response;
      if (isEditing) {
        response = await axios.put(`/api/issues/${issue._id}`, issueData);
      } else {
        response = await axios.post('/api/issues', issueData);
      }
      
      onIssueCreated(isEditing ? response.data : null);
    } catch (err) {
      setError(err.response?.data?.message || `Error ${isEditing ? 'updating' : 'creating'} issue`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await axios.delete(`/api/issues/${issue._id}`);
        onIssueDeleted(issue._id);
        onClose(); 
      } catch (err) {
        setError('Failed to delete issue.');
        console.error('Error deleting issue:', err);
      }
    }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? `Edit Issue` : 'Create Issue'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
          
          {/* Form fields start here */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="story">Story</option>
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="epic">Epic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="lowest">Lowest</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="highest">Highest</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title *</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="What needs to be done?" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe the issue in detail..."></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <input type="text" name="assignee" value={formData.assignee} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reporter *</label>
              <input type="text" name="reporter" required value={formData.reporter} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jane Smith" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
            <input type="number" name="storyPoints" min="0" value={formData.storyPoints} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1, 2, 3, 5, 8..." />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
            <input type="text" name="labels" value={formData.labels} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="frontend, urgent (comma-separated)" />
          </div>
          {/* Form fields end here */}
          
          <div className="flex justify-between items-center pt-4">
            <div>
              {isEditing && (
                <button type="button" onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : (isEditing ? 'Update Issue' : 'Create Issue')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}