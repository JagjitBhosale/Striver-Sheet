import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMistake extends Document {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  mistake: string;
  why: string;
  correctApproach: string;
  lesson: string;
  code: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const mistakeSchema = new Schema<IMistake>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  mistake: { type: String, default: '' },
  why: { type: String, default: '' },
  correctApproach: { type: String, default: '' },
  lesson: { type: String, default: '' },
  code: { type: String, default: '' },
  images: [{ type: String }],
}, { timestamps: true });

mistakeSchema.index({ userId: 1, problemId: 1 });
mistakeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IMistake>('Mistake', mistakeSchema);
