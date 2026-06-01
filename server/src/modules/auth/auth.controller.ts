import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/error.middleware';
import { successResponse } from '../../utils/helpers';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new AppError('Username or email already taken', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, passwordHash });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  res.status(201).json(
    successResponse(
      { user, accessToken },
      'Account created successfully'
    )
  );
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  res.json(successResponse({ user, accessToken }, 'Login successful'));
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken');
  res.json(successResponse(null, 'Logged out successfully'));
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Refresh token missing', 401);

  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.userId);
  if (!user) throw new AppError('User not found', 404);

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
  res.json(successResponse({ accessToken: newAccessToken }, 'Token refreshed'));
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.userId);
  if (!user) throw new AppError('User not found', 404);
  res.json(successResponse(user));
};
