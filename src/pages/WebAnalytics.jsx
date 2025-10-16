import AnalyticsNav from "../components/AnalyticsNav";

const WebAnalytics = () => {
  return (
    <div>
      <AnalyticsNav />
      <h1 className="text-2xl font-bold m-4">Website Analytics</h1>
      <p className="m-4">View analytics on Google Analytics dashboard:</p>
      <a
        href="https://analytics.google.com/analytics/web/#/pXXXXX/reports"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline m-4 inline-block"
      >
        Go to GA4 for explified.com
      </a>
    </div>
  );
};

export default WebAnalytics;
