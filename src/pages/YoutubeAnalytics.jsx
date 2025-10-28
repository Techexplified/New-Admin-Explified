import { useEffect, useState } from "react";
import axios from "axios";

const ITEMS_PER_PAGE = 5;

const YoutubeAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedVideos = analyticsData?.latestVideos?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(
    (analyticsData?.latestVideos?.length || 0) / ITEMS_PER_PAGE
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("access_token");
    const tokenFromStorage = localStorage.getItem("accessToken");

    const token = tokenFromUrl || tokenFromStorage;

    if (token) {
      setAccessToken(token);
      localStorage.setItem("accessToken", token);
      fetchAnalytics(token);

      // Clean the URL
      if (tokenFromUrl) {
        window.history.replaceState({}, document.title, "/dashboard");
      }
    }
  }, []);

  const fetchAnalytics = async (token) => {
    try {
      const response = await axios.get(
        "https://explified-app.web.app/api/youtubeAnalytics/analytics",
        {
          params: { access_token: token },
        }
      );
      setAnalyticsData(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        setAccessToken(null);
        alert("Session expired. Please log in again.");
        window.location.href = "/";
      }
    }
  };

  if (!accessToken) return null;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="red"
            className="w-8 h-8 mr-3"
            aria-hidden="true"
          >
            <path d="M19.615 3.184C18.579 3 12 3 12 3s-6.578 0-7.615.184A3.003 3.003 0 002 6.09v11.82a3.003 3.003 0 002.385 2.905C5.421 21 12 21 12 21s6.579 0 7.615-.184A3.003 3.003 0 0022 17.91V6.09a3.003 3.003 0 00-2.385-2.906zM10 15.5v-7l6 3.5-6 3.5z" />
          </svg>
          YouTube Channel Dashboard
        </h1>

        {analyticsData && (
          <>
            {/* 👑 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              {/* 48-Hour Views Card */}
              <div className="relative bg-gradient-to-br from-indigo-100 to-indigo-200 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-indigo-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-indigo-800">
                    48 Hours Views
                  </h2>

                  {/* Info Icon + Tooltip Wrapper */}
                  <div className="relative group">
                    {/* i icon */}
                    <svg
                      className="w-5 h-5 text-indigo-700 cursor-pointer"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-8 3a1 1 0 100-2 1 1 0 000 2zm1-7H9v4h2V6z" />
                    </svg>
                  </div>
                </div>

                {/* Metric */}
                <p className="text-5xl font-extrabold text-indigo-700">
                  {Number(analyticsData.totalViewsLast48Hours).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-indigo-700 opacity-70">
                  Approximate (last 2 full days)
                </p>
              </div>

              {/* Other Cards (same as before, with minor polish if needed) */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-red-800">
                    Subscribers
                  </h2>
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 3a4 4 0 00-4 4v1H5a2 2 0 000 4h1v1a4 4 0 008 0v-1h1a2 2 0 000-4h-1V7a4 4 0 00-4-4z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-red-600">
                  {Number(
                    analyticsData.channelInfo.subscriberCount
                  ).toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-blue-800">
                    Total Views
                  </h2>
                  <svg
                    className="w-8 h-8 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 3C5 3 1.73 7.11.6 10c1.13 2.89 4.4 7 9.4 7s8.27-4.11 9.4-7c-1.13-2.89-4.4-7-9.4-7zm0 11a4 4 0 110-8 4 4 0 010 8z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-blue-600">
                  {Number(analyticsData.channelInfo.viewCount).toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-green-800">
                    Total Videos
                  </h2>
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9l-4-4H4z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-green-600">
                  {Number(
                    analyticsData.channelInfo.videoCount
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 🆕 Latest Videos - Left */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  🆕 Latest Videos
                </h2>

                {paginatedVideos?.map((video, index) => (
                  <div
                    key={index}
                    className="mb-6 pb-4 border-b border-gray-200 flex gap-4 items-start hover:bg-gray-50 p-2 rounded transition"
                  >
                    <img
                      src={video?.thumbnail}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded-lg shadow-sm border border-gray-200"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-700 mb-1 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1">
                        📅 {new Date(video.publishedAt).toLocaleDateString()}
                      </p>
                      <div className="text-xs text-gray-600 flex flex-wrap gap-3">
                        <span className="flex items-center gap-1">
                          👁 {video.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          👍 {video.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          💬 {video.commentCount}
                        </span>
                      </div>
                      <a
                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 transition"
                      >
                        ▶ Watch Video
                      </a>
                    </div>
                  </div>
                ))}

                {/* 📃 Pagination Controls */}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* 📊 Performance Table - Right */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg overflow-auto">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  📈 Performance Over Time
                </h2>
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-100 text-xs uppercase">
                    <tr>
                      {analyticsData.analyticsData.columnHeaders.map((col) => (
                        <th
                          key={col.name}
                          className="px-4 py-2 whitespace-nowrap"
                        >
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.analyticsData.rows.map((row, i) => (
                      <tr
                        key={i}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-2 whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default YoutubeAnalytics;
