import React, { useEffect, useState } from 'react';
import { Calendar, Eye, Users, Video, Globe, Hash } from 'lucide-react';

const API_URL = "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=UCkBY0aHJP9BwjZLDYxAQrKg&key=AIzaSyDoKDH2KiZZmbDFOPzSQbySheipzMahKjo";

const YouTubeChannelDisplay = () => {
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  // Fetch the data from the YouTube API
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch YouTube data");
        return res.json();
      })
      .then((data) => {
        setChannelData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div><p className="mt-4 text-slate-600">Loading YouTube data...</p></div>;
  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">Error: {error}</div>;
  if (!channelData || !channelData.items || channelData.items.length === 0) return <div className="p-8 text-center text-slate-600 bg-slate-50 rounded-xl">No channel data found.</div>;

  const channel = channelData.items[0];
  // Format numbers with commas
  const formatNumber = (num) => {
    return parseInt(num).toLocaleString();
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-3xl transition-all duration-500">
          
          {/* Header Section */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 text-white p-8 overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48 blur-3xl"></div>
            <div className="relative flex items-center space-x-6">
              <div className="relative group">
                <img
                  src={channel.snippet.thumbnails.high.url}
                  alt={channel.snippet.title}
                  className="w-28 h-28 rounded-2xl border-4 border-white/30 shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
                  {channel.snippet.title}
                </h1>
                <p className="text-indigo-100 text-xl mb-3 font-medium">{channel.snippet.customUrl}</p>
                <div className="flex items-center text-indigo-200 hover:text-white transition-colors duration-200">
                  <Globe className="w-5 h-5 mr-2" />
                  <span className="font-medium">{channel.snippet.country}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="group bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium mb-1">Subscribers</p>
                    <p className="text-3xl font-bold">{formatNumber(channel.statistics.subscriberCount)}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3 group-hover:bg-white/30 group-hover:rotate-12 transition-all duration-300">
                    <Users className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-violet-500 to-pink-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100 text-sm font-medium mb-1">Total Views</p>
                    <p className="text-3xl font-bold">{formatNumber(channel.statistics.viewCount)}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3 group-hover:bg-white/30 group-hover:rotate-12 transition-all duration-300">
                    <Eye className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-1">Total Videos</p>
                    <p className="text-3xl font-bold">{formatNumber(channel.statistics.videoCount)}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3 group-hover:bg-white/30 group-hover:rotate-12 transition-all duration-300">
                    <Video className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 mb-8 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3"></div>
                About
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{channel.snippet.description}</p>
            </div>

            {/* Channel Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3"></div>
                  Channel Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors duration-200">
                    <div className="bg-indigo-100 rounded-lg p-2 mr-4">
                      <Hash className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-600">Channel ID</span>
                      <p className="text-slate-800 font-mono text-sm break-all">{channel.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors duration-200">
                    <div className="bg-purple-100 rounded-lg p-2 mr-4">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-600">Created</span>
                      <p className="text-slate-800 font-medium">{formatDate(channel.snippet.publishedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors duration-200">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-600">Subscriber Count Visible</span>
                      <p className="text-slate-800 font-medium">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          !channel.statistics.hiddenSubscriberCount 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {!channel.statistics.hiddenSubscriberCount ? 'Yes' : 'No'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <div className="w-1 h-5 bg-gradient-to-b from-violet-500 to-pink-600 rounded-full mr-3"></div>
                  API Response Info
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors duration-200">
                    <span className="text-sm font-medium text-slate-600">Response Type</span>
                    <p className="text-slate-800 font-mono text-sm">{channelData.kind}</p>
                  </div>
                  <div className="p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors duration-200">
                    <span className="text-sm font-medium text-slate-600">Total Results</span>
                    <p className="text-slate-800 font-semibold">{channelData.pageInfo.totalResults}</p>
                  </div>
                  <div className="p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors duration-200">
                    <span className="text-sm font-medium text-slate-600">Results Per Page</span>
                    <p className="text-slate-800 font-semibold">{channelData.pageInfo.resultsPerPage}</p>
                  </div>
                  <div className="p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors duration-200">
                    <span className="text-sm font-medium text-slate-600">ETag</span>
                    <p className="text-slate-800 font-mono text-xs break-all">{channelData.etag}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnails Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
                Available Thumbnails
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(channel.snippet.thumbnails).map(([size, thumbnail]) => (
                  <div key={size} className="group text-center p-4 bg-slate-50/50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="relative overflow-hidden rounded-xl mb-3">
                      <img
                        src={thumbnail.url}
                        alt={`${size} thumbnail`}
                        className="mx-auto rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300"
                        style={{ maxWidth: '120px', height: 'auto' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    </div>
                    <p className="text-sm font-bold text-slate-800 capitalize mb-1">{size}</p>
                    <p className="text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1 inline-block">
                      {thumbnail.width} × {thumbnail.height}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeChannelDisplay;