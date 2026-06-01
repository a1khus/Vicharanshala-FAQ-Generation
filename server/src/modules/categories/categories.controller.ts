import { Request, Response } from 'express';
import { Category } from '../../models/Category';
import { AppError } from '../../middlewares/error.middleware';
import { successResponse, slugify } from '../../utils/helpers';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.find().sort({ questionCount: -1 }).lean();
  res.json(successResponse(categories));
};

export const getCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw new AppError('Category not found', 404);
  res.json(successResponse(category));
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description, icon, color } = req.body;
  const slug = slugify(name);

  const existing = await Category.findOne({ slug });
  if (existing) throw new AppError('Category with this name already exists', 409);

  const category = await Category.create({ name, slug, description, icon, color });
  res.status(201).json(successResponse(category, 'Category created'));
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description, icon, color } = req.body;
  const update: Record<string, string> = {};

  if (name) { update.name = name; update.slug = slugify(name); }
  if (description !== undefined) update.description = description;
  if (icon) update.icon = icon;
  if (color) update.color = color;

  const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!category) throw new AppError('Category not found', 404);

  res.json(successResponse(category, 'Category updated'));
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  res.json(successResponse(null, 'Category deleted'));
};
