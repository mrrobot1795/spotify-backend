import axios from "axios";
import { Router } from "express";
import { stringify } from "querystring";
import jwt from "jsonwebtoken";
import {
  getTracks,
  getArtist,
  getUserSpotifyProfile,
  getUserPlaylists,
  searchTracks,
} from "../controllers/spotifyController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import SpotifyUser from "../models/User.js";
import { config } from 'dotenv';

config();

const router = Router();

const { sign, verify } = jwt;

const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const scopes = process.env.SPOTIFY_SCOPES;
const jwtSecret = process.env.JWT_SECRET;

router.get("/login", authMiddleware, (req, res) => {
  const state = sign({ userId: req.user.id }, jwtSecret, { expiresIn: "10m" });

  const authorizationUrl =
    "https://accounts.spotify.com/authorize" +
    "?response_type=code" +
    `&client_id=${encodeURIComponent(client_id)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
    `&state=${encodeURIComponent(state)}` +
    "&show_dialog=true";

  res.json({ authorizationUrl });
});

router.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (!state || !code) {
    return res
      .status(400)
      .json({ message: "State or code missing from Spotify callback" });
  }

  try {
    const decoded = verify(state, jwtSecret);
    const userId = decoded.userId;

    const user = await SpotifyUser.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const data = stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri,
    });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${client_id}:${client_secret}`
      ).toString("base64")}`,
    };

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      data,
      { headers }
    );

    user.spotifyAccessToken = response.data.access_token;
    user.spotifyRefreshToken = response.data.refresh_token;
    user.spotifyTokenExpiresAt = new Date(
      Date.now() + response.data.expires_in * 1000
    );
    await user.save();

    res.redirect(
      `http://localhost:3000/?spotifyAccessToken=${response.data.access_token}`
    );
  } catch (error) {
    console.error(
      "Spotify OAuth Error:",
      error.response?.data || error.message
    );
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired state parameter" });
    }
    res.status(500).json({ message: "Error during Spotify OAuth process" });
  }
});

router.use(authMiddleware);

router.get("/check-connection", async (req, res) => {
  try {
    const user = await SpotifyUser.findById(req.user.id);
    const connected = !!user.spotifyAccessToken && !!user.spotifyRefreshToken;
    res.json({ connected });
  } catch (error) {
    console.error("Error checking Spotify connection:", error.message);
    res.status(500).json({ message: "Error checking Spotify connection" });
  }
});

router.get("/tracks", getTracks);
router.get("/artist/:id", getArtist);
router.get("/profile", getUserSpotifyProfile);
router.get("/playlists", getUserPlaylists);
router.get("/search", authMiddleware, searchTracks);

export default router;
