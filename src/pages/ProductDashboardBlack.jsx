import React, { useState } from "react";
import { Search, TrendingUp, Users, BarChart3, Filter } from "lucide-react";

const ProductDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("7days");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
      name: "Analytics Pro",
      category: "analytics",
      users: 12543,
      traffic: 45678,
      growth: "+12%",
    },
    {
      id: 2,
      name: "Marketing Suite",
      category: "marketing",
      users: 8921,
      traffic: 32456,
      growth: "+8%",
    },
    {
      id: 3,
      name: "Dev Tools",
      category: "development",
      users: 15234,
      traffic: 56789,
      growth: "+15%",
    },
    {
      id: 4,
      name: "Design Studio",
      category: "design",
      users: 6789,
      traffic: 23456,
      growth: "+5%",
    },
    {
      id: 5,
      name: "Sales CRM",
      category: "sales",
      users: 11234,
      traffic: 41234,
      growth: "+10%",
    },
    {
      id: 6,
      name: "Data Insights",
      category: "analytics",
      users: 9876,
      traffic: 38765,
      growth: "+7%",
    },
    {
      id: 7,
      name: "Email Campaign",
      category: "marketing",
      users: 7543,
      traffic: 28901,
      growth: "+6%",
    },
    {
      id: 8,
      name: "Code Editor",
      category: "development",
      users: 13456,
      traffic: 51234,
      growth: "+13%",
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
    <div className="min-h-screen bg-zinc-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
              Product Dashboard
            </h1>

            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-300" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-300" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        {/* <aside className="w-64 border-r border-zinc-900 bg-zinc-950 min-h-screen p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Categories
          </h2>
          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? "bg-cyan-950 bg-opacity-50 text-cyan-300 border border-cyan-900 shadow-sm shadow-cyan-500/10"
                    : "text-gray-400 hover:bg-zinc-900 hover:text-gray-300"
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </aside> */}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-200">
              {filteredProducts.length} Products Found
            </h2>
          </div>

          {/* Products Grid */}
          <div className="space-y-3">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-zinc-900 bg-opacity-50 rounded-lg border border-zinc-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Product
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                <Users className="w-4 h-4 text-cyan-400" />
                Users
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Traffic
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Catagory
              </div>
            </div>

            {/* Product Rows */}
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-4 gap-4 px-6 py-4 bg-zinc-900 bg-opacity-50 rounded-lg border border-zinc-900 hover:border-cyan-900 hover:bg-cyan-950 hover:bg-opacity-20 transition-all cursor-pointer group"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-200 group-hover:text-cyan-300 transition-colors">
                    {product.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    {product.users.toLocaleString()}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">
                    {product.growth}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-gray-400">
                    {product.traffic.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 capitalize">
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
