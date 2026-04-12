const express = require('express');
const path = require('path');
const cors = require('cors');
const { dbPath, all, get, run, initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In production, serve the built React app
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// ─── Health ────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const counts = {
    users:     (await get('SELECT COUNT(*) AS count FROM users')).count,
    tutors:    (await get('SELECT COUNT(*) AS count FROM tutors')).count,
    reviews:   (await get('SELECT COUNT(*) AS count FROM reviews')).count,
    bookmarks: (await get('SELECT COUNT(*) AS count FROM bookmarks')).count,
    contacts:  (await get('SELECT COUNT(*) AS count FROM contacts')).count,
  };
  res.json({ status: 'ok', db: dbPath, counts });
});

// ─── Auth ──────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required.' });

  const user = await get(
    'SELECT id, name, email FROM users WHERE email = ? AND password = ?',
    [email, password]
  );
  if (!user)
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });

  return res.json({ success: true, message: 'Login successful.', user });
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

  const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing)
    return res.status(409).json({ success: false, message: 'Email already registered.' });

  const created = await run(
    'INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)',
    [name, email, password, new Date().toISOString()]
  );
  return res.json({ success: true, message: 'Account created.', userId: created.id });
});

// ─── User Profile ──────────────────────────────────────────
app.get('/api/users/:id/profile', async (req, res) => {
  const user = await get('SELECT id, name, email, createdAt FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, user });
});

app.put('/api/users/:id/profile', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ success: false, message: 'Name and email are required.' });

  const existing = await get('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
  if (existing)
    return res.status(409).json({ success: false, message: 'That email is already taken.' });

  await run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id]);
  res.json({ success: true, message: 'Profile updated.' });
});

// ─── Tutors ────────────────────────────────────────────────
app.get('/api/tutors', async (req, res) => {
  const { subject, location, budget, mode } = req.query;
  const filters = [];
  const params = [];

  if (subject) {
    filters.push('LOWER(subject) = LOWER(?)');
    params.push(subject);
  }
  if (location) {
    filters.push('(LOWER(location) LIKE LOWER(?) OR LOWER(mode) = \'online\')');
    params.push(`%${location}%`);
  }
  if (mode) {
    filters.push('(LOWER(mode) = LOWER(?) OR LOWER(mode) = \'both\')');
    params.push(mode);
  }
  if (budget) {
    if (budget === '50+') {
      filters.push('ratePerHour >= ?');
      params.push(50);
    } else {
      const [minStr, maxStr] = String(budget).split('-');
      const min = Number(minStr), max = Number(maxStr);
      if (!isNaN(min) && !isNaN(max)) {
        filters.push('ratePerHour BETWEEN ? AND ?');
        params.push(min, max);
      }
    }
  }

  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const tutors = await all(
    `SELECT t.id, t.name, t.subject, t.location, t.ratePerHour, t.mode,
            t.rating, t.email, t.bio, t.experience, t.createdAt,
            (SELECT COUNT(*) FROM reviews WHERE tutorId = t.id) AS reviewCount
     FROM tutors t ${where} ORDER BY t.rating DESC, t.id DESC`,
    params
  );
  res.json({ tutors });
});

// Single tutor
app.get('/api/tutors/:id', async (req, res) => {
  const tutor = await get(
    `SELECT t.*, (SELECT COUNT(*) FROM reviews WHERE tutorId = t.id) AS reviewCount
     FROM tutors t WHERE t.id = ?`,
    [req.params.id]
  );
  if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found.' });
  res.json({ success: true, tutor });
});

