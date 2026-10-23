import mongoose, { Schema, Document } from 'mongoose';

export interface IChannel extends Document {
  userId: string;
  youtubeChannelId: string;
  youtubeChannelName: string;
  accessToken: string;
  refreshToken?: string;
  isActive: boolean;
  createdAt: Date;
}

const channelSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  youtubeChannelId: {
    type: String,
    required: true
  },
  youtubeChannelName: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Channel = mongoose.model<IChannel>('Channel', channelSchema);