import axios from 'axios';

const API_KEY = 'AIzaSyAIY9oJqKgVyWtuoNMefbIex86gbc2DdAI';
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

export const searchYouTube = async (query) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        part: 'snippet',
        q: query,
        maxResults: 10,
      },
    });
    return response.data.items;
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
  }
};
