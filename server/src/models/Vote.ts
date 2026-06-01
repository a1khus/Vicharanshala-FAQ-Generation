import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVote extends Document {
  userId: Types.ObjectId;
  targetId: Types.ObjectId;
  targetType: 'question' | 'answer';
  value: 1 | -1;
  createdAt: Date;
}

const voteSchema = new Schema<IVote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ['question', 'answer'],
      required: true,
    },
    value: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  { timestamps: true }
);

// One vote per user per target
voteSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
voteSchema.index({ targetId: 1, targetType: 1 });

export const Vote = mongoose.model<IVote>('Vote', voteSchema);
