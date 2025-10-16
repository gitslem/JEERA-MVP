'use client'

import { useState, useEffect } from 'react';
// NEW: Import from the new library
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusIcon } from '@heroicons/react/24/outline';
import IssueModal from './IssueModal';
import IssueCard from './IssueCard';
import axios from 'axios';

const columns = [
  { id: 'backlog', title: 'Backlog', color: 'gray' },
  { id: 'todo', title: 'To Do', color: 'blue' },
  { id: 'in-progress', title: 'In Progress', color: 'yellow' },
  { id: 'review', title: 'Review', color: 'purple' },
  { id: 'done', title: 'Done', color: 'green' }
];

// UI Improvement: Map colors to Tailwind classes
const colorMap = {
    gray: { bg: 'bg-gray-500', text: 'text-gray-500' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-500' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500' },
    green: { bg: 'bg-green-500', text: 'text-green-500' }
};


export default function KanbanBoard({ project, sprint }) {
  const [issues, setIssues] = useState([]);
  // NEW: State to manage which issue is being viewed/edited
  const [activeIssue, setActiveIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (project) {
        fetchIssues();
    }
  }, [project, sprint]);

  const fetchIssues = async () => {
    try {
      const params = new URLSearchParams();
      params.append('projectId', project._id);
      if (sprint) {
        params.append('sprintId', sprint._id);
      } else {
        // Fetch all non-sprint issues for the backlog view
        params.append('sprintId', 'null');
      }

      const response = await axios.get(`/api/issues?${params}`);
      setIssues(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching issues:', error);
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI update for smooth UX
    const originalIssues = [...issues];
    const movedIssue = issues.find(issue => issue._id === draggableId);
    movedIssue.status = destination.droppableId;
    const updatedIssues = issues.filter(issue => issue._id !== draggableId);
    updatedIssues.splice(destination.index, 0, movedIssue);
    setIssues(updatedIssues);

    // Update backend
    try {
      await axios.patch(`/api/issues/${draggableId}/status`, {
        status: destination.droppableId
      });
    } catch (error) {
      console.error('Error updating issue status:', error);
      // Revert on error
      setIssues(originalIssues);
      alert('Failed to move issue. Please try again.');
    }
  };

  const handleIssueAction = (issue) => {
    // This can be used for creating a new issue (issue is null) or editing an existing one
    if(issue) {
      setIssues(prev => prev.map(i => (i._id === issue._id ? issue : i)));
    } else {
      // This means a new issue was created, so we refetch.
      fetchIssues();
    }
    setActiveIssue(null);
  };

  const handleIssueDeleted = (issueId) => {
    setIssues(issues.filter(issue => issue._id !== issueId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Loading board...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {sprint ? `${sprint.name}` : 'Project Backlog'}
          </h2>
          <p className="text-sm text-gray-600">
            {issues.length} issues
          </p>
        </div>
        <button
          onClick={() => setActiveIssue('new')} // 'new' signifies creating a new issue
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Create Issue
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {columns.map(column => (
            <div key={column.id} className="bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col">
              <div className={`p-3 ${colorMap[column.color].bg} text-white rounded-t-lg flex justify-between items-center`}>
                <h3 className="font-semibold text-sm uppercase tracking-wider">{column.title}</h3>
                <span className="bg-white/30 text-xs font-bold px-2 py-1 rounded-full">
                  {issues.filter(issue => issue.status === column.id).length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 min-h-[200px] flex-grow transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    {issues.filter(issue => issue.status === column.id).map((issue, index) => (
                      <Draggable key={issue._id} draggableId={issue._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3`}
                            // NEW: onClick handler to open the modal
                            onClick={() => setActiveIssue(issue)}
                          >
                            <IssueCard issue={issue} isDragging={snapshot.isDragging} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* NEW: Render the modal when an issue is active */}
      {activeIssue && (
        <IssueModal
          project={project}
          sprint={sprint}
          // If activeIssue is 'new', we pass null to indicate creation mode
          issue={activeIssue === 'new' ? null : activeIssue}
          onClose={() => setActiveIssue(null)}
          onIssueCreated={handleIssueAction}
          onIssueDeleted={handleIssueDeleted}
        />
      )}
    </div>
  );
}