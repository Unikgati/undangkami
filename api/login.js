// Serverless API route for login (Vercel)
export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  let body = req.body;
  // Vercel serverless API: body bisa kosong jika tidak pakai middleware
  if (!body || typeof body !== 'object') {
    try {
      body = JSON.parse(req.body);
    } catch {
      body = {};
    }
  }
  const { username, password } = body;
  // Dummy user
  if (username === 'admin' && password === 'admin123') {
    // Generate dummy token (in real app, use JWT)
    const token = Buffer.from('admin:admin123').toString('base64');
    res.status(200).json({ token });
  } else {
    res.status(401).json({ error: 'Username atau password salah' });
  }
}
