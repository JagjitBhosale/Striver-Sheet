import mongoose, { Schema, Document, Types } from 'mongoose';

interface ISolutionSection {
  content: string; // HTML from TipTap
  code: string;
  language: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface IProblemNote extends Document {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  keyIdea: string;
  patternUsed: string;
  thingsToRemember: string;
  commonMistake: string;
  myMistake: string;
  interviewTrick: string;
  revisionNote: string;
  brute: ISolutionSection;
  better: ISolutionSection;
  optimal: ISolutionSection;
  personalTags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const solutionSectionSchema = new Schema({
  content: { type: String, default: '' },
  code: { type: String, default: '' },
  language: { type: String, default: 'cpp' },
  timeComplexity: { type: String, default: '' },
  spaceComplexity: { type: String, default: '' },
}, { _id: false });

const problemNoteSchema = new Schema<IProblemNote>({
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
  keyIdea: { type: String, default: '' },
  patternUsed: { type: String, default: '' },
  thingsToRemember: { type: String, default: '' },
  commonMistake: { type: String, default: '' },
  myMistake: { type: String, default: '' },
  interviewTrick: { type: String, default: '' },
  revisionNote: { type: String, default: '' },
  brute: { type: solutionSectionSchema, default: () => ({}) },
  better: { type: solutionSectionSchema, default: () => ({}) },
  optimal: { type: solutionSectionSchema, default: () => ({}) },
  personalTags: [{ type: String }],
}, { timestamps: true });

problemNoteSchema.index({ userId: 1, problemId: 1 }, { unique: true });
problemNoteSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model<IProblemNote>('ProblemNote', problemNoteSchema);
