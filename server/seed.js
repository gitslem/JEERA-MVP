const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Issue = require('./models/Issue');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Expanded list of 16 demo tasks
const seedIssues = [
    // Done
    { title: 'Implement user authentication flow', type: 'story', status: 'done', priority: 'highest', storyPoints: 8, assignee: 'Shashwat' },
    { title: 'Design the main dashboard UI', type: 'story', status: 'done', priority: 'high', storyPoints: 5 },
    { title: 'Draft Q3 marketing campaign brief', type: 'task', status: 'done', priority: 'medium' },

    // Review
    { title: 'Set up production database and CI/CD pipeline', type: 'task', status: 'review', priority: 'high', assignee: 'Shashwat' },
    { title: 'Finalize budget for new website redesign', type: 'task', status: 'review', priority: 'medium' },
    
    // In Progress
    { title: 'Fix login button alignment on all mobile devices', type: 'bug', status: 'in-progress', priority: 'highest', assignee: 'Shashwat' },
    { title: 'Develop analytics chart components with dark mode support', type: 'story', status: 'in-progress', priority: 'high', storyPoints: 8, assignee: 'Shashwat' },

    // To Do
    { title: 'Refactor CSS to use Tailwind utility classes across all modals', type: 'task', status: 'todo', priority: 'medium', storyPoints: 5 },
    { title: 'User profile page shows incorrect email after update', type: 'bug', status: 'todo', priority: 'high' },
    { title: 'API endpoint for user profiles is returning 500 error', type: 'bug', status: 'todo', priority: 'highest' },
    { title: 'Allow users to be invited to projects via email', type: 'story', status: 'todo', priority: 'high', storyPoints: 8 },

    // Backlog
    { title: 'Write API documentation for all endpoints', type: 'task', status: 'backlog', priority: 'low', storyPoints: 13 },
    { title: 'Onboarding assets for new hires are outdated', type: 'task', status: 'backlog', priority: 'medium' },
    { title: 'Set up staging environment for QA testing', type: 'task', status: 'backlog', priority: 'medium' },
    { title: 'Explore integration with third-party apps like Slack', type: 'story', status: 'backlog', priority: 'lowest', storyPoints: 13 },
    { title: 'Create a "forgot password" feature', type: 'story', status: 'backlog', priority: 'high', storyPoints: 5 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Your two Project IDs
    const projectIds = [
      '689e80773f1b5cf0610eb5ba', // "shashwat first project"
      '689e80b93f1b5cf0610eb5c5'  // "test project"
    ];

    for (const projectId of projectIds) {
      // Clear out any old demo data from this project first
      await Issue.deleteMany({ projectId: projectId });
      console.log(`Cleared old issues for project ${projectId}`);

      // Create the new set of issues for this project
      const issuesWithProject = seedIssues.map(issue => ({
        ...issue,
        projectId: projectId,
        reporter: 'System Seed',
      }));
      
      await Issue.insertMany(issuesWithProject);
      console.log(`✅ Seeded ${seedIssues.length} new issues for project ${projectId}`);
    }

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDB();