import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISearchLog extends Document {
  query: string;
  userId?: Types.ObjectId;
  resultsCount: number;
  createdAt: Date;
}

const searchLogSchema = new Schema<ISearchLog>(
  {
    query: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

searchLogSchema.index({ query: 1 });
searchLogSchema.index({ createdAt: -1 });
searchLogSchema.index({ query: 1, createdAt: -1 });

export const SearchLog = mongoose.model<ISearchLog>('SearchLog', searchLogSchema);

// ---- Unanswered Search ----

export interface IUnansweredSearch extends Document {
  query: string;
  reportedBy: Types.ObjectId[];
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

const unansweredSearchSchema = new Schema<IUnansweredSearch>(
  {
    query: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    reportedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    count: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

unansweredSearchSchema.index({ count: -1 });
unansweredSearchSchema.index({ query: 'text' });
unansweredSearchSchema.index({ createdAt: -1 });

export const UnansweredSearch = mongoose.model<IUnansweredSearch>('UnansweredSearch', unansweredSearchSchema);
