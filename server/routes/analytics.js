const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get analytics data for a project
// @route   GET /api/analytics/:projectId
// @access  Private
router.get('/:projectId', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const issues = await Issue.find({ projectId });
    const user = req.user; // The logged-in user from the 'protect' middleware

    if (!issues) {
      return res.json({ message: 'No issues found for this project.' });
    }

    // 1. High-level project stats
    const totalIssues = issues.length;
    const completedIssues = issues.filter(i => i.status === 'done').length;
    const openIssues = totalIssues - completedIssues;
    const completionPercentage = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    // 2. Breakdown by status
    const issuesByStatus = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {});

    // 3. Breakdown by priority
    const issuesByPriority = issues.reduce((acc, issue) => {
        acc[issue.priority] = (acc[issue.priority] || 0) + 1;
        return acc;
    }, {});

    // 4. Personal user stats for the person making the request
    const userAssignedIssues = issues.filter(i => i.assignee === user.name);
    const userCompletedIssuesCount = userAssignedIssues.filter(i => i.status === 'done').length;

    res.json({
      totalIssues,
      completedIssues,
      openIssues,
      completionPercentage,
      issuesByStatus,
      issuesByPriority,
      userStats: {
        assignedCount: userAssignedIssues.length,
        completedCount: userCompletedIssuesCount,
      }
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Server Error while fetching analytics.' });
  }
});

module.exports = router;