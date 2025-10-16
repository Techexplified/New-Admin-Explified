// src/components/LoginWithGoogle.jsx
const LoginWithGoogle = () => {
  const handleLogin = () => {
    // Redirect to your backend's Google OAuth URL
    window.location.href =
      "https://explified-app.web.app/api/youtubeAnalytics/auth";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-800 mb-10 flex justify-center items-center gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="red"
            className="w-12 h-12"
            aria-hidden="true"
          >
            <path d="M19.615 3.184C18.579 3 12 3 12 3s-6.578 0-7.615.184A3.003 3.003 0 002 6.09v11.82a3.003 3.003 0 002.385 2.905C5.421 21 12 21 12 21s6.579 0 7.615-.184A3.003 3.003 0 0022 17.91V6.09a3.003 3.003 0 00-2.385-2.906zM10 15.5v-7l6 3.5-6 3.5z" />
          </svg>
          YouTube Channel Dashboard
        </h1>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-2xl font-semibold transition duration-200"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default LoginWithGoogle;
