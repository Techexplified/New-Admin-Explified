const Analytics = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        📈 Google Analytics Dashboard
      </h2>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <iframe
          src="https://lookerstudio.google.com/embed/reporting/74a5189d-ac42-406c-b100-8981dcdd3f4e/page/QxqSF"
          title="Google Analytics Dashboard"
          width="100%"
          height="800"
          className="w-full rounded-md border border-gray-300"
          frameBorder="0"
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        ></iframe>
      </div>
    </div>
  );
};

export default Analytics;
