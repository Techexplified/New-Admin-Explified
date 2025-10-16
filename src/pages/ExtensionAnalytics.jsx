import AnalyticsNav from "../components/AnalyticsNav";

const ExtensionAnalytics = () => {
  return (
    <div>
      <AnalyticsNav />
      <h1 className="text-2xl font-bold m-4">Chrome Extension Analytics</h1>
      <p className="m-4">You can view extension analytics on the Chrome Developer Dashboard:</p>
      <a
        href="https://chrome.google.com/webstore/developer/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline m-4 inline-block"
      >
        Go to Chrome Developer Dashboard
      </a>
    </div>
  );
};

export default ExtensionAnalytics;
