import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Problem from '../models/Problem';
import ProblemNote from '../models/ProblemNote';
import Progress from '../models/Progress';
import Mistake from '../models/Mistake';

export const globalSearch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, type, difficulty, status } = req.query;

    if (!q || (q as string).trim().length < 2) {
      res.json({ success: true, data: { problems: [], notes: [], mistakes: [] } });
      return;
    }

    const searchRegex = new RegExp(q as string, 'i');

    // Search problems
    const problemFilter: any = {
      $or: [
        { title: searchRegex },
        { tags: searchRegex },
      ],
    };
    if (difficulty) problemFilter.difficulty = difficulty;

    let problems = await Problem.find(problemFilter)
      .limit(20)
      .populate('topicId', 'name slug');

    // Filter by status if requested
    if (status) {
      const progressEntries = await Progress.find({
        userId: req.user._id,
        status: status as string,
        problemId: { $in: problems.map((p) => p._id) },
      } as any);
      const progressProblemIds = new Set(progressEntries.map((p: any) => p.problemId.toString()));
      problems = problems.filter((p) => progressProblemIds.has(p._id.toString()));
    }

    // Search notes
    const notes = await ProblemNote.find({
      userId: req.user._id,
      $or: [
        { keyIdea: searchRegex },
        { patternUsed: searchRegex },
        { 'brute.content': searchRegex },
        { 'better.content': searchRegex },
        { 'optimal.content': searchRegex },
        { personalTags: searchRegex },
      ],
    })
      .limit(10)
      .populate({
        path: 'problemId',
        select: 'title slug difficulty',
        populate: { path: 'topicId', select: 'name slug' },
      });

    // Search mistakes
    const mistakes = await Mistake.find({
      userId: req.user._id,
      $or: [
        { mistake: searchRegex },
        { lesson: searchRegex },
        { correctApproach: searchRegex },
      ],
    })
      .limit(10)
      .populate({
        path: 'problemId',
        select: 'title slug difficulty',
        populate: { path: 'topicId', select: 'name slug' },
      });

    res.json({ success: true, data: { problems, notes, mistakes } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
