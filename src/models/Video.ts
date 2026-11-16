import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  url: string;
  duration: number;
  thumbnailUrl: string;
  channelId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 0,
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  channelId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

export const Video = mongoose.models.Video || mongoose.model<IVideo>('Video', videoSchema);