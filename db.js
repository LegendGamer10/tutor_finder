const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dbPath = path.join(dataDir, 'studybudget.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function initializeDatabase() {
  // Core tables
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tutors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      location TEXT NOT NULL,
      ratePerHour INTEGER NOT NULL,
      mode TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 4.5,
      email TEXT,
      bio TEXT,
      experience INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // Reviews table
  await run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutorId INTEGER NOT NULL,
      userId INTEGER,
      userName TEXT NOT NULL,
      rating REAL NOT NULL,
      comment TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (tutorId) REFERENCES tutors(id)
    )
  `);

  // Bookmarks table
  await run(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      tutorId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE(userId, tutorId)
    )
  `);

  // --- Seed users ---
  const userCount = await get('SELECT COUNT(*) AS count FROM users');
  if (userCount.count === 0) {
    const now = new Date().toISOString();
    await run('INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)',
      ['Demo User', 'user@study.com', '12345', now]);
    await run('INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)',
      ['Sample Student', 'student@study.com', 'study123', now]);
  }

  // --- Seed tutors ---
  const tutorCount = await get('SELECT COUNT(*) AS count FROM tutors');
  if (tutorCount.count === 0) {
    const now = new Date().toISOString();
    const seedTutors = [
      ['Alice Johnson',    'math',      'Pune',       20, 'online',    4.7, 'alice@example.com',   'Passionate math educator with 5+ years helping students master calculus and algebra.', 5],
      ['Rahul Mehta',      'python',    'Mumbai',     15, 'online',    4.5, 'rahul@example.com',   'Software engineer and Python enthusiast. Teaches beginners to intermediate coders.', 3],
      ['Sneha Kulkarni',   'science',   'Nagpur',     25, 'in-person', 4.8, 'sneha@example.com',   'Former school teacher specializing in Physics and Chemistry for grades 9-12.', 7],
      ['David Fernandes',  'english',   'Goa',        30, 'online',    4.6, 'david@example.com',   'English literature graduate helping students with writing, grammar, and comprehension.', 4],
      ['Priya Nair',       'history',   'Bengaluru',  22, 'online',    4.4, 'priya@example.com',   'History enthusiast with deep knowledge of Indian and world history.', 2],
      ['Arjun Patil',      'computer',  'Pune',       35, 'in-person', 4.9, 'arjun@example.com',   'Full-stack developer with 8 years industry experience. Exceptional at breaking down complex topics.', 8],
      ['Meera Rao',        'math',      'Hyderabad',  18, 'online',    4.6, 'meera@example.com',   'Mathematics postgraduate focusing on competitive exam preparation.', 4],
      ['Karthik Sharma',   'languages', 'Chennai',    20, 'both',      4.5, 'karthik@example.com', 'Fluent in 4 languages. Teaches Hindi, French, and Tamil to beginners and advanced learners.', 6],
      ['Aisha Khan',       'english',   'Delhi',      28, 'online',    4.7, 'aisha@example.com',   'Published author and English coach helping students with essays, IELTS, and communication.', 5],
      ['Vikram Singh',     'science',   'Jaipur',     23, 'both',      4.3, 'vikram@example.com',  'Biology and Chemistry tutor for NEET aspirants with a track record of top results.', 3],
      ['Lina D\'Souza',   'python',    'Bengaluru',  19, 'online',    4.6, 'lina@example.com',    'Data science professional teaching Python, pandas, and ML basics.', 4],
      ['Naresh Kumar',     'math',      'Mumbai',     16, 'both',      4.4, 'naresh@example.com',  'Affordable math coaching for school students from grades 6 to 10.', 2],
    ];

    for (const tutor of seedTutors) {
      await run(
        `INSERT INTO tutors (name, subject, location, ratePerHour, mode, rating, email, bio, experience, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...tutor, now]
      );
    }
  }

  // --- Seed reviews ---
  const reviewCount = await get('SELECT COUNT(*) AS count FROM reviews');
  if (reviewCount.count === 0) {
    const now = new Date().toISOString();
    const sampleReviews = [
      [1, null, 'Priya S.', 5, 'Alice explained calculus so clearly! My exam score went from 60 to 88 in 4 weeks.'],
      [1, null, 'Ravi K.', 4, 'Very patient and thorough. Algebra sessions were really helpful.'],
      [2, null, 'Anjali M.', 5, 'Rahul teaches Python in such a fun and practical way. Highly recommend!'],
      [3, null, 'Deepak R.', 5, 'Sneha is an amazing science teacher. Her in-person sessions are very effective.'],
      [4, null, 'Sam T.', 4, 'David helped me improve my essay writing significantly. Great tutor!'],
      [6, null, 'Nisha P.', 5, 'Arjun is the best CS tutor I\'ve had. Explains complex topics with simple examples.'],
      [6, null, 'Arun V.', 5, 'He helped me crack my first dev interview! Absolutely brilliant.'],
    ];
    for (const [tutorId, userId, userName, rating, comment] of sampleReviews) {
      await run(
        'INSERT INTO reviews (tutorId, userId, userName, rating, comment, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [tutorId, userId, userName, rating, comment, now]
      );
    }

    // Update tutor ratings based on reviews
    const tutorIds = [...new Set(sampleReviews.map(r => r[0]))];
    for (const tid of tutorIds) {
      const avgRow = await get('SELECT AVG(rating) as avg FROM reviews WHERE tutorId = ?', [tid]);
      if (avgRow?.avg) {
        await run('UPDATE tutors SET rating = ? WHERE id = ?', [Math.round(avgRow.avg * 10) / 10, tid]);
      }
    }
  }
}

module.exports = { dbPath, run, get, all, initializeDatabase };
