import Allusers from "./Allusers";


const Dashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        📊 Dashboard
      </h2>
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 text-base">
          Welcome to the <span className="font-medium text-gray-800">Explified Admin Panel</span>! 
          Use the sidebar to navigate and manage analytics, users, and settings.
        </p>
      </div>

      <Allusers />
    </div>
  );
};

export default Dashboard;
