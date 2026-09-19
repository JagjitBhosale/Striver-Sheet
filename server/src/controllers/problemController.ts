import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Problem from '../models/Problem';

export const getProblems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topicId, difficulty, search, page = '1', limit = '50' } = req.query;
    const filter: any = {};

    if (topicId) filter.topicId = topicId;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const problems = await Problem.find(filter)
      .sort({ order: 1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('topicId', 'name slug');

    const total = await Problem.countDocuments(filter);

    res.json({
      success: true,
      data: problems,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProblemById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findById(req.params.id).populate('topicId', 'name slug');
    if (!problem) {
      res.status(404).json({ message: 'Problem not found' });
      return;
    }
    res.json({ success: true, data: problem });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
