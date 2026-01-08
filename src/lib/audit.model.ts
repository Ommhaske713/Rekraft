import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  action: { 
    type: String,
    required: true,
    enum: ['PROFILE_UPDATE', 'AVATAR_UPDATE', 'PASSWORD_CHANGE']
  },
  details: String,
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditSchema);