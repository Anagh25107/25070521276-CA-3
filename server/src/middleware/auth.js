import User, { ROLES } from '../models/User.js';
export async function requireAuth(req, res, next) {
  try {
    if (!req.session?.userId) return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
    const user = await User.findById(req.session.userId).select('+passwordHash');
    if (!user || !user.isActive) {
      req.session.destroy(() => {});
      return res.status(401).json({ success: false, error: { code: 'SESSION_INVALID', message: 'Your session is no longer valid. Please sign in again.' } });
    }
    req.user = user; next();
  } catch (err) { next(err); }
}
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
  if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' } });
  next();
};
export const isAdmin = user => user?.role === ROLES.ADMIN;
