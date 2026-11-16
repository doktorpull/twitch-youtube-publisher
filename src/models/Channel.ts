import mongoose, { Schema, Document } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  twitchChannelId: string;
  youtubeChannelId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>({
  name: {
    type: String,
    required: true,
  },
  twitchChannelId: {
    type: String,
    required: true,
  },
  youtubeChannelId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Channel = mongoose.models.Channel || mongoose.model<IChannel>('Channel', channelSchema);