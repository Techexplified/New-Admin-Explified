import React, { useState } from "react";
import { Search, TrendingUp, Users, BarChart3, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("7days");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const categories = [
    { id: "all", name: "All Products" },
    { id: "analytics", name: "Analytics" },
    { id: "marketing", name: "Marketing" },
    { id: "development", name: "Development" },
    { id: "design", name: "Design" },
    { id: "sales", name: "Sales" },
  ];

  const timeFilters = [
    { id: "1day", label: "Last 24 Hours" },
    { id: "7days", label: "Last 7 Days" },
    { id: "28days", label: "Last 28 Days" },
    { id: "90days", label: "Last 90 Days" },
  ];

  const products = [
    {
      id: 1,
      name: "Explified Analytics",
      category: "Youtube analytics",
      users: 36300,
      traffic: 5489,
      growth: "+13%",
      link: "/explified-analytics/login",
    },
    {
      id: 2,
      name: "Expli",
      category: "chat tool",
      users: 8921,
      traffic: 32456,
      growth: "+8%",
      link: "/",
    },
    {
      id: 3,
      name: "Notes",
      category: "tool",
      users: 15234,
      traffic: 56789,
      growth: "+15%",
      link: "/",
    },
    {
      id: 4,
      name: "Video Meme Generator AI",
      category: "AI tool",
      users: 6789,
      traffic: 23456,
      growth: "+5%",
      link: "/",
    },
    {
      id: 5,
      name: "AI GIF generator",
      category: "AI tool",
      users: 11234,
      traffic: 41234,
      growth: "+10%",
      link: "/",
    },
    {
      id: 6,
      name: "Slideshow Maker AI",
      category: "AI tool",
      users: 9876,
      traffic: 38765,
      growth: "+7%",
      link: "/",
    },
    {
      id: 7,
      name: "Youtube Summariser",
      category: "chrome extension",
      users: 7543,
      traffic: 28901,
      growth: "+6%",
      link: "/",
    },
    {
      id: 8,
      name: "AI image styler",
      category: "AI tool",
      users: 13456,
      traffic: 51234,
      growth: "+13%",
      link: "/",
    },
    {
      id: 9,
      name: "Vidsum",
      category: "chrome extension",
      users: 12543,
      traffic: 45678,
      growth: "+12%",
      link: "/",
    },
        {
      id: 10,
      name: "Quickshot",
      category: "chrome extension",
      users: 12543,
      traffic: 45678,
      growth: "+12%",
      link: "/",
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent">
              Product Dashboard
            </h1>

            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-600" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                {timeFilters.map((filter) => (
                  <option key={filter.id} value={filter.id}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-600" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700">
              {filteredProducts.length} Products Found
            </h2>
          </div>

          {/* Products Grid */}
          <div className="space-y-3">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-gray-100 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-cyan-600" />
                Product
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                <Users className="w-4 h-4 text-cyan-600" />
                Users
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                Traffic
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                Category
              </div>
            </div>

            {/* Product Rows */}
            {filteredProducts.map((product) => (
              <div
                onClick={() => navigate(product?.link)}
                key={product.id}
                className="grid grid-cols-4 gap-4 px-6 py-4 bg-white rounded-lg border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all cursor-pointer group"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800 group-hover:text-cyan-700 transition-colors">
                    {product.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {product.users.toLocaleString()}
                  </span>
                  <span className="text-xs text-emerald-500 font-medium">
                    {product.growth}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-gray-600">
                    {product.traffic.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 capitalize">
                    {product.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No products found matching your search.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductDashboard;
