import express from 'express';
import { getProfile, updateProfile, getUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.get('/', protect, admin, getUsers);

export default router;