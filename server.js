import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import songsRoutes from './routes/songs.js';
import spotifyRoutes from './routes/spotify.js';

config();

connectDB();

const app = express();

const corsOptions = {
  origin: [
    "https://spotify-frontend-olive.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));

app.use(json());

app.use('/api/auth', authRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/spotify', spotifyRoutes);

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
