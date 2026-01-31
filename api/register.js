const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Path to the user JSON database relative to this file. When deployed on
// Vercel each invocation is stateless, but writes to the filesystem are
// preserved in the cache for subsequent invocations within the same
// deployment instance. This keeps the example simple without requiring
// external services.
const dbFile = path.join(__dirname, '..', 'users.json');

function readUsers() {
  try {
    const data = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(dbFile, JSON.stringify(users, null, 2));
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.status(400).json({ success: false, message: 'Invalid JSON' });
      return;
    }
    const { email, password } = parsed;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }
    const users = readUsers();
    if (users.some(u => u.email === email)) {
      res.status(400).json({ success: false, message: 'Email already exists' });
      return;
    }
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const name = email.split('@')[0];
    const newUser = { email, password: hashedPassword, name };
    users.push(newUser);
    writeUsers(users);
    res.status(200).json({ success: true, user: { email: newUser.email, name: newUser.name } });
  });
}
