import mongoose from 'mongoose';
const teamSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true, unique: true, maxlength: 80 }, description: { type: String, trim: true, maxlength: 500, default: '' }, isActive: { type: Boolean, default: true } }, { timestamps: true });
export default mongoose.model('Team', teamSchema);