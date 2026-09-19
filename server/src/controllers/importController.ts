import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Topic from '../models/Topic';
import Problem from '../models/Problem';
import { slugify } from '../utils/helpers';
import seedData from '../data/a2z-sheet.json';

interface SeedProblem {
  problem_id: string;
  problem_name: string;
  difficulty: string;
  leetcode?: string;
  youtube?: string;
  article?: string;
  link?: string;
}

interface SeedSubcategory {
  subcategory_id: string;
  subcategory_name: string;
  problems: SeedProblem[];
}

interface SeedSection {
  category_id: string;
  category_name: string;
  subcategories: SeedSubcategory[];
}

export const importA2ZSheet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sections: SeedSection[] = seedData as SeedSection[];
    const stats = {
      topicsImported: 0,
      topicsUpdated: 0,
      problemsImported: 0,
      problemsUpdated: 0,
      problemsSkipped: 0,
      errors: [] as string[],
    };

    let globalProblemOrder = 0;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      try {
        // Upsert topic
        const topicSlug = slugify(section.category_name);
        const subcategories = section.subcategories.map((sub, idx) => ({
          name: sub.subcategory_name.replace(/\s+/g, ' ').trim(),
          slug: slugify(sub.subcategory_name),
          order: idx,
          sourceId: sub.subcategory_id,
        }));

        const totalProblems = section.subcategories.reduce(
          (sum, sub) => sum + sub.problems.length,
          0
        );

        const existingTopic = await Topic.findOne({ sourceId: section.category_id });

        let topic;
        if (existingTopic) {
          topic = await Topic.findOneAndUpdate(
            { sourceId: section.category_id },
            {
              $set: {
                name: section.category_name,
                slug: topicSlug,
                order: i,
                subcategories,
                problemCount: totalProblems,
              },
            },
            { new: true }
          );
          stats.topicsUpdated++;
        } else {
          topic = await Topic.create({
            name: section.category_name,
            slug: topicSlug,
            order: i,
            sourceId: section.category_id,
            subcategories,
            problemCount: totalProblems,
          });
          stats.topicsImported++;
        }

        // Import problems for this topic
        for (const sub of section.subcategories) {
          const subSlug = slugify(sub.subcategory_name);

          for (const prob of sub.problems) {
            try {
              globalProblemOrder++;

              // Normalize difficulty
              let difficulty = (prob.difficulty || 'Medium').trim();
              difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
              if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
                difficulty = 'Medium';
              }

              // Clean URLs (remove $undefined)
              const leetcode = prob.leetcode && prob.leetcode !== '$undefined' ? prob.leetcode : undefined;
              const youtube = prob.youtube && prob.youtube !== '$undefined' ? prob.youtube : undefined;
              const article = prob.article && prob.article !== '$undefined' ? prob.article : undefined;

              const existingProblem = await Problem.findOne({ sourceId: prob.problem_id });

              if (existingProblem) {
                await Problem.findOneAndUpdate(
                  { sourceId: prob.problem_id },
                  {
                    $set: {
                      topicId: topic!._id,
                      subcategorySlug: subSlug,
                      title: prob.problem_name,
                      slug: slugify(prob.problem_name),
                      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
                      order: globalProblemOrder,
                      externalUrls: { leetcode, youtube, article },
                    },
                  }
                );
                stats.problemsUpdated++;
              } else {
                await Problem.create({
                  topicId: topic!._id,
                  subcategorySlug: subSlug,
                  title: prob.problem_name,
                  slug: slugify(prob.problem_name),
                  difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
                  order: globalProblemOrder,
                  sourceId: prob.problem_id,
                  externalUrls: { leetcode, youtube, article },
                  tags: [],
                });
                stats.problemsImported++;
              }
            } catch (probErr: any) {
              stats.errors.push(`Problem "${prob.problem_name}": ${probErr.message}`);
              stats.problemsSkipped++;
            }
          }
        }
      } catch (topicErr: any) {
        stats.errors.push(`Topic "${section.category_name}": ${topicErr.message}`);
      }
    }

    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getImportStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topicsCount = await Topic.countDocuments();
    const problemsCount = await Problem.countDocuments();
    const difficultyStats = await Problem.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);
    const topics = await Topic.find().sort({ order: 1 }).select('name problemCount');

    res.json({
      success: true,
      data: {
        topicsCount,
        problemsCount,
        difficultyBreakdown: difficultyStats,
        topics,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
