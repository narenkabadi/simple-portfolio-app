const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbFile = path.join(__dirname, '..', 'users.json');

function readUsers() {
  try {
    const data = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
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
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }
    res.status(200).json({ success: true, user: { email: user.email, name: user.name } });
  });
}
