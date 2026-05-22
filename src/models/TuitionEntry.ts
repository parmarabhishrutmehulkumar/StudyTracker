import mongoose, { Schema, model, models } from 'mongoose';

const TuitionEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    conceptsTaught: {
      type: String,
      default: '',
    },
    tutorNotes: {
      type: String,
      default: '',
    },
    duration: {
      type: Number, // duration in minutes
      default: 60,
    },
  },
  { timestamps: true }
);

const TuitionEntry = models.TuitionEntry || model('TuitionEntry', TuitionEntrySchema);

export default TuitionEntry;
