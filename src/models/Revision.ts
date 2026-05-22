import mongoose, { Schema, model, models } from 'mongoose';

const RevisionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // original tuition or creation date (YYYY-MM-DD)
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
    scheduledDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    intervalStage: {
      type: Number, // 1, 3, 7, or 15 days
      enum: [1, 3, 7, 15],
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    confidenceLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'unrated'],
      default: 'unrated',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Revision = models.Revision || model('Revision', RevisionSchema);

export default Revision;
