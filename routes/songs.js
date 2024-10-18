import { Router } from 'express';
import { getSongs, playSong } from '../controllers/songsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getSongs);
router.post('/play/:id', authMiddleware, playSong);

export default router;
