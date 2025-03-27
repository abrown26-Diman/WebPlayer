import React, { useState } from 'react';
import SearchBar from './SearchBar';
import VideoList from './VideoList';
import VideoPlayer from './VideoPlayer';
import { searchYouTube } from './api';

const App = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleSearch = async (query) => {
    const results = await searchYouTube(query);
    setVideos(results);
    setSelectedVideo(null); // Clear the currently selected video
  };

  return (
    <div>
      <h1>YouTube Web Player</h1>
      <SearchBar onSearch={handleSearch} />
      <VideoPlayer videoId={selectedVideo} />
      <VideoList videos={videos} onSelect={setSelectedVideo} />
    </div>
  );
};

export default App;