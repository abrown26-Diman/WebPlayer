import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, User, Menu, X, Play, ThumbsUp, ThumbsDown, Clock, Eye, Home, TrendingUp, 
  Film, Music, Gamepad2, Newspaper, Lightbulb, Trophy, Share2, Bookmark, 
  MoreVertical, History, Settings, Moon, Sun, Filter, SortDesc, Grid3X3, List,
  ChevronDown, Bell, Download, Volume2, VolumeX, Maximize, Minimize2,
  Heart, MessageCircle, Repeat, Plus
} from 'lucide-react';

<script src="https://cdn.tailwindcss.com"></script>

// YouTube API Configuration
const API_KEY = 'AIzaSyAIY9oJqKgVyWtuoNMefbIex86gbc2DdAI';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Available topics for user interests
const AVAILABLE_TOPICS = [
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, query: 'gaming', color: 'from-purple-400 to-pink-400' },
  { id: 'music', name: 'Music', icon: Music, query: 'music', color: 'from-green-400 to-blue-500' },
  { id: 'sports', name: 'Sports', icon: Trophy, query: 'sports', color: 'from-yellow-400 to-orange-500' },
  { id: 'technology', name: 'Technology', icon: Lightbulb, query: 'technology', color: 'from-blue-400 to-purple-500' },
  { id: 'news', name: 'News', icon: Newspaper, query: 'news', color: 'from-red-400 to-pink-500' },
  { id: 'entertainment', name: 'Entertainment', icon: Film, query: 'entertainment', color: 'from-indigo-400 to-purple-500' },
  { id: 'education', name: 'Education', icon: Lightbulb, query: 'education', color: 'from-teal-400 to-blue-500' },
  { id: 'cooking', name: 'Cooking', icon: Film, query: 'cooking recipes', color: 'from-orange-400 to-red-500' },
];

const SORT_OPTIONS = [
  { id: 'relevance', name: 'Relevance', icon: SortDesc },
  { id: 'date', name: 'Upload date', icon: Clock },
  { id: 'viewCount', name: 'View count', icon: Eye },
  { id: 'rating', name: 'Rating', icon: ThumbsUp },
];

const VIEW_MODES = [
  { id: 'grid', name: 'Grid', icon: Grid3X3 },
  { id: 'list', name: 'List', icon: List },
];

// Utility functions
const formatViewCount = (count) => {
  if (!count) return '0 views';
  const num = parseInt(count);
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B views`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K views`;
  return `${num} views`;
};

const formatDuration = (duration) => {
  if (!duration) return '';
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';
  
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');
  
  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
};

