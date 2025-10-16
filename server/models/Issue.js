const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null
  },
  type: {
    type: String,
    enum: ['story', 'task', 'bug', 'epic'],
    default: 'task'
  },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
    default: 'backlog'
  },
  priority: {
    type: String,
    enum: ['lowest', 'low', 'medium', 'high', 'highest'],
    default: 'medium'
  },
  assignee: {
    type: String,
    default: ''
  },
  reporter: {
    type: String,
    required: true
  },
  storyPoints: {
    type: Number,
    default: null
  },
  labels: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

issueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Issue', issueSchema);