import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IImage extends Document {
  userId: Types.ObjectId;
  problemId?: Types.ObjectId;
  noteSection?: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  size: number;
  createdAt: Date;
}

const imageSchema = new Schema<IImage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
  },
  noteSection: {
    type: String,
    enum: ['keyIdea', 'brute', 'better', 'optimal', 'mistake', 'general'],
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  secureUrl: {
    type: String,
    required: true,
  },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  format: { type: String, default: '' },
  size: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

imageSchema.index({ userId: 1, createdAt: -1 });
imageSchema.index({ userId: 1, problemId: 1 });

export default mongoose.model<IImage>('Image', imageSchema);
