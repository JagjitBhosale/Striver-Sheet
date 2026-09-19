import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Topic from '../models/Topic';
import Problem from '../models/Problem';

export const getTopics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topics = await Topic.find().sort({ order: 1 });
    res.json({ success: true, data: topics });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopicById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    res.json({ success: true, data: topic });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopicProblems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problems = await Problem.find({ topicId: req.params.id }).sort({ order: 1 });
    res.json({ success: true, data: problems });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
