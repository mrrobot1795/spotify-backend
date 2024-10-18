import { Schema, model } from 'mongoose';

const SongSchema = new Schema(
  {
    spotifyId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    timesPlayed: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'SpotifyUser',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default model('Song', SongSchema);
