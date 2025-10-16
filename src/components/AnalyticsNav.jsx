import { Link } from "react-router-dom";

const AnalyticsNav = () => {
  return (
    <div className="flex gap-4 p-4 bg-gray-100">
      <Link to="/analytics/web" className="text-blue-600 underline">Website Analytics</Link>
      <Link to="/analytics/extension" className="text-blue-600 underline">Extension Analytics</Link>
      <Link to="/analytics/firebase" className="text-blue-600 underline">Firebase Analytics</Link>
    </div>
  );
};

export default AnalyticsNav;
