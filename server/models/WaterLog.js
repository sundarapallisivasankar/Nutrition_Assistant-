import mongoose from 'mongoose';

const waterEntrySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [1, 'Logged water must be positive'],
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
});

const waterLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // format: YYYY-MM-DD
      required: true,
    },
    amount: {
      type: Number, // total water logged in ml
      default: 0,
      min: [0, 'Water volume cannot be negative'],
    },
    goal: {
      type: Number, // water intake goal in ml
      required: true,
      default: 2500,
    },
    entries: [waterEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Ensure user has one log document per date
waterLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Pre-save hook to recalculate total water amount
waterLogSchema.pre('save', function (next) {
  this.amount = this.entries.reduce((total, entry) => total + entry.amount, 0);
  next();
});

const WaterLog = mongoose.model('WaterLog', waterLogSchema);
export default WaterLog;
