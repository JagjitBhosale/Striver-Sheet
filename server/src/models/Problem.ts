import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProblem extends Document {
  topicId: Types.ObjectId;
  subcategorySlug: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  order: number;
  sourceId: string;
  externalUrls: {
    leetcode?: string;
    youtube?: string;
    article?: string;
    gfg?: string;
    codingNinjas?: string;
  };
  tags: string[];
}

const problemSchema = new Schema<IProblem>({
  topicId: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  subcategorySlug: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  order: {
    type: Number,
    required: true,
  },
  sourceId: {
    type: String,
    required: true,
    unique: true,
  },
  externalUrls: {
    leetcode: String,
    youtube: String,
    article: String,
    gfg: String,
    codingNinjas: String,
  },
  tags: [{ type: String }],
});

problemSchema.index({ topicId: 1, order: 1 });
problemSchema.index({ sourceId: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ title: 'text', tags: 'text' });

export default mongoose.model<IProblem>('Problem', problemSchema);