// Apply as tutor
app.post('/api/tutors/apply', async (req, res) => {
  const { name, subject, location, ratePerHour, mode, email, bio, experience } = req.body;
  if (!name || !subject || !location || !ratePerHour || !mode || !email)
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });

  const numericRate = Number(ratePerHour);
  if (isNaN(numericRate) || numericRate <= 0)
    return res.status(400).json({ success: false, message: 'Rate must be a positive number.' });

  const inserted = await run(
    `INSERT INTO tutors (name, subject, location, ratePerHour, mode, rating, email, bio, experience, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, subject, location, numericRate, mode, 4.5, email, bio || '', experience || 1, new Date().toISOString()]
  );
  res.json({ success: true, message: 'Tutor profile submitted.', tutorId: inserted.id });
});

// ─── Reviews ───────────────────────────────────────────────
app.get('/api/tutors/:id/reviews', async (req, res) => {
  const reviews = await all(
    'SELECT * FROM reviews WHERE tutorId = ? ORDER BY id DESC',
    [req.params.id]
  );
  res.json({ reviews });
});

app.post('/api/tutors/:id/reviews', async (req, res) => {
  const { userId, userName, rating, comment } = req.body;
  if (!userName || !rating || !comment)
    return res.status(400).json({ success: false, message: 'userName, rating and comment are required.' });

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5)
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });

  const tutorId = Number(req.params.id);

  await run(
    'INSERT INTO reviews (tutorId, userId, userName, rating, comment, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [tutorId, userId || null, userName, numRating, comment, new Date().toISOString()]
  );

  // Recalculate average rating
  const avgRow = await get('SELECT AVG(rating) as avg FROM reviews WHERE tutorId = ?', [tutorId]);
  if (avgRow?.avg) {
    await run('UPDATE tutors SET rating = ? WHERE id = ?', [Math.round(avgRow.avg * 10) / 10, tutorId]);
  }

  res.json({ success: true, message: 'Review posted.' });
});

// ─── Bookings ──────────────────────────────────────────────
app.post('/api/bookings', async (req, res) => {
  const { studentId, tutorId, date, timeSlot } = req.body;
  if (!studentId || !tutorId || !date || !timeSlot)
    return res.status(400).json({ success: false, message: 'All booking fields are required.' });

  try {
    const inserted = await run(
      'INSERT INTO bookings (studentId, tutorId, date, timeSlot, createdAt) VALUES (?, ?, ?, ?, ?)',
      [studentId, tutorId, date, timeSlot, new Date().toISOString()]
    );
    res.json({ success: true, message: 'Booking requested successfully.', bookingId: inserted.id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not create booking.' });
  }
});

app.get('/api/bookings', async (req, res) => {
  const { studentId, tutorId } = req.query;
  let query = 'SELECT b.*, t.name as tutorName, t.subject as tutorSubject, u.name as studentName FROM bookings b LEFT JOIN tutors t ON b.tutorId = t.id LEFT JOIN users u ON b.studentId = u.id';
  let params = [];

  if (studentId) {
    query += ' WHERE b.studentId = ?';
    params.push(studentId);
  } else if (tutorId) {
    query += ' WHERE b.tutorId = ?';
    params.push(tutorId);
  }
  
  query += ' ORDER BY b.date ASC, b.timeSlot ASC';

  const bookings = await all(query, params);
  res.json({ bookings });
});

app.patch('/api/bookings/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }
  await run('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ success: true, message: `Booking ${status}.` });
});

// ─── Bookmarks ─────────────────────────────────────────────
app.get('/api/bookmarks', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required.' });
  const bookmarks = await all(
    'SELECT * FROM bookmarks WHERE userId = ? ORDER BY id DESC',
    [userId]
  );
  res.json({ bookmarks });
});

app.post('/api/bookmarks', async (req, res) => {
  const { userId, tutorId } = req.body;
  if (!userId || !tutorId)
    return res.status(400).json({ success: false, message: 'userId and tutorId are required.' });

  try {
    await run(
      'INSERT INTO bookmarks (userId, tutorId, createdAt) VALUES (?, ?, ?)',
      [userId, tutorId, new Date().toISOString()]
    );
    res.json({ success: true, message: 'Tutor bookmarked.' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Already bookmarked.' });
    }
    throw err;
  }
});

app.delete('/api/bookmarks/:tutorId', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required.' });
  await run('DELETE FROM bookmarks WHERE userId = ? AND tutorId = ?', [userId, req.params.tutorId]);
  res.json({ success: true, message: 'Bookmark removed.' });
});

// ─── Contact ───────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ success: false, message: 'All fields are required.' });

  const inserted = await run(
    'INSERT INTO contacts (name, email, message, createdAt) VALUES (?, ?, ?, ?)',
    [name, email, message, new Date().toISOString()]
  );
  res.json({ success: true, message: 'Message received. We will contact you soon.', contactId: inserted.id });
});

app.get('/api/contacts', async (req, res) => {
  const contacts = await all('SELECT id, name, email, message, createdAt FROM contacts ORDER BY id DESC');
  res.json({ contacts });
});

// ─── Fallback: serve React app for all non-API routes ──────
app.get('/{*path}', (req, res) => {
  const distIndex = path.join(__dirname, 'client', 'dist', 'index.html');
  const fs = require('fs');
  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else {
    res.status(200).json({ message: 'API is running. Start the React dev server with: cd client && npm run dev' });
  }
});

// ─── Start ─────────────────────────────────────────────────
async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API ready — ${PORT} endpoints active`);
    console.log(`🎓 Start React dev server: cd client && npm run dev\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
