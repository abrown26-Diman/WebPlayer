// import React, { useState } from 'react';
// import SearchBar from './SearchBar';
// import VideoList from './VideoList';
// import VideoPlayer from './VideoPlayer';
// import { searchYouTube } from './api';

// const App = () => {
//   const [videos, setVideos] = useState([]);
//   const [selectedVideo, setSelectedVideo] = useState(null);

//   const handleSearch = async (query) => {
//     const results = await searchYouTube(query);
//     setVideos(results);
//     setSelectedVideo(null); // Clear the currently selected video
//   };

//   return (
//     <div>
//       <h1>YouTube Web Player</h1>
//       <SearchBar onSearch={handleSearch} />
//       <VideoPlayer videoId={selectedVideo} />
//       <VideoList videos={videos} onSelect={setSelectedVideo} />
//     </div>
//   );
// };

// export default App;

// ^ 
// | OG code
// |


import React, { useState } from 'react';
import SearchBar from './SearchBar';
import VideoList from './VideoList';
import VideoPlayer from './VideoPlayer';
import OAuthLogin from './OAuthLogin'; // New component for OAuth login
import { searchYouTube } from './api';

const App = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [accessToken, setAccessToken] = useState(null); // State for OAuth2 access token

  const handleSearch = async (query) => {
    if (!accessToken) {
      alert('Please log in first!');
      return;
    }
    const results = await searchYouTube(query, accessToken);
    setVideos(results);
    setSelectedVideo(null); // Clear the currently selected video
  };

  return (
    <div>
      <h1>YouTube Web Player</h1>
      {/* OAuth login component */}
      <OAuthLogin onLoginSuccess={setAccessToken} />
      <SearchBar onSearch={handleSearch} />
      <VideoPlayer videoId={selectedVideo} />
      <VideoList videos={videos} onSelect={setSelectedVideo} />
    </div>
  );
};

export default App;
