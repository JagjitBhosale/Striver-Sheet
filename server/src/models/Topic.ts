import mongoose, { Schema, Document } from 'mongoose';

export interface ISubcategory {
  name: string;
  slug: string;
  order: number;
  sourceId: string;
}

export interface ITopic extends Document {
  name: string;
  slug: string;
  order: number;
  description?: string;
  sourceId: string;
  subcategories: ISubcategory[];
  problemCount: number;
}

const subcategorySchema = new Schema<ISubcategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  order: { type: Number, required: true },
  sourceId: { type: String, required: true },
}, { _id: true });

const topicSchema = new Schema<ITopic>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  order: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  sourceId: {
    type: String,
    required: true,
    unique: true,
  },
  subcategories: [subcategorySchema],
  problemCount: {
    type: Number,
    default: 0,
  },
});

topicSchema.index({ order: 1 });
topicSchema.index({ sourceId: 1 });

export default mongoose.model<ITopic>('Topic', topicSchema);
