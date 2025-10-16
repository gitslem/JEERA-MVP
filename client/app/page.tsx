'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import axios from 'axios';


import { 
  PlusIcon, 
  FolderIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

import ProjectModal from '../components/ProjectModal';
import SprintModal from '../components/SprintModal';
import KanbanBoard from '../components/KanbanBoard';
import { useTheme } from './context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'; 

function AppLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-lg text-gray-600 animate-pulse">Loading Your Workspace...</div>
    </div>
  );
}

export default function Home() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  

  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (selectedProject) {
      fetchSprints(selectedProject._id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/api/projects');
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0]);
      }
      setDataLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setDataLoading(false);
    }
  };

  const fetchSprints = async (projectId) => {
    try {
      const { data } = await axios.get(`/api/sprints?projectId=${projectId}`);
      setSprints(data);
      // Set selected sprint to null initially to show backlog, unless there's only one sprint
      setSelectedSprint(null);
    } catch (error) {
      console.error('Error fetching sprints:', error);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
    setShowProjectModal(false);
  };

  const handleSprintCreated = (newSprint) => {
    setSprints([newSprint, ...sprints]);
    setSelectedSprint(newSprint);
    setShowSprintModal(false);
  };
  
  if (authLoading || !isAuthenticated) {
    return <AppLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                {/* --- LEFT SIDE OF HEADER --- */}
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900">JIRA MVP</h1>
                    <Link href="/analytics" className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                        <ChartBarIcon className="h-5 w-5" />
                        <span>Analytics</span>
                    </Link>
                    
                    {/* Project Selector */}
                    {projects.length > 0 && (
                        <div className="flex items-center space-x-2">
                            <FolderIcon className="h-5 w-5 text-gray-400" />
                            <select
                                value={selectedProject?._id || ''}
                                onChange={(e) => {
                                    const project = projects.find(p => p._id === e.target.value);
                                    setSelectedProject(project);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {projects.map(project => (
                                <option key={project._id} value={project._id}>
                                    {project.name} ({project.key})
                                </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button onClick={() => setShowProjectModal(true)} className="p-1 text-gray-400 hover:text-gray-600" title="Create new project">
                        <PlusIcon className="h-5 w-5" />
                    </button>
                    
                    {/* --- SPRINT SELECTOR (THE FIX) --- */}
                    {selectedProject && (
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                            <select
                            value={selectedSprint?._id || ''}
                            onChange={(e) => {
                                const sprint = sprints.find(s => s._id === e.target.value);
                                setSelectedSprint(sprint || null);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                            <option value="">Project Backlog</option>
                            {sprints.map(sprint => (
                                <option key={sprint._id} value={sprint._id}>
                                {sprint.name}
                                </option>
                            ))}
                            </select>
                            <button onClick={() => setShowSprintModal(true)} className="p-1 text-gray-400 hover:text-gray-600" title="Create new sprint">
                                <PlusIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* --- RIGHT SIDE OF HEADER (USER MENU) --- */}
                <div className="relative">
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">{user?.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
                    </button>
                    {showUserMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700">
                              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
                                  Signed in as <br/>
                                  <strong className="font-medium">{user?.email}</strong>
                              </div>
                              {/* --- NEW THEME TOGGLE BUTTON --- */}
                              <button
                                  onClick={toggleTheme}
                                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                  {theme === 'light' ? (
                                      <MoonIcon className="w-5 h-5 mr-2"/>
                                  ) : (
                                      <SunIcon className="w-5 h-5 mr-2"/>
                                  )}
                                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                              </button>
                              {/* --- END OF BUTTON --- */}
                              <button
                                  onClick={logout}
                                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2"/>
                                  Logout
                              </button>
                          </div>
                      )}
                </div>
                </div>
            </div>
        </header>
      
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {selectedProject ? (
          <KanbanBoard 
            project={selectedProject} 
            sprint={selectedSprint}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="mt-2 text-lg font-medium text-gray-900">Welcome to your workspace!</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first project.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowProjectModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create New Project
              </button>
            </div>
          </div>
        )}
      </main>

      {showProjectModal && (
        <ProjectModal onClose={() => setShowProjectModal(false)} onProjectCreated={handleProjectCreated} />
      )}

      {showSprintModal && selectedProject && (
        <SprintModal project={selectedProject} onClose={() => setShowSprintModal(false)} onSprintCreated={handleSprintCreated} />
      )}
    </div>
  );
}