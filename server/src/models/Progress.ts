import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProgress extends Document {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  status: 'not_started' | 'attempted' | 'solved' | 'revision_required';
  solvedAt?: Date;
  bookmarked: boolean;
  bookmarkCategories: string[];
  revisionStatus: 'not_revised' | 'revision_1' | 'revision_2' | 'revision_3' | 'mastered';
  lastRevised?: Date;
  nextRevision?: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>({
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
  status: {
    type: String,
    enum: ['not_started', 'attempted', 'solved', 'revision_required'],
    default: 'not_started',
  },
  solvedAt: Date,
  bookmarked: {
    type: Boolean,
    default: false,
  },
  bookmarkCategories: [{
    type: String,
    enum: ['important', 'revise', 'interview', 'weak_topic', 'must_solve'],
  }],
  revisionStatus: {
    type: String,
    enum: ['not_revised', 'revision_1', 'revision_2', 'revision_3', 'mastered'],
    default: 'not_revised',
  },
  lastRevised: Date,
  nextRevision: Date,
}, { timestamps: true });

progressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
progressSchema.index({ userId: 1, status: 1 });
progressSchema.index({ userId: 1, bookmarked: 1 });
progressSchema.index({ userId: 1, nextRevision: 1 });

export default mongoose.model<IProgress>('Progress', progressSchema);
