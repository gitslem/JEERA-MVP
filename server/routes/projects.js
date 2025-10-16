const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware'); // <-- Import protect

// Get all projects FOR THE CURRENT USER
router.get('/', protect, async (req, res) => { // <-- Add protect
  try {
    // Find projects where the current user's ID is in the 'members' array
    const projects = await Project.find({ members: req.user._id })
      .populate('lead', 'name email') // Populate lead with user details
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single project (We'll add a check here later to ensure user is a member)
router.get('/:id', protect, async (req, res) => { // <-- Add protect
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // TODO: Add check to ensure req.user._id is in project.members
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post('/', protect, async (req, res) => { // <-- Add protect
  try {
    const { name, key, description, type } = req.body;
    
    const existingProject = await Project.findOne({ key });
    if (existingProject) {
      return res.status(400).json({ message: 'Project key already exists' });
    }

    const project = new Project({
      name,
      key: key.toUpperCase(),
      description,
      type,
      lead: req.user._id, // The person creating is the lead
      owner: req.user._id, // The person creating is the owner
      members: [req.user._id] // Add the creator as the first member
    });

    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- We also need to protect our update and delete routes ---

// Update project
router.put('/:id', protect, async (req, res) => { // <-- Add protect
    // ... (logic for updating remains the same for now)
    try {
        const { name, description, lead, type, status } = req.body;
        const project = await Project.findByIdAndUpdate(
          req.params.id,
          { name, description, lead, type, status },
          { new: true, runValidators: true }
        );
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
});

// Delete project
router.delete('/:id', protect, async (req, res) => { // <-- Add protect
    // ... (logic for deleting remains the same for now)
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
});


module.exports = router;