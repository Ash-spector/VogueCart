import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // every cart route needs a logged-in user

router.route('/').get(getCart).post(addToCart).delete(clearCart);
router.route('/:itemId').put(updateCartItem).delete(removeCartItem);

export default router;