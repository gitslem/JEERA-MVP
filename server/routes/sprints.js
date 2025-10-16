const express = require('express');
const router = express.Router();
const Sprint = require('../models/Sprint');
const { protect } = require('../middleware/authMiddleware'); // <-- Import protect

// Get all sprints for a specific project
router.get('/', protect, async (req, res) => { // <-- Add protect
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: 'A Project ID is required to fetch sprints.' });
    }
    
    const sprints = await Sprint.find({ projectId })
      .populate('projectId', 'name key')
      .sort({ createdAt: -1 });
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single sprint by its ID
router.get('/:id', protect, async (req, res) => { // <-- Add protect
  try {
    const sprint = await Sprint.findById(req.params.id).populate('projectId', 'name key');
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new sprint for a project
router.post('/', protect, async (req, res) => { // <-- Add protect
  try {
    const { name, projectId, goal, startDate, endDate } = req.body;
    
    const sprint = new Sprint({ name, projectId, goal, startDate, endDate });

    const newSprint = await sprint.save();
    const populatedSprint = await Sprint.findById(newSprint._id).populate('projectId', 'name key');
    res.status(201).json(populatedSprint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an existing sprint
router.put('/:id', protect, async (req, res) => { // <-- Add protect
    try {
        const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('projectId', 'name key');
        if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
        res.json(sprint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a sprint
router.delete('/:id', protect, async (req, res) => { // <-- Add protect
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    res.json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NOTE: The PATCH routes for starting/completing sprints can be consolidated into the PUT route.
// For simplicity, we'll leave them for now but they are also now protected.
router.patch('/:id/start', protect, (req, res) => { /* ... existing logic ... */ });
router.patch('/:id/complete', protect, (req, res) => { /* ... existing logic ... */ });


module.exports = router;