import {
  spotifyApiRequest,
  getUserProfileService,
  getUserPlaylistsService,
} from "../services/spotifyService.js";

export const getTracks = async (req, res) => {
  const user = req.user;
  if (!user.spotifyRefreshToken) {
    return res
      .status(400)
      .json({ message: "User not authenticated with Spotify" });
  }

  try {
    const tracks = await spotifyApiRequest("me/top/tracks?limit=10", user);
    res.json(tracks);
  } catch (error) {
    console.error("Get Tracks Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getArtist = async (req, res) => {
  const artistId = req.params.id;
  const user = req.user;

  if (!user.spotifyRefreshToken) {
    return res
      .status(400)
      .json({ message: "User not authenticated with Spotify" });
  }

  try {
    const artist = await spotifyApiRequest(`artists/${artistId}`, user);
    res.json(artist);
  } catch (error) {
    console.error("Get Artist Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getUserSpotifyProfile = async (req, res) => {
  const user = req.user;

  if (!user.spotifyRefreshToken) {
    return res
      .status(400)
      .json({ message: "User not authenticated with Spotify" });
  }

  try {
    const userProfile = await getUserProfileService(user);
    res.json(userProfile);
  } catch (error) {
    console.error("Get Spotify Profile Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getUserPlaylists = async (req, res) => {
  const user = req.user;

  if (!user.spotifyRefreshToken) {
    return res
      .status(400)
      .json({ message: "User not authenticated with Spotify" });
  }

  try {
    const playlists = await getUserPlaylistsService(user);
    res.json(playlists);
  } catch (error) {
    console.error("Get Playlists Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const searchTracks = async (req, res) => {
  const { q } = req.query;
  const user = req.user;

  if (!user.spotifyRefreshToken) {
    return res
      .status(400)
      .json({ message: "User not authenticated with Spotify" });
  }

  try {
    const query = encodeURIComponent(q);
    const searchEndpoint = `search?q=${query}&type=track&limit=10`;

    const searchResults = await spotifyApiRequest(searchEndpoint, user);

    if (searchResults && searchResults.tracks && searchResults.tracks.items) {
      return res.json(searchResults.tracks.items);
    } else {
      console.error("Unexpected API Response:", searchResults);
      return res
        .status(500)
        .json({ message: "Unexpected response from Spotify API" });
    }
  } catch (error) {
    console.error("Search Tracks Error:", error.message);
    return res.status(500).json({ message: "Failed to search tracks" });
  }
};