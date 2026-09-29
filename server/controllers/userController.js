import User from '../models/User.js';

// GET /api/users/profile
export const getProfile = async (req, res) => {
  const u = req.user;
  res.json({ _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: u.createdAt });
};

// PUT /api/users/profile   { name, phone, currentPassword, newPassword }
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { name, phone, currentPassword, newPassword } = req.body;

  if (name !== undefined) {
    if (!name.trim()) {
      res.status(400);
      throw new Error('Name cannot be empty');
    }
    user.name = name.trim();
  }
  if (phone !== undefined) {
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      res.status(400);
      throw new Error('Enter a valid 10-digit phone number');
    }
    user.phone = phone;
  }

  if (newPassword) {
    if (!currentPassword || !(await user.matchPassword(currentPassword))) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('Password must contain at least 6 characters');
    }
    user.password = newPassword; // hashed by the pre-save hook
  }

  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
};

// GET /api/users  (admin)
export const getUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }); // password is select:false, never returned
  res.json(users);
};