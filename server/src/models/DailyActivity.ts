import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDailyActivity extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  problemsSolved: number;
  notesCreated: number;
  revisionsCompleted: number;
}

const dailyActivitySchema = new Schema<IDailyActivity>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  problemsSolved: { type: Number, default: 0 },
  notesCreated: { type: Number, default: 0 },
  revisionsCompleted: { type: Number, default: 0 },
});

dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });
dailyActivitySchema.index({ userId: 1, date: -1 });

export default mongoose.model<IDailyActivity>('DailyActivity', dailyActivitySchema);
