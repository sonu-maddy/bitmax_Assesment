import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="text-center">

        <h1 className="text-7xl font-bold text-blue-600">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          Page Not Found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          The page you are looking for does not exist.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-6 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          Go to Login
        </button>

      </div>
    </div>
  );
};

export default NotFound;