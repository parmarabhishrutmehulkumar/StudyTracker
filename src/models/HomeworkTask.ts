import mongoose, { Schema, model, models } from 'mongoose';

const HomeworkTaskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // assigned date YYYY-MM-DD
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Homework title is required'],
    },
    dueDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'ongoing', 'completed', 'overdue'],
      default: 'assigned',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: {
      type: String,
      default: '',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const HomeworkTask = models.HomeworkTask || model('HomeworkTask', HomeworkTaskSchema);

export default HomeworkTask;
