import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  description: string;
  category: Types.ObjectId;
  tags: string[];
  author: Types.ObjectId;
  upvotes: number;
  downvotes: number;
  voteScore: number;
  viewCount: number;
  clickCount: number;
  searchClickCount: number;
  answerCount: number;
  trendingScore: number;
  status: 'open' | 'closed' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 5,
        message: 'Cannot have more than 5 tags',
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voteScore: { type: Number, default: 0 }, // upvotes - downvotes
    viewCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    searchClickCount: { type: Number, default: 0 },
    answerCount: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 }, // computed score for recommendation
    status: {
      type: String,
      enum: ['open', 'closed', 'deleted'],
      default: 'open',
    },
  },
  { timestamps: true }
);

// Full-text search index
questionSchema.index({ title: 'text', description: 'text', tags: 'text' }, {
  weights: { title: 10, tags: 5, description: 1 },
  name: 'question_text_search',
});

// Performance indexes
questionSchema.index({ category: 1, status: 1 });
questionSchema.index({ author: 1 });
questionSchema.index({ trendingScore: -1 });
questionSchema.index({ voteScore: -1 });
questionSchema.index({ viewCount: -1 });
questionSchema.index({ searchClickCount: -1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ status: 1, createdAt: -1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
