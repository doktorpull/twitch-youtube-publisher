import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  userId: string;
  twitchUrl: string;
  youtubeUrl?: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'uploaded' | 'failed';
  youtubeVideoId?: string;
  channelId: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  twitchUrl: {
    type: String,
    required: true
  },
  youtubeUrl: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'uploaded', 'failed'],
    default: 'pending'
  },
  youtubeVideoId: {
    type: String
  },
  channelId: {
    type: String,
    required: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

export const Video = mongoose.model<IVideo>('Video', videoSchema);