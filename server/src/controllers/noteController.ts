import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ProblemNote from '../models/ProblemNote';
import DailyActivity from '../models/DailyActivity';
import { getTodayDate } from '../utils/helpers';

export const getNoteByProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let note = await ProblemNote.findOne({
      userId: req.user._id,
      problemId: req.params.problemId,
    });

    if (!note) {
      // Return empty note structure
      res.json({
        success: true,
        data: null,
      });
      return;
    }

    res.json({ success: true, data: note });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updateFields = req.body;
    
    const note = await ProblemNote.findOneAndUpdate(
      { userId: req.user._id, problemId: req.params.problemId },
      { $set: { ...updateFields, userId: req.user._id, problemId: req.params.problemId } },
      { new: true, upsert: true }
    );

    // Track daily activity for note creation
    await DailyActivity.findOneAndUpdate(
      { userId: req.user._id, date: getTodayDate() },
      { $inc: { notesCreated: 1 } },
      { upsert: true }
    );

    res.json({ success: true, data: note });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hasImages, hasCode, hasBrute, hasBetter, hasOptimal, page = '1', limit = '20' } = req.query;
    const filter: any = { userId: req.user._id };

    // Filter out empty notes
    filter.$or = [
      { keyIdea: { $ne: '' } },
      { 'brute.content': { $ne: '' } },
      { 'better.content': { $ne: '' } },
      { 'optimal.content': { $ne: '' } },
      { 'brute.code': { $ne: '' } },
      { 'better.code': { $ne: '' } },
      { 'optimal.code': { $ne: '' } },
    ];

    if (hasBrute === 'true') filter['brute.content'] = { $ne: '' };
    if (hasBetter === 'true') filter['better.content'] = { $ne: '' };
    if (hasOptimal === 'true') filter['optimal.content'] = { $ne: '' };
    if (hasCode === 'true') {
      filter.$or = [
        { 'brute.code': { $ne: '' } },
        { 'better.code': { $ne: '' } },
        { 'optimal.code': { $ne: '' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const notes = await ProblemNote.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate({
        path: 'problemId',
        populate: { path: 'topicId', select: 'name slug' },
      });

    const total = await ProblemNote.countDocuments(filter);

    res.json({
      success: true,
      data: notes,
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
