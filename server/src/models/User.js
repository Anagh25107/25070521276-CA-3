import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
export const ROLES = Object.freeze({ STUDENT: 'Student', STAFF: 'Maintenance Staff', ADMIN: 'Administrator' });
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.STUDENT, required: true },
  isActive: { type: Boolean, default: true, required: true },
  maintenanceTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null }
}, { timestamps: true, toJSON: { transform(_doc, ret) { delete ret.passwordHash; delete ret.__v; return ret; } } });
userSchema.methods.verifyPassword = function(password) { return bcrypt.compare(password, this.passwordHash); };
userSchema.statics.hashPassword = function(password) { return bcrypt.hash(password, 12); };
export default mongoose.model('User', userSchema);