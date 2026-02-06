const express = require('express');
const Event = require('../models/Event');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create event (Admin only)
router.post('/', verifyAdmin, async (req, res) => {
  const event = new Event({
    name: req.body.name,
    date: req.body.date,
    location: req.body.location,
    volunteersNeeded: req.body.volunteersNeeded || 0,
    hoursNeeded: req.body.hoursNeeded || 0,
  });

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update event (Admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (req.body.name) event.name = req.body.name;
    if (req.body.date) event.date = req.body.date;
    if (req.body.location) event.location = req.body.location;
    if (req.body.volunteersNeeded !== undefined) event.volunteersNeeded = req.body.volunteersNeeded;
    if (req.body.volunteersRegistered !== undefined) event.volunteersRegistered = req.body.volunteersRegistered;
    if (req.body.hoursNeeded !== undefined) event.hoursNeeded = req.body.hoursNeeded;

    event.updatedAt = Date.now();
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete event (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    await Event.deleteOne({ _id: req.params.id });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
