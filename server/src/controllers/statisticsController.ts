import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Progress from '../models/Progress';
import Problem from '../models/Problem';
import ProblemNote from '../models/ProblemNote';
import Image from '../models/Image';
import DailyActivity from '../models/DailyActivity';
import Topic from '../models/Topic';

export const getStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    // Total problems
    const totalProblems = await Problem.countDocuments();

    // Progress stats
    const progressStats = await Progress.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts: any = { not_started: 0, attempted: 0, solved: 0, revision_required: 0 };
    progressStats.forEach((s) => { statusCounts[s._id] = s.count; });

    // Difficulty breakdown
    const solvedProblemIds = (
      await Progress.find({ userId, status: 'solved' }).select('problemId')
    ).map((p) => p.problemId);

    const difficultyStats = await Problem.aggregate([
      { $match: { _id: { $in: solvedProblemIds } } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    const difficultyCounts: any = { Easy: 0, Medium: 0, Hard: 0 };
    difficultyStats.forEach((d) => { difficultyCounts[d._id] = d.count; });

    // Total difficulty distribution
    const totalDifficultyStats = await Problem.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);
    const totalDifficulty: any = { Easy: 0, Medium: 0, Hard: 0 };
    totalDifficultyStats.forEach((d) => { totalDifficulty[d._id] = d.count; });

    // Topic-wise progress
    const topics = await Topic.find().sort({ order: 1 });
    const topicProgress = await Promise.all(
      topics.map(async (topic) => {
        const topicProblems = await Problem.find({ topicId: topic._id });
        const topicProblemIds = topicProblems.map((p) => p._id);
        const solved = await Progress.countDocuments({
          userId,
          problemId: { $in: topicProblemIds },
          status: 'solved',
        });

        // Difficulty breakdown per topic
        const topicDifficultyBreakdown: any = { Easy: 0, Medium: 0, Hard: 0 };
        topicProblems.forEach((p) => {
          const diff = p.difficulty || 'Medium';
          topicDifficultyBreakdown[diff] = (topicDifficultyBreakdown[diff] || 0) + 1;
        });

        return {
          topicId: topic._id,
          name: topic.name,
          total: topicProblems.length,
          solved,
          percentage: topicProblems.length > 0 ? Math.round((solved / topicProblems.length) * 100) : 0,
          difficulty: topicDifficultyBreakdown,
        };
      })
    );

    // Notes and images count
    const notesCount = await ProblemNote.countDocuments({ userId });
    const imagesCount = await Image.countDocuments({ userId });

    // Streak calculation
    const activities = await DailyActivity.find({ userId })
      .sort({ date: -1 })
      .limit(365);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    // Calculate current streak
    const sortedDates = activities
      .filter((a) => a.problemsSolved > 0 || a.revisionsCompleted > 0)
      .map((a) => a.date)
      .sort()
      .reverse();

    if (sortedDates.length > 0) {
      const checkDate = new Date(today);
      for (const dateStr of sortedDates) {
        const formatted = checkDate.toISOString().split('T')[0];
        if (dateStr === formatted) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate longest streak
      let streak = 1;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const curr = new Date(sortedDates[i]);
        const next = new Date(sortedDates[i + 1]);
        const diff = (curr.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          streak++;
        } else {
          longestStreak = Math.max(longestStreak, streak);
          streak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, streak);
    }

    // Weekly and monthly solved
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const weeklyActivities = activities.filter(
      (a) => new Date(a.date) >= weekAgo
    );
    const monthlyActivities = activities.filter(
      (a) => new Date(a.date) >= monthAgo
    );

    const weeklySolved = weeklyActivities.reduce((sum, a) => sum + a.problemsSolved, 0);
    const monthlySolved = monthlyActivities.reduce((sum, a) => sum + a.problemsSolved, 0);

    res.json({
      success: true,
      data: {
        totalProblems,
        totalSolved: statusCounts.solved,
        totalAttempted: statusCounts.attempted,
        totalUnsolved: totalProblems - statusCounts.solved - statusCounts.attempted,
        completionPercentage: totalProblems > 0 ? Math.round((statusCounts.solved / totalProblems) * 100) : 0,
        difficulty: { solved: difficultyCounts, total: totalDifficulty },
        topicProgress,
        weeklySolved,
        monthlySolved,
        currentStreak,
        longestStreak,
        totalActiveDays: sortedDates.length,
        notesCount,
        imagesCount,
        dailyActivity: activities,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
