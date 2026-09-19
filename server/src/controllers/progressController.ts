import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Progress from '../models/Progress';
import DailyActivity from '../models/DailyActivity';
import Problem from '../models/Problem';
import { getTodayDate } from '../utils/helpers';

export const getProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const progress = await Progress.find({ userId: req.user._id });
    res.json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProgressByProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let progress = await Progress.findOne({
      userId: req.user._id,
      problemId: req.params.problemId,
    });
    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        problemId: req.params.problemId,
        status: 'not_started',
      });
    }
    res.json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, bookmarked, bookmarkCategories, revisionStatus, nextRevision } = req.body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (bookmarked !== undefined) updateData.bookmarked = bookmarked;
    if (bookmarkCategories !== undefined) updateData.bookmarkCategories = bookmarkCategories;
    if (revisionStatus !== undefined) updateData.revisionStatus = revisionStatus;
    if (nextRevision !== undefined) updateData.nextRevision = nextRevision;

    // If marking as solved, set solvedAt and track daily activity
    if (status === 'solved') {
      updateData.solvedAt = new Date();
      await DailyActivity.findOneAndUpdate(
        { userId: req.user._id, date: getTodayDate() },
        { $inc: { problemsSolved: 1 } },
        { upsert: true }
      );
    }

    // If updating revision status, set lastRevised
    if (revisionStatus && revisionStatus !== 'not_revised') {
      updateData.lastRevised = new Date();
      await DailyActivity.findOneAndUpdate(
        { userId: req.user._id, date: getTodayDate() },
        { $inc: { revisionsCompleted: 1 } },
        { upsert: true }
      );
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, problemId: req.params.problemId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter: any = { userId: req.user._id, bookmarked: true };
    if (category) filter.bookmarkCategories = category;

    const bookmarks = await Progress.find(filter).populate({
      path: 'problemId',
      populate: { path: 'topicId', select: 'name slug' },
    });
    res.json({ success: true, data: bookmarks });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRevisionQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [overdue, todayRevisions, upcoming] = await Promise.all([
      Progress.find({
        userId: req.user._id,
        nextRevision: { $lt: today },
        revisionStatus: { $ne: 'mastered' },
      }).populate({ path: 'problemId', populate: { path: 'topicId', select: 'name slug' } }),

      Progress.find({
        userId: req.user._id,
        nextRevision: { $gte: today, $lt: tomorrow },
      }).populate({ path: 'problemId', populate: { path: 'topicId', select: 'name slug' } }),

      Progress.find({
        userId: req.user._id,
        nextRevision: { $gte: tomorrow, $lte: nextWeek },
      }).populate({ path: 'problemId', populate: { path: 'topicId', select: 'name slug' } }),
    ]);

    res.json({ success: true, data: { overdue, today: todayRevisions, upcoming } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
