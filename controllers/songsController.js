import Song from "../models/song.js";
import { Types } from "mongoose";

export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (error) {
    console.error("Get Songs Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const playSong = async (req, res) => {
  const songId = req.params.id;

  if (!Types.ObjectId.isValid(songId)) {
    return res.status(400).json({ message: "Invalid song ID" });
  }

  try {
    const song = await Song.findByIdAndUpdate(
      songId,
      { $inc: { timesPlayed: 1 } },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json({ message: `Played ${song.title} - ${song.artist}`, song });
  } catch (error) {
    console.error("Play Song Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
