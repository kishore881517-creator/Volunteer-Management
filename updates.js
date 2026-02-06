const express = require('express');
const Update = require('../models/Update');
const { verifyEmployee } = require('../middleware/auth');

const router = express.Router();

// Get all updates (Admin/Employee)
router.get('/', verifyEmployee, async (req, res) => {
  try {
    const updates = await Update.find().sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single update (Admin/Employee)
router.get('/:id', verifyEmployee, async (req, res) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }
    res.json(update);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create update (Admin/Employee)
router.post('/', verifyEmployee, async (req, res) => {
  const update = new Update({
    volunteerName: req.body.volunteerName,
    eventName: req.body.eventName,
    date: req.body.date,
    hoursWorked: req.body.hoursWorked,
    status: req.body.status || 'pending',
    createdBy: req.admin.username,
  });

  try {
    const newUpdate = await update.save();
    res.status(201).json(newUpdate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update update (Admin/Employee)
router.put('/:id', verifyEmployee, async (req, res) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    if (req.body.volunteerName) update.volunteerName = req.body.volunteerName;
    if (req.body.eventName) update.eventName = req.body.eventName;
    if (req.body.date) update.date = req.body.date;
    if (req.body.hoursWorked) update.hoursWorked = req.body.hoursWorked;
    if (req.body.status) update.status = req.body.status;

    update.updatedAt = Date.now();
    const updatedUpdate = await update.save();
    res.json(updatedUpdate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete update (Admin/Employee)
router.delete('/:id', verifyEmployee, async (req, res) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }
    await Update.deleteOne({ _id: req.params.id });
    res.json({ message: 'Update deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
