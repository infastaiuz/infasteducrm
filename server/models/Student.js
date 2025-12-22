import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  parent_phone: {
    type: String,
    default: ''
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  status: {
    type: String,
    enum: ['LEAD', 'ACTIVE', 'DEBTOR', 'STOPPED'],
    default: 'LEAD'
  },
  joined_date: {
    type: Date,
    default: Date.now
  },
  last_payment_date: {
    type: Date
  },
  next_payment_date: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Student', studentSchema);

