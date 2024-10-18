// services/spotifyService.js

import axios from "axios";
import { stringify } from "qs";

const { post, get } = axios;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const tokenUrl = "https://accounts.spotify.com/api/token";

export const refreshSpotifyToken = async (user) => {
  const data = stringify({
    grant_type: "refresh_token",
    refresh_token: user.spotifyRefreshToken,
  });

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${Buffer.from(
      `${client_id}:${client_secret}`
    ).toString("base64")}`,
  };

  try {
    const response = await post(tokenUrl, data, { headers });

    user.spotifyAccessToken = response.data.access_token;
    if (response.data.refresh_token) {
      user.spotifyRefreshToken = response.data.refresh_token;
    }
    user.spotifyTokenExpiresAt = new Date(
      Date.now() + response.data.expires_in * 1000
    );
    await user.save();

    return user.spotifyAccessToken;
  } catch (error) {
    console.error(
      "Error refreshing Spotify token:",
      error.response?.data || error.message
    );
    throw new Error("Unable to refresh Spotify token");
  }
};

export const spotifyApiRequest = async (endpoint, user) => {
  const retryWithNewToken = async () => {
    await refreshSpotifyToken(user);

    const headers = {
      Authorization: `Bearer ${user.spotifyAccessToken}`,
    };

    try {
      const response = await get(
        `https://api.spotify.com/v1/${endpoint}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error after retrying with refreshed token on endpoint ${endpoint}:`,
        error.response?.data || error.message
      );
      throw new Error(
        "Spotify API request failed after retrying with a refreshed token"
      );
    }
  };

  if (!user.spotifyAccessToken || new Date() >= user.spotifyTokenExpiresAt) {
    return retryWithNewToken();
  }


  const headers = {
    Authorization: `Bearer ${user.spotifyAccessToken}`,
  };

  try {
    const response = await get(`https://api.spotify.com/v1/${endpoint}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return retryWithNewToken();
    } else if (error.response && error.response.status === 403) {
      console.error(
        "Forbidden error. Insufficient permissions:",
        error.response?.data?.error?.message
      );
      throw new Error(
        "Spotify API request failed due to insufficient permissions"
      );
    } else {
      console.error(
        `Error making Spotify API request to endpoint ${endpoint}:`,
        error.response?.data || error.message
      );
      throw new Error("Spotify API request failed");
    }
  }
};

export const getUserProfileService = async (user) => {
  return spotifyApiRequest("me", user);
};

export const getUserPlaylistsService = async (user) => {
  return spotifyApiRequest("me/playlists", user);
};