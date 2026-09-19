import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Mistake from '../models/Mistake';

export const getMistakes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const mistakes = await Mistake.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate({
        path: 'problemId',
        select: 'title slug difficulty',
        populate: { path: 'topicId', select: 'name slug' },
      });

    const total = await Mistake.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: mistakes,
      pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total, pages: Math.ceil(total / parseInt(limit as string)) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMistakeByProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mistake = await Mistake.findOne({
      userId: req.user._id,
      problemId: req.params.problemId,
    });
    res.json({ success: true, data: mistake });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const upsertMistake = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mistake = await Mistake.findOneAndUpdate(
      { userId: req.user._id, problemId: req.params.problemId },
      { $set: { ...req.body, userId: req.user._id, problemId: req.params.problemId } },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: mistake });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMistake = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Mistake.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Mistake deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
