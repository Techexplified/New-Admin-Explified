import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/authSlice";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("admin@explified.com");
  const [password, setPassword] = useState("exp123");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [triedLogin, setTriedLogin] = useState(false);

  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const handleLogin = () => {
    // Dummy credentials — replace with actual DB/API in real app
    const validEmail = "admin@explified.com";
    const validPassword = "exp123";

    if (email === validEmail && password === validPassword) {
      dispatch(login({ email }));
      toast.success("Login successful");
      navigate(redirectPath);
    } else {
      toast.error("Invalid email or password");
    }
  };

  useEffect(() => {
    if (triedLogin) {
      if (isAuthenticated) {
        toast.success("Login successful");
        navigate(redirectPath);
      } else {
        toast.error("Invalid email or password");
      }
    }
  }, [isAuthenticated, triedLogin, navigate, redirectPath]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-purple-200 to-indigo-200">
      <div className="bg-white px-10 py-12 rounded-3xl shadow-2xl w-full max-w-md transition-all duration-300 hover:scale-[1.01]">
        <h2 className="text-4xl font-bold text-center text-purple-700 mb-10 tracking-wide">
          Explified admin Login
        </h2>

        {/* Email Field */}
        <div className="relative mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="peer w-full px-4 pt-6 pb-2 text-base border border-gray-300 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder=" "
          />
          <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-3 peer-focus:text-sm peer-focus:text-purple-600">
            Admin Email
          </label>
        </div>

        {/* Password Field */}
        <div className="relative mb-8">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="peer w-full px-4 pt-6 pb-2 text-base border border-gray-300 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder=" "
          />
          <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-3 peer-focus:text-sm peer-focus:text-purple-600">
            Admin Password
          </label>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold text-lg shadow-md hover:bg-purple-700 hover:shadow-lg transition-all duration-300"
        >
          Log In
        </button>

        {/* Footer Message */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Forgot your password?{" "}
          <span className="text-purple-600 hover:underline cursor-pointer">
            Contact Admin
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
