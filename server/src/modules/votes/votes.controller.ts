import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Vote } from '../../models/Vote';
import { Question } from '../../models/Question';
import { Answer } from '../../models/Answer';
import { AppError } from '../../middlewares/error.middleware';
import { successResponse } from '../../utils/helpers';

type TargetType = 'question' | 'answer';

export const castVote = (targetType: TargetType) =>
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const value: 1 | -1 = req.body.value;
    const userId = req.user!.userId;

    // Fetch target
    const target = targetType === 'question'
      ? await Question.findById(id)
      : await Answer.findById(id);
    if (!target) throw new AppError(`${targetType} not found`, 404);

    // Prevent self-voting
    if (target.author?.toString() === userId) {
      throw new AppError('You cannot vote on your own content', 403);
    }

    const existing = await Vote.findOne({ userId, targetId: id, targetType });

    let upDelta = 0;
    let downDelta = 0;
    let action: 'added' | 'removed' | 'changed';

    if (existing) {
      if (existing.value === value) {
        // Same vote → remove (toggle off)
        await existing.deleteOne();
        if (value === 1) upDelta = -1;
        else downDelta = -1;
        action = 'removed';
      } else {
        // Different vote → change
        if (value === 1) { upDelta = 1; downDelta = -1; }
        else { upDelta = -1; downDelta = 1; }
        existing.value = value;
        await existing.save();
        action = 'changed';
      }
    } else {
      await Vote.create({ userId, targetId: id, targetType, value });
      if (value === 1) upDelta = 1;
      else downDelta = 1;
      action = 'added';
    }

    // Apply deltas using separate updates per field to avoid $inc conflict
    const oid = new mongoose.Types.ObjectId(id);
    if (targetType === 'question') {
      if (upDelta !== 0) await Question.updateOne({ _id: oid }, { $inc: { upvotes: upDelta } });
      if (downDelta !== 0) await Question.updateOne({ _id: oid }, { $inc: { downvotes: downDelta } });
      const updated = await Question.findById(oid);
      if (updated) await Question.updateOne({ _id: oid }, { $set: { voteScore: updated.upvotes - updated.downvotes } });
    } else {
      if (upDelta !== 0) await Answer.updateOne({ _id: oid }, { $inc: { upvotes: upDelta } });
      if (downDelta !== 0) await Answer.updateOne({ _id: oid }, { $inc: { downvotes: downDelta } });
      const updated = await Answer.findById(oid);
      if (updated) await Answer.updateOne({ _id: oid }, { $set: { voteScore: updated.upvotes - updated.downvotes } });
    }

    const final = targetType === 'question'
      ? await Question.findById(oid).lean()
      : await Answer.findById(oid).lean();

    res.json(
      successResponse({ action, upvotes: final?.upvotes, downvotes: final?.downvotes, voteScore: final?.voteScore })
    );
  };

export const getUserVote = async (req: Request, res: Response): Promise<void> => {
  const { targetId, targetType } = req.params as { targetId: string; targetType: TargetType };
  const vote = await Vote.findOne({ userId: req.user!.userId, targetId, targetType });
  res.json(successResponse({ value: vote?.value ?? 0 }));
};
