import AnalyticsNav from "../components/AnalyticsNav";

const FirebaseAnalytics = () => {
  return (
    <div>
      <AnalyticsNav />
      <h1 className="text-2xl font-bold m-4">Firebase Analytics</h1>
      <p className="m-4">View Firebase analytics for app:</p>
      <a
        href="https://console.firebase.google.com/project/YOUR_PROJECT_ID/analytics"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline m-4 inline-block"
      >
        Go to Firebase Analytics Console
      </a>
    </div>
  );
};

export default FirebaseAnalytics;
