'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';

import StatCard from '../../components/StatCard';
import AnalyticsChart from '../../components/AnalyticsChart';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
    if(isAuthenticated) {
        fetchProjects();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchProjects = async () => {
    try {
        const { data } = await axios.get('/api/projects');
        setProjects(data);
        if (data.length > 0) {
            setSelectedProject(data[0]._id);
        } else {
            setLoading(false);
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      fetchAnalytics(selectedProject);
    }
  }, [selectedProject]);

  const fetchAnalytics = async (projectId) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/analytics/${projectId}`);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
            <Link href="/" className="p-2 rounded-full hover:bg-gray-100">
                <ArrowLeftIcon className="h-6 w-6 text-gray-600"/>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Project Analytics</h1>
            <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
        </div>
      </header>
      
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!selectedProject || !analytics ? (
            <div className="text-center">No project selected or no data available.</div>
        ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Stats Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <StatCard title="Total Issues" value={analytics.totalIssues} icon={ClipboardDocumentListIcon} color={{bg: 'bg-blue-100', text: 'text-blue-600'}} />
                        <StatCard title="Completed" value={analytics.completedIssues} icon={CheckCircleIcon} color={{bg: 'bg-green-100', text: 'text-green-600'}} />
                        <StatCard title="Open Issues" value={analytics.openIssues} icon={ClockIcon} color={{bg: 'bg-yellow-100', text: 'text-yellow-600'}} />
                    </div>
                    <AnalyticsChart title="Issues by Status" data={analytics.issuesByStatus} />
                    <AnalyticsChart title="Issues by Priority" data={analytics.issuesByPriority} />
                </div>
                {/* Personal Stats Column */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <UserCircleIcon className="h-6 w-6 mr-2 text-gray-500"/>
                        My Stats
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <p className="font-medium text-gray-600">Issues Assigned to Me</p>
                            <p className="font-bold text-2xl text-gray-900">{analytics.userStats.assignedCount}</p>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <p className="font-medium text-gray-600">Issues I've Completed</p>
                            <p className="font-bold text-2xl text-gray-900">{analytics.userStats.completedCount}</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                            <div className="bg-green-600 h-2.5 rounded-full" style={{width: `${analytics.userStats.assignedCount > 0 ? (analytics.userStats.completedCount / analytics.userStats.assignedCount) * 100 : 0}%`}}></div>
                        </div>
                        <p className="text-xs text-center text-gray-500">My Completion Rate</p>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}