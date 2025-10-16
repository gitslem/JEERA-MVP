'use client'

import { 
  RectangleStackIcon,
  CheckCircleIcon,
  BugAntIcon,
  BoltIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const typeIcons = {
  story: { icon: RectangleStackIcon, color: 'text-green-600' },
  task: { icon: CheckCircleIcon, color: 'text-blue-600' },
  bug: { icon: BugAntIcon, color: 'text-red-600' },
  epic: { icon: BoltIcon, color: 'text-purple-600' }
};

const priorityIcons = {
  highest: { icon: ArrowUpIcon, color: 'text-red-500' },
  high: { icon: ArrowUpIcon, color: 'text-orange-500' },
  medium: { icon: null, color: '' },
  low: { icon: ArrowDownIcon, color: 'text-green-500' },
  lowest: { icon: ArrowDownIcon, color: 'text-gray-500' },
};

export default function IssueCard({ issue, isDragging }) {
  const TypeIcon = typeIcons[issue.type]?.icon || RectangleStackIcon;
  const typeColor = typeIcons[issue.type]?.color || 'text-gray-600';

  const PriorityIcon = priorityIcons[issue.priority]?.icon;
  const priorityColor = priorityIcons[issue.priority]?.color;

  return (
    <div className={`bg-white dark:bg-gray-700 rounded-md shadow border border-gray-200 dark:border-gray-600 p-3 hover:shadow-lg transition-shadow cursor-pointer ${isDragging ? 'shadow-2xl rotate-3' : ''}`}>
        <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug pr-4">
                {issue.title}
            </p>
            {issue.assignee && (
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-700">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-300">
                    {issue.assignee.charAt(0).toUpperCase()}
                    </span>
                </div>
            )}
        </div>

        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
                <TypeIcon className={`h-4 w-4 ${typeColor}`} />
                {PriorityIcon && <PriorityIcon className={`h-4 w-4 ${priorityColor}`} />}
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {/* We'll check if projectId exists before trying to access its key */}
                    {issue.projectId?.key}-{issue.storyPoints || '0'} 
                </span>
            </div>

            {issue.storyPoints > 0 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full font-medium">
                {issue.storyPoints}
              </span>
            )}
        </div>
    </div>
  );
}