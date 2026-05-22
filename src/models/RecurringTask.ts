import mongoose, { Schema, model, models } from 'mongoose';

const RecurringTaskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    taskName: {
      type: String, // e.g., "tables 12", "tables 13"
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per user, date and taskName
RecurringTaskSchema.index({ userId: 1, date: 1, taskName: 1 }, { unique: true });

const RecurringTask = models.RecurringTask || model('RecurringTask', RecurringTaskSchema);

export default RecurringTask;
