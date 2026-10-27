import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import User, { ROLES } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { emailValid, validPassword, cleanText } from '../utils/validation.js';
const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } } });
const safeUser = u => ({ id: String(u._id), name: u.name, email: u.email, role: u.role, isActive: u.isActive, maintenanceTeam: u.maintenanceTeam || null });
router.get('/csrf', (req, res) => res.json({ success: true, data: { csrfToken: req.csrfToken() } }));
router.post('/register', async (req, res, next) => {
 try {
  const name = cleanText(req.body?.name, 80), email = cleanText(req.body?.email, 254).toLowerCase(), password = req.body?.password;
  if (name.length < 2 || !emailValid(email) || !validPassword(password)) return res.status(400).json({ success:false, error:{code:'VALIDATION_ERROR', message:'Provide a name, valid email, and password of at least 10 characters.'} });
  const user = await User.create({ name, email, passwordHash: await User.hashPassword(password), role: ROLES.STUDENT });
  return res.status(201).json({ success:true, data:{ user:safeUser(user) } });
 } catch (e) { if (e.code === 11000) return res.status(409).json({success:false,error:{code:'DUPLICATE_EMAIL',message:'Unable to register with these details.'}}); next(e); }
});
router.post('/login', loginLimiter, async (req, res, next) => {
 try {
  const email = cleanText(req.body?.email, 254).toLowerCase(), password = req.body?.password;
  if (!emailValid(email) || typeof password !== 'string' || password.length > 128) return res.status(400).json({success:false,error:{code:'VALIDATION_ERROR',message:'Enter a valid email and password.'}});
  const user = await User.findOne({ email }).select('+passwordHash');
  const valid = user ? await user.verifyPassword(password) : await User.hashPassword('constant-time-dummy-password');
  if (!user || !valid || !user.isActive) return res.status(401).json({success:false,error:{code:'LOGIN_FAILED',message:'Invalid email or password.'}});
  await new Promise((resolve,reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
  req.session.userId = String(user._id);
  await new Promise((resolve,reject) => req.session.save(err => err ? reject(err) : resolve()));
  res.json({success:true,data:{user:safeUser(user)}});
 } catch(e) { next(e); }
});
router.post('/logout', (req,res,next) => {
 if (!req.session) return res.json({success:true,data:{message:'Logged out.'}});
 req.session.destroy(err => { if(err) return next(err); res.clearCookie('fixmycampus.sid', { httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV === 'production', path:'/' }); res.json({success:true,data:{message:'Logged out.'}}); });
});
router.get('/me', requireAuth, (req,res) => res.json({success:true,data:{user:safeUser(req.user)}}));
export default router;