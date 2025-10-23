import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice"; // Adjust the import path as needed
import { useNavigate } from "react-router-dom";

const CLIENT_ID =
  "111257695819-t9s3l45puasgo9l82hoo216b8ebtc0hq.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/analytics.readonly";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tokenClientRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [gsiLoaded, setGsiLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load Google Identity script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("✅ Google Identity script loaded");

      // Initialize OAuth2 token client
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          if (resp.error) {
            console.error("Google Auth Error:", resp);
            setError(resp.error);
            return;
          }

          // Success → save token and redirect
          dispatch(
            login({
              token: resp.access_token,
              user: { email: "googleuser@example.com" },
            })
          );
          navigate("/dashboard");
        },
      });

      // Initialize Google ID
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: () => {},
      });

      setGsiLoaded(true);
    };

    script.onerror = () => {
      setError("Failed to load Google Identity script.");
    };

    document.body.appendChild(script);
  }, [dispatch, navigate]);

  const handleGoogleLogin = () => {
    setError(null);
    if (!gsiLoaded || !tokenClientRef.current) {
      setError("Google API not loaded yet, please wait a moment.");
      return;
    }

    // Force the account chooser to appear every time
    tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
  };

  const handleEmailPasswordLogin = () => {
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (email === "admin@example.com" && password === "admin123") {
      dispatch(login({ token: null, user: { email } }));
      navigate("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-200 px-4">
      <div className="bg-white px-10 py-12 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-10">
          Explified Admin Login
        </h2>

        {/* Email Input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-6 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          placeholder="Admin Email"
        />

        {/* Password Input */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          placeholder="Password"
        />

        {/* Email/password login button */}
        <button
          onClick={handleEmailPasswordLogin}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
        >
          Log In
        </button>

        {/* Continue with Google button */}
        <button
          onClick={handleGoogleLogin}
          className="mt-6 w-full flex items-center justify-center gap-3 py-3 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition-all shadow-sm"
        >
          {/* Google logo SVG */}
          <svg
            className="w-6 h-6"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M533.5 278.4c0-18.5-1.5-37.2-4.9-55.1H272v104.3h146.9c-6.3 33.8-25.7 62.4-54.9 81.5v67.6h88.6c51.8-47.8 81.9-118 81.9-198.3z"
            />
            <path
              fill="#34A853"
              d="M272 544.3c73.9 0 135.9-24.5 181.2-66.7l-88.6-67.6c-24.7 16.6-56.3 26.3-92.6 26.3-71.3 0-131.8-48.1-153.5-112.7H27.1v70.7c45.6 90.3 139.2 149.9 244.9 149.9z"
            />
            <path
              fill="#FBBC05"
              d="M118.5 323.6c-11.9-35.6-11.9-74 0-109.6V143.3H27.1c-41.7 81.4-41.7 177.3 0 258.7l91.4-78.4z"
            />
            <path
              fill="#EA4335"
              d="M272 107.7c39.9 0 75.8 13.7 104 40.5l78-78C403.2 24.8 341.2 0 272 0 166.3 0 72.7 59.6 27.1 149.9l91.4 70.7c21.7-64.6 82.2-112.9 153.5-112.9z"
            />
          </svg>
          Continue with Google
        </button>

        {error && <p className="text-red-500 text-center mt-6">{error}</p>}

        <p className="text-center text-sm text-gray-500 mt-6">
          Forgot your password?{" "}
          <span className="text-purple-600 hover:underline cursor-pointer">
            Contact Admin
          </span>
        </p>
      </div>
    </div>
  );
}
