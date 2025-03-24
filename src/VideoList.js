import React from 'react';

const VideoList = ({ videos, onSelect }) => {
  return (
    <ul>
      {videos.map((video) => (
        <li key={video.id.videoId} onClick={() => onSelect(video.id.videoId)}>
          <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
          <p>{video.snippet.title}</p>
        </li>
      ))}
    </ul>
  );
};

export default VideoList;
