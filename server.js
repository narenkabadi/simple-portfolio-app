const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Path to our simple JSON "database" file. This will persist user records
// between server restarts while keeping the solution dependency‑free. In a
// production environment you would replace this with a real database such as
// MongoDB.
const dbFile = path.join(__dirname, 'users.json');

/**
 * Read users from the JSON database file. If the file does not exist or
 * contains invalid JSON, an empty array is returned.
 *
 * @returns {Array} array of user objects
 */
function readUsers() {
  try {
    const data = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

/**
 * Write the given users array back to the JSON database file. Data is
 * formatted with indentation for readability.
 *
 * @param {Array} users
 */
function writeUsers(users) {
  fs.writeFileSync(dbFile, JSON.stringify(users, null, 2));
}

/**
 * Serve static files from the `public` directory based on the request URL.
 * Responds with 404 if the file is not found.
 *
 * @param {string} url request url
 * @param {http.ServerResponse} res response object
 */
function serveStaticFile(url, res) {
  const publicDir = path.join(__dirname, 'public');
  // Default to index.html at root
  let filePath = path.join(publicDir, url === '/' ? 'index.html' : url);
  // Normalize path to prevent directory traversal
  filePath = path.normalize(filePath);

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  fs.readFile(filePath, function (error, content) {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      const contentType = mimeTypes[extname] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

/**
 * Handle registration requests. Expects JSON body with `email` and `password`.
 * Responds with JSON success flag and user info. Errors are reported with
 * appropriate HTTP status codes and messages.
 *
 * @param {http.IncomingMessage} req request object
 * @param {http.ServerResponse} res response object
 */
function handleRegister(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
      return;
    }
    const { email, password } = parsed;
    if (!email || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Email and password are required' }));
      return;
    }
    const users = readUsers();
    if (users.some(u => u.email === email)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Email already exists' }));
      return;
    }
    // Hash the password using SHA‑‑26 for basic security. Note that in a
    // production application you would use a stronger hashing algorithm such
    // as bcrypt with salt.
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const name = email.split('@')[0];
    const newUser = { email, password: hashedPassword, name };
    users.push(newUser);
    writeUsers(users);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, user: { email: newUser.email, name: newUser.name } }));
  });
}

/**
 * Handle login requests. Expects JSON body with `email` and `password`.
 * Responds with JSON success flag and user info on success.
 *
 * @param {http.IncomingMessage} req request object
 * @param {http.ServerResponse} res response object
 */
function handleLogin(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
      return;
    }
    const { email, password } = parsed;
    if (!email || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Email and password are required' }));
      return;
    }
    const users = readUsers();
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid email or password' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, user: { email: user.email, name: user.name } }));
  });
}

// Create HTTP server and route requests
const server = http.createServer((req, res) => {
  const { method, url } = req;
  if (method === 'GET') {
    // Serve static files from the public directory
    serveStaticFile(url, res);
  } else if (method === 'POST' && url === '/api/register') {
    handleRegister(req, res);
  } else if (method === 'POST' && url === '/api/login') {
    handleLogin(req, res);
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

// Start server on the given port. Vercel sets PORT env var in deployment
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
