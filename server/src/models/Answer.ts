import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAnswer extends Document {
  questionId: Types.ObjectId;
  content: string;
  author: Types.ObjectId;
  upvotes: number;
  downvotes: number;
  voteScore: number;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Answer content is required'],
      trim: true,
      minlength: [20, 'Answer must be at least 20 characters'],
      maxlength: [20000, 'Answer cannot exceed 20000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voteScore: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

answerSchema.index({ questionId: 1, voteScore: -1 });
answerSchema.index({ author: 1 });
answerSchema.index({ createdAt: -1 });

export const Answer = mongoose.model<IAnswer>('Answer', answerSchema);
