const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let registrations = [
  {
    id: 501,
    participantName: 'Riya Sharma',
    eventName: 'Tech Fest',
    department: 'CSE',
    ticketCount: 2,
    paymentStatus: 'Paid',
  },
  {
    id: 502,
    participantName: 'Arjun Mehta',
    eventName: 'Code Sprint',
    department: 'IT',
    ticketCount: 3,
    paymentStatus: 'Pending',
  },
  {
    id: 503,
    participantName: 'Neha Verma',
    eventName: 'Tech Fest',
    department: 'ECE',
    ticketCount: 1,
    paymentStatus: 'Paid',
  },
];
let nextRegistrationId = Math.max(...registrations.map((registration) => registration.id)) + 1;

const requiredFields = [
  'participantName',
  'eventName',
  'department',
  'ticketCount',
  'paymentStatus',
];

function validateRegistration(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }

  for (const field of requiredFields) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) {
      return `Missing required field: ${field}.`;
    }
  }

  for (const field of ['participantName', 'eventName', 'department']) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      return `${field} must be a non-empty string.`;
    }
  }

  if (!Number.isInteger(body.ticketCount) || body.ticketCount <= 0) {
    return 'ticketCount must be a positive integer.';
  }

  if (!['Paid', 'Pending'].includes(body.paymentStatus)) {
    return 'paymentStatus must be either Paid or Pending.';
  }

  return null;
}

function registrationFields(body) {
  return Object.fromEntries(requiredFields.map((field) => [field, body[field]]));
}

function parseId(idParam) {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) ? id : null;
}

// Specific paths must be registered before /:id.
app.get('/api/registrations/filter', (req, res) => {
  const { department } = req.query;
  if (typeof department !== 'string' || department.trim() === '') {
    return res.status(400).json({ error: 'Provide a department query parameter.' });
  }

  const matches = registrations.filter(
    (registration) => registration.department.toLowerCase() === department.trim().toLowerCase(),
  );
  return res.status(200).json(matches);
});

app.get('/api/registrations/pending', (req, res) => {
  res.status(200).json(
    registrations.filter((registration) => registration.paymentStatus === 'Pending'),
  );
});

app.get('/api/registrations', (req, res) => {
  res.status(200).json(registrations);
});

app.post('/api/registrations', (req, res) => {
  const validationError = validateRegistration(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const created = { id: nextRegistrationId, ...registrationFields(req.body) };
  nextRegistrationId += 1;
  registrations.push(created);
  return res.status(201).json(created);
});

app.get('/api/registrations/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).json({ error: 'Registration not found.' });

  const registration = registrations.find((item) => item.id === id);
  if (!registration) return res.status(404).json({ error: 'Registration not found.' });
  return res.status(200).json(registration);
});

app.put('/api/registrations/:id', (req, res) => {
  const id = parseId(req.params.id);
  const index = registrations.findIndex((item) => item.id === id);
  if (index === -1) return res.status(404).json({ error: 'Registration not found.' });

  const validationError = validateRegistration(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  registrations[index] = { id, ...registrationFields(req.body) };
  return res.status(200).json(registrations[index]);
});

app.delete('/api/registrations/:id', (req, res) => {
  const id = parseId(req.params.id);
  const index = registrations.findIndex((item) => item.id === id);
  if (index === -1) return res.status(404).json({ error: 'Registration not found.' });

  registrations.splice(index, 1);
  return res.status(200).json({ message: `Registration ${id} deleted successfully.` });
});

// Cancels a registration only while its payment is still pending.
app.post('/api/registrations/:id/cancel-pending', (req, res) => {
  const id = parseId(req.params.id);
  const index = registrations.findIndex((item) => item.id === id);
  if (index === -1) return res.status(404).json({ error: 'Registration not found.' });
  if (registrations[index].paymentStatus !== 'Pending') {
    return res.status(409).json({ error: 'Only pending registrations can be cancelled.' });
  }

  registrations.splice(index, 1);
  return res.status(200).json({ message: `Pending registration ${id} cancelled successfully.` });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Request body contains invalid JSON.' });
  }
  return res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`College event registration API is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
