require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { Server } = require('socket.io');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const { stripeWebhook } = require('./controllers/paymentController');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// --- Socket.io setup (live chat) ---
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log('Live chat client connected:', socket.id);

  // Customer joins a room named after their own socket id, so an admin can target a reply
  socket.on('chat:message', (payload) => {
    // payload: { room, from: 'customer' | 'admin', text, name }
    const room = payload.room || socket.id;
    socket.join(room);
    io.to(room).emit('chat:message', { ...payload, room, ts: Date.now() });
    // Also notify the admin dashboard room of new customer messages
    if (payload.from === 'customer') {
      io.to('admin-room').emit('chat:new-customer-message', { room, ...payload, ts: Date.now() });
    }
  });

  socket.on('admin:join', () => {
    socket.join('admin-room');
  });

  socket.on('chat:join', (room) => {
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('Live chat client disconnected:', socket.id);
  });
});

// --- Stripe webhook must receive the RAW body, so it's mounted BEFORE express.json() ---
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// --- Standard middleware ---
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Image upload (product images, used by admin panel) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// Multiple images at once - used by the admin product form (gallery of up to 6 images)
app.post('/api/upload/multiple', upload.array('images', 6), (req, res) => {
  if (!req.files || !req.files.length) return res.status(400).json({ success: false, message: 'No files uploaded' });
  const urls = req.files.map((f) => `/uploads/${f.filename}`);
  res.json({ success: true, urls });
});

// --- API routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
