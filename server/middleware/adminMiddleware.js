export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403);
  next(new Error('Access denied: admin only'));
};