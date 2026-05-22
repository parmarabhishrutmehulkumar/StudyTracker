import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
    },
    school: {
      type: String,
      required: [true, 'School name is required'],
    },
    class: {
      type: String,
      default: 'Class 10',
    },
    board: {
      type: String,
      default: 'ICSE',
    },
    parentContact: {
      type: String,
      required: [true, 'Parent contact is required'],
    },
    tuition: {
      type: Boolean,
      default: true,
    },
    studyGoal: {
      type: String,
      default: 'Score above 95% in ICSE Board Exams',
    },
    reminderTime: {
      type: String,
      default: '20:00',
    },
    subjects: {
      type: [String],
      default: [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'English',
        'History',
        'Geography',
        'Computer Science',
      ],
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = models.User || model('User', UserSchema);

export default User;