// Enhanced Interest Selection Modal
const InterestSelectionModal = ({ onComplete }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);

  const toggleTopic = (topicId) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleComplete = () => {
    if (selectedTopics.length > 0) {
      onComplete(selectedTopics);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-4xl w-full p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Welcome to ViewTube Pro
          </h2>
          <p className="text-gray-600 text-lg">Discover personalized content tailored just for you</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {AVAILABLE_TOPICS.map(topic => {
            const Icon = topic.icon;
            const isSelected = selectedTopics.includes(topic.id);
            return (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  isSelected 
                    ? 'border-transparent shadow-lg shadow-purple-200' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                style={{
                  background: isSelected ? `linear-gradient(135deg, var(--tw-gradient-stops))` : 'white'
                }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${topic.color} p-3 mx-auto mb-3 shadow-md`}>
                  <Icon className="w-full h-full text-white" />
                </div>
                <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {topic.name}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={handleComplete}
          disabled={selectedTopics.length === 0}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
            selectedTopics.length > 0
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Start Exploring ({selectedTopics.length} interests selected)
        </button>
      </div>
    </div>
  );
};

// Enhanced Navigation Component
const Navigation = ({ onSearch, onLogoClick, darkMode, setDarkMode, onFilterToggle, onSortChange, viewMode, setViewMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [notifications] = useState(3);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white/80 backdrop-blur-md border-gray-200'} border-b sticky top-0 z-40 transition-colors duration-300`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-800' : ''} rounded-full md:hidden transition-colors`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div 
              onClick={onLogoClick}
              className="flex items-center ml-2 md:ml-0 cursor-pointer group"
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-2 shadow-lg group-hover:shadow-xl transition-shadow">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent hidden sm:block">
                ViewTube Pro
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for anything..."
                className={`w-full px-6 py-3 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                } border-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300`}
              />
              <button
                onClick={handleSearch}
                className="absolute right-1 top-1 h-10 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {VIEW_MODES.map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === mode.id
                        ? 'bg-white dark:bg-gray-700 shadow-md'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              >
                <Filter className="w-5 h-5" />
              </button>
              {showSort && (
                <div className={`absolute right-0 top-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} min-w-48 z-50`}>
                  {SORT_OPTIONS.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          onSortChange(option.id);
                          setShowSort(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className={`relative p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}>
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            <button className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`md:hidden border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="px-4 py-2">
            <button 
              onClick={onLogoClick}
              className={`flex items-center w-full p-3 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              <Home className="w-5 h-5 mr-3" />
              <span>Home</span>
            </button>
            <button className={`flex items-center w-full p-3 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
              <TrendingUp className="w-5 h-5 mr-3" />
              <span>Trending</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// Enhanced Video Card Component
const VideoCard = ({ video, onClick, darkMode, viewMode = 'grid', onSave, isSaved }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const thumbnail = video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url;
  const title = video.snippet?.title || 'Untitled Video';
  const channelTitle = video.snippet?.channelTitle || 'Unknown Channel';
  const viewCount = video.statistics?.viewCount;
  const publishedAt = video.snippet?.publishedAt;
  const duration = video.contentDetails?.duration;
  const likeCount = video.statistics?.likeCount;

  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => onClick(video)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
          darkMode 
            ? 'hover:bg-gray-800/50' 
            : 'hover:bg-gray-50'
        } ${isHovered ? 'transform scale-[1.02]' : ''}`}
      >
        <div className="relative w-60 aspect-video bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300"
          />
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-semibold text-lg line-clamp-2 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {channelTitle}
          </p>
          <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>{formatViewCount(viewCount)}</span>
            <span>•</span>
            <span>{formatTimeAgo(publishedAt)}</span>
            {likeCount && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{formatViewCount(likeCount)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(video)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer group"
    >
      <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden mb-3 shadow-md">
        <img 
          src={thumbnail} 
          alt={title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isHovered ? 'opacity-10' : 'opacity-0'
        }`} />
        
        {duration && (
          <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-medium">
            {formatDuration(duration)}
          </div>
        )}
        
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        )}

        <div className={`absolute top-3 right-3 flex gap-2 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(video);
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isSaved 
                ? 'bg-red-500/80 text-white' 
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {channelTitle.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base line-clamp-2 mb-1 group-hover:text-red-600 transition-colors ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {channelTitle}
          </p>
          <div className={`flex items-center text-sm gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>{formatViewCount(viewCount)}</span>
            <span>•</span>
            <span>{formatTimeAgo(publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const VideoCardSkeleton = ({ darkMode, viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex gap-4 p-4 rounded-xl animate-pulse">
        <div className={`w-60 aspect-video rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <div className="flex-1">
          <div className={`h-6 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 rounded mb-2 w-1/3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 rounded w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <div className={`aspect-video rounded-xl mb-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
      <div className="flex gap-3">
        <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <div className="flex-1">
          <div className={`h-4 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-3 rounded mb-1 w-2/3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-3 rounded w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
      </div>
    </div>
  );
};

// Enhanced Video Player Component
const VideoPlayer = ({ video, relatedVideos, onVideoClick, onBack, darkMode }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const videoId = video.id?.videoId || video.id;
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className={`mb-6 px-6 py-3 ${
            darkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-white' 
              : 'bg-white hover:bg-gray-50 text-gray-900'
          } rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          ← Back to Home
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-6">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={video.snippet?.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            
            <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {video.snippet?.title}
            </h1>
            
            <div className={`flex items-center justify-between mb-6 p-4 ${
              darkMode ? 'bg-gray-800/50' : 'bg-white'
            } rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-md`}>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span className="font-semibold">{formatViewCount(video.statistics?.viewCount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{formatTimeAgo(video.snippet?.publishedAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isLiked
                      ? 'bg-red-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">
                    {formatViewCount(video.statistics?.likeCount)}
                  </span>
                </button>
                
                <button
                  onClick={() => setIsDisliked(!isDisliked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isDisliked
                      ? 'bg-gray-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                </button>
                
                <button className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}>
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>
                
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isSaved
                      ? 'bg-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Channel Info */}
            <div className={`flex items-center justify-between p-6 ${
              darkMode ? 'bg-gray-800/50' : 'bg-white'
            } rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-md mb-6`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {video.snippet?.channelTitle?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {video.snippet?.channelTitle}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    1.2M subscribers
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  isSubscribed
                    ? darkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-red-500 text-white hover:bg-red-600'
                } shadow-md hover:shadow-lg transform hover:scale-105`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
            
            {/* Description */}
            <div className={`p-6 ${
              darkMode ? 'bg-gray-800/50' : 'bg-white'
            } rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-md`}>
              <button
                onClick={() => setShowDescription(!showDescription)}
                className={`flex items-center gap-2 mb-4 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Description
                <ChevronDown className={`w-4 h-4 transition-transform ${showDescription ? 'rotate-180' : ''}`} />
              </button>
              
              {showDescription && (
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {video.snippet?.description || 'No description available.'}
                </p>
              )}
            </div>
          </div>
          
          {/* Related Videos */}
          <div className="lg:col-span-1">
            <h2 className={`font-bold text-xl mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Up Next
            </h2>
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo, index) => (
                <div
                  key={relatedVideo.id?.videoId || relatedVideo.id || index}
                  onClick={() => onVideoClick(relatedVideo)}
                  className={`flex gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                    darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative w-40 aspect-video bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={relatedVideo.snippet?.thumbnails?.default?.url}
                      alt={relatedVideo.snippet?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {relatedVideo.contentDetails?.duration && (
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                        {formatDuration(relatedVideo.contentDetails.duration)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold line-clamp-2 mb-1 group-hover:text-red-500 transition-colors ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {relatedVideo.snippet?.title}
                    </h4>
                    <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {relatedVideo.snippet?.channelTitle}
                    </p>
                    <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>{formatViewCount(relatedVideo.statistics?.viewCount)}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(relatedVideo.snippet?.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Infinite Scroll Hook
const useInfiniteScroll = (callback, hasMore) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isFetching) return;
    fetchMoreData();
  }, [isFetching]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching || !hasMore) return;
    setIsFetching(true);
  };

  const fetchMoreData = useCallback(async () => {
    await callback();
    setIsFetching(false);
  }, [callback]);

  return [isFetching, setIsFetching];
};

// Main App Component
const App = () => {
  const [userInterests, setUserInterests] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [currentQuery, setCurrentQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [sortOrder, setSortOrder] = useState('relevance');

  // Load user data
  useEffect(() => {
    const savedInterests = JSON.parse(localStorage.getItem('userInterests') || 'null');
    const savedHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const savedVideosList = JSON.parse(localStorage.getItem('savedVideos') || '[]');
    const savedDarkMode = JSON.parse(localStorage.getItem('darkMode') || 'false');
    
    if (savedInterests) setUserInterests(savedInterests);
    setWatchHistory(savedHistory);
    setSavedVideos(savedVideosList);
    setDarkMode(savedDarkMode);
  }, []);

  // Save user preferences
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Infinite scroll
  const [isFetchingMore] = useInfiniteScroll(async () => {
    if (hasMore && nextPageToken) {
      await fetchVideos(currentQuery, 20, nextPageToken);
    }
  }, hasMore);

  // Save user interests
  const handleInterestsSelected = (interests) => {
    setUserInterests(interests);
    localStorage.setItem('userInterests', JSON.stringify(interests));
  };

  // Track video interactions
  const trackVideoWatch = (video) => {
    const videoData = {
      id: video.id?.videoId || video.id,
      title: video.snippet?.title,
      categoryId: video.snippet?.categoryId,
      tags: video.snippet?.tags || [],
      channelId: video.snippet?.channelId,
      timestamp: new Date().toISOString()
    };
    
    const newHistory = [videoData, ...watchHistory.filter(v => v.id !== videoData.id).slice(0, 49)];
    setWatchHistory(newHistory);
    localStorage.setItem('watchHistory', JSON.stringify(newHistory));
  };

  const handleSaveVideo = (video) => {
    const videoData = {
      id: video.id?.videoId || video.id,
      title: video.snippet?.title,
      thumbnail: video.snippet?.thumbnails?.default?.url,
      channelTitle: video.snippet?.channelTitle,
      timestamp: new Date().toISOString()
    };
    
    const isAlreadySaved = savedVideos.some(v => v.id === videoData.id);
    let newSavedVideos;
    
    if (isAlreadySaved) {
      newSavedVideos = savedVideos.filter(v => v.id !== videoData.id);
    } else {
      newSavedVideos = [videoData, ...savedVideos];
    }
    
    setSavedVideos(newSavedVideos);
    localStorage.setItem('savedVideos', JSON.stringify(newSavedVideos));
  };

  // Fetch videos from YouTube API
  const fetchVideos = useCallback(async (query = '', maxResults = 20, pageToken = '') => {
    if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
      setError('Please add your YouTube API key to use this app');
      return [];
    }

    try {
      if (!pageToken) {
        setLoading(true);
        setError(null);
      }
      
      let url;
      const orderParam = sortOrder !== 'relevance' ? `&order=${sortOrder}` : '';
      
      if (query) {
        url = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${API_KEY}${orderParam}${pageToken ? `&pageToken=${pageToken}` : ''}`;
      } else {
        url = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=${maxResults}&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      setNextPageToken(data.nextPageToken || '');
      setHasMore(!!data.nextPageToken);
      
      let videosData = data.items || [];
      
      // If we got search results, fetch additional details
      if (query && videosData.length > 0) {
        const videoIds = videosData.map(item => item.id.videoId).join(',');
        const detailsUrl = `${YOUTUBE_API_BASE}/videos?part=statistics,contentDetails&id=${videoIds}&key=${API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        // Merge the data
        if (detailsData.items) {
          videosData = videosData.map(video => {
            const details = detailsData.items.find(detail => detail.id === video.id.videoId);
            return {
              ...video,
              statistics: details?.statistics,
              contentDetails: details?.contentDetails
            };
          });
        }
      }
      
      if (pageToken) {
        setVideos(prev => [...prev, ...videosData]);
      } else {
        setVideos(videosData);
      }
      
      return videosData;
    } catch (err) {
      setError(`Failed to fetch videos: ${err.message}`);
      return [];
    } finally {
      if (!pageToken) {
        setLoading(false);
      }
    }
  }, [sortOrder]);

  // Generate personalized feed
  const generatePersonalizedFeed = useCallback(async () => {
    if (!userInterests || userInterests.length === 0) return;
    
    setCurrentQuery('');
    const allVideos = [];
    
    // Fetch videos for each user interest
    for (const interestId of userInterests.slice(0, 3)) {
      const topic = AVAILABLE_TOPICS.find(t => t.id === interestId);
      if (topic) {
        const videos = await fetchVideos(topic.query, 8);
        allVideos.push(...videos);
      }
    }
    
    // Add trending videos
    const trendingVideos = await fetchVideos('', 12);
    allVideos.push(...trendingVideos);
    
    // Shuffle and deduplicate
    const uniqueVideos = Array.from(
      new Map(allVideos.map(v => [v.id?.videoId || v.id, v])).values()
    );
    
    const shuffled = uniqueVideos.sort(() => Math.random() - 0.5);
    setVideos(shuffled);
    setNextPageToken('');
    setHasMore(false);
  }, [userInterests, fetchVideos]);

  // Load initial videos
  useEffect(() => {
    if (userInterests && !currentVideo) {
      generatePersonalizedFeed();
    }
  }, [userInterests, generatePersonalizedFeed]);

  // Handle video click
  const handleVideoClick = async (video) => {
    setCurrentVideo(video);
    trackVideoWatch(video);
    
    // Fetch related videos
    const query = video.snippet?.tags?.slice(0, 2).join(' ') || 
                  video.snippet?.title?.split(' ').slice(0, 3).join(' ') || 
                  video.snippet?.channelTitle;
    const related = await fetchVideos(query, 15);
    setRelatedVideos(related.filter(v => (v.id?.videoId || v.id) !== (video.id?.videoId || video.id)));
  };

  // Handle search
  const handleSearch = async (query) => {
    setCurrentQuery(query);
    setNextPageToken('');
    setHasMore(true);
    await fetchVideos(query, 20);
    setCurrentVideo(null);
  };

  // Handle sort change
  const handleSortChange = async (newSortOrder) => {
    setSortOrder(newSortOrder);
    if (currentQuery) {
      setNextPageToken('');
      await fetchVideos(currentQuery, 20);
    }
  };

  // Handle logo click
  const handleLogoClick = () => {
    setCurrentVideo(null);
    setCurrentQuery('');
    generatePersonalizedFeed();
  };

  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Show interest selection if user hasn't selected any
  if (!userInterests) {
    return <InterestSelectionModal onComplete={handleInterestsSelected} />;
  }

  // Show video player if video is selected
  if (currentVideo) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <Navigation 
          onSearch={handleSearch} 
          onLogoClick={handleLogoClick}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <VideoPlayer
          video={currentVideo}
          relatedVideos={relatedVideos}
          onVideoClick={handleVideoClick}
          onBack={() => setCurrentVideo(null)}
          darkMode={darkMode}
        />
      </div>
    );
  }

  // Show main feed
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navigation 
          onSearch={handleSearch} 
          onLogoClick={handleLogoClick}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Topic chips for personalized feed */}
          {!currentQuery && userInterests && (
            <div className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Your Personalized Feed
              </h2>
              <div className="flex flex-wrap gap-3">
                {userInterests.map(interestId => {
                  const topic = AVAILABLE_TOPICS.find(t => t.id === interestId);
                  if (!topic) return null;
                  const Icon = topic.icon;
                  return (
                    <div
                      key={topic.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${topic.color} text-white shadow-md`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{topic.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search results header */}
          {currentQuery && (
            <div className="mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Search results for "{currentQuery}"
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {videos.length} videos found
              </p>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              {error.includes('API key') && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                  Replace 'YOUR_YOUTUBE_API_KEY_HERE' in the code with your actual YouTube Data API v3 key
                </p>
              )}
            </div>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500"></div>
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
              </div>
            </div>
          )}
          
          {/* Video Grid/List */}
          {!loading && videos.length > 0 && (
            <>
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                  : "space-y-4"
              }>
                {videos.map((video, index) => (
                  <VideoCard
                    key={video.id?.videoId || video.id || index}
                    video={video}
                    onClick={handleVideoClick}
                    darkMode={darkMode}
                    viewMode={viewMode}
                    onSave={handleSaveVideo}
                    isSaved={savedVideos.some(v => v.id === (video.id?.videoId || video.id))}
                  />
                ))}
              </div>
              
              {/* Loading more indicator */}
              {isFetchingMore && (
                <div className="flex justify-center items-center py-8">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Loading more videos...
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Loading Skeletons */}
          {loading && (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                : "space-y-4"
            }>
              {Array.from({ length: 20 }).map((_, index) => (
                <VideoCardSkeleton key={index} darkMode={darkMode} viewMode={viewMode} />
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {!loading && videos.length === 0 && !error && (
            <div className="text-center py-20">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 ${darkMode ? 'from-gray-700 to-gray-600' : ''} flex items-center justify-center`}>
                <Search className={`w-12 h-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No videos found
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                Try searching for something else or adjust your filters
              </p>
              <button
                onClick={handleLogoClick}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Go to Home Feed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;