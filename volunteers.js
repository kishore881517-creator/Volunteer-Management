const express = require('express');
const Volunteer = require('../models/Volunteer');
const { verifyEmployee } = require('../middleware/auth');

const router = express.Router();

// Get all volunteers
router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ name: 1 });
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single volunteer
router.get('/:id', async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    res.json(volunteer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create volunteer
router.post('/', async (req, res) => {
  const volunteer = new Volunteer({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  });

  try {
    const newVolunteer = await volunteer.save();
    res.status(201).json(newVolunteer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update volunteer (Admin only)
router.put('/:id', verifyEmployee, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    if (req.body.name) volunteer.name = req.body.name;
    if (req.body.email) volunteer.email = req.body.email;
    if (req.body.phone) volunteer.phone = req.body.phone;
    if (req.body.totalHours) volunteer.totalHours = req.body.totalHours;
    if (req.body.eventsAttended) volunteer.eventsAttended = req.body.eventsAttended;

    volunteer.updatedAt = Date.now();
    const updatedVolunteer = await volunteer.save();
    res.json(updatedVolunteer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete volunteer (Admin only)
router.delete('/:id', verifyEmployee, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    await Volunteer.deleteOne({ _id: req.params.id });
    res.json({ message: 'Volunteer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
