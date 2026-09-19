import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import cloudinary from '../config/cloudinary';
import Image from '../models/Image';
import { Readable } from 'stream';

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const { problemId, noteSection } = req.body;

    // Upload to Cloudinary using stream
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `dsa-tracker/${req.user._id}${problemId ? `/${problemId}` : ''}`,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const stream = Readable.from(req.file!.buffer);
      stream.pipe(uploadStream);
    });

    // Save metadata to MongoDB
    const image = await Image.create({
      userId: req.user._id,
      problemId: problemId || undefined,
      noteSection: noteSection || 'general',
      cloudinaryPublicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    });

    res.status(201).json({
      success: true,
      data: {
        id: image._id,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const image = await Image.findOne({ _id: req.params.id, userId: req.user._id });
    if (!image) {
      res.status(404).json({ message: 'Image not found' });
      return;
    }

    await cloudinary.uploader.destroy(image.cloudinaryPublicId);
    await Image.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Image deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { problemId, page = '1', limit = '20' } = req.query;
    const filter: any = { userId: req.user._id };
    if (problemId) filter.problemId = problemId;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const images = await Image.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate({
        path: 'problemId',
        select: 'title slug',
        populate: { path: 'topicId', select: 'name slug' },
      });

    const total = await Image.countDocuments(filter);

    res.json({
      success: true,
      data: images,
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
