const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { protect } = require('../middleware/authMiddleware'); // Import protect

// Get all issues with filtering
// We protect this route to ensure only logged-in users can see issues.
router.get('/', protect, async (req, res) => {
  try {
    const { projectId, sprintId, status, assignee } = req.query;
    let filter = {};
    
    // projectId is always required to scope the issues.
    if (projectId) {
      filter.projectId = projectId;
    } else {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    // --- THIS IS THE FIX ---
    // Handle the three cases for sprintId
    if (sprintId && sprintId !== 'null') {
      // Case 1: A specific sprint is selected
      filter.sprintId = sprintId;
    } else if (sprintId === 'null') {
      // Case 2: The backlog is selected (issues with no sprint)
      filter.sprintId = null;
    }
    // Case 3: sprintId is undefined (fetches all issues for the project, regardless of sprint)

    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    
    const issues = await Issue.find(filter)
      .populate('projectId', 'name key') // Populate with project details
      .populate('sprintId', 'name')     // Populate with sprint details
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error); // Good for debugging
    res.status(500).json({ message: 'An error occurred while fetching issues.' });
  }
});

// Protect all other routes for consistency
router.get('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('projectId', 'name key')
      .populate('sprintId', 'name');
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const {
      title, description, projectId, sprintId,
      type, priority, assignee, storyPoints, labels
    } = req.body;

    // Automatically set the reporter to the currently logged-in user's name
    const reporter = req.user.name; 
    
    const issue = new Issue({
      title, description, projectId, sprintId, type,
      priority, assignee, reporter, storyPoints, labels
    });

    const newIssue = await issue.save();
    const populatedIssue = await Issue.findById(newIssue._id)
      .populate('projectId', 'name key')
      .populate('sprintId', 'name');
    res.status(201).json(populatedIssue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('projectId', 'name key').populate('sprintId', 'name');

    if (!updatedIssue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(updatedIssue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('projectId', 'name key').populate('sprintId', 'name');

    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;