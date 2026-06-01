import { Request, Response } from 'express';
import { Answer } from '../../models/Answer';
import { Question } from '../../models/Question';
import { User } from '../../models/User';
import { AppError } from '../../middlewares/error.middleware';
import { getPagination, buildPaginationMeta, successResponse } from '../../utils/helpers';

// ─── GET answers for a question ───────────────────────────────────────────────
export const getAnswers = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = getPagination(req.query);

  const [answers, total] = await Promise.all([
    Answer.find({ questionId: req.params.questionId })
      .sort({ isAccepted: -1, voteScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar reputation')
      .lean(),
    Answer.countDocuments({ questionId: req.params.questionId }),
  ]);

  res.json(successResponse(answers, 'Answers fetched', buildPaginationMeta(total, page, limit)));
};

// ─── POST create answer ───────────────────────────────────────────────────────
export const createAnswer = async (req: Request, res: Response): Promise<void> => {
  const { questionId, content } = req.body;
  const authorId = req.user!.userId;

  const question = await Question.findById(questionId);
  if (!question || question.status !== 'open') {
    throw new AppError('Question not found or is closed', 404);
  }

  const answer = await Answer.create({ questionId, content, author: authorId });

  await Promise.all([
    Question.findByIdAndUpdate(questionId, { $inc: { answerCount: 1 } }),
    User.findByIdAndUpdate(authorId, { $inc: { answerCount: 1 } }),
  ]);

  const populated = await answer.populate('author', 'username avatar reputation');
  res.status(201).json(successResponse(populated, 'Answer posted'));
};

// ─── PATCH update answer ──────────────────────────────────────────────────────
export const updateAnswer = async (req: Request, res: Response): Promise<void> => {
  const answer = await Answer.findById(req.params.id);
  if (!answer) throw new AppError('Answer not found', 404);

  const isOwner = answer.author.toString() === req.user!.userId;
  const isMod = ['moderator', 'admin'].includes(req.user!.role);
  if (!isOwner && !isMod) throw new AppError('Forbidden', 403);

  if (req.body.content) answer.content = req.body.content;
  await answer.save();

  res.json(successResponse(answer, 'Answer updated'));
};

// ─── DELETE answer ────────────────────────────────────────────────────────────
export const deleteAnswer = async (req: Request, res: Response): Promise<void> => {
  const answer = await Answer.findById(req.params.id);
  if (!answer) throw new AppError('Answer not found', 404);

  const isOwner = answer.author.toString() === req.user!.userId;
  const isMod = ['moderator', 'admin'].includes(req.user!.role);
  if (!isOwner && !isMod) throw new AppError('Forbidden', 403);

  await answer.deleteOne();
  await Question.findByIdAndUpdate(answer.questionId, { $inc: { answerCount: -1 } });

  res.json(successResponse(null, 'Answer deleted'));
};

// ─── POST accept answer ───────────────────────────────────────────────────────
export const acceptAnswer = async (req: Request, res: Response): Promise<void> => {
  const answer = await Answer.findById(req.params.id).populate('questionId');
  if (!answer) throw new AppError('Answer not found', 404);

  const question = await Question.findById(answer.questionId);
  if (!question) throw new AppError('Question not found', 404);

  if (question.author.toString() !== req.user!.userId) {
    throw new AppError('Only the question author can accept an answer', 403);
  }

  // Unaccept previous
  await Answer.updateMany({ questionId: answer.questionId }, { isAccepted: false });
  answer.isAccepted = true;
  await answer.save();

  res.json(successResponse(answer, 'Answer accepted'));
};
