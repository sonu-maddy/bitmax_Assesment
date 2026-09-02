import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useLogoutUserMutation } from "../../features/auth/authApi";

const Dashboard = () => {
  const navigate = useNavigate();

  const { user } = useSelector(
    (state) => state.auth
  );

  const [logoutUser, { isLoading }] =
    useLogoutUserMutation();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);

      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">

      

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">

          <p className="text-sm text-slate-500">
            Welcome back
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mt-1">
            {user?.name || "User"}
          </h2>

          <p className="text-slate-500 mt-2">
            You are successfully authenticated.
          </p>

        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">
              Account
            </p>

            <h3 className="text-lg font-semibold mt-2">
              Active
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">
              Email
            </p>

            <h3 className="text-lg font-semibold mt-2 break-all">
              {user?.email || "Not available"}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">
              Authentication
            </p>

            <h3 className="text-lg font-semibold text-green-600 mt-2">
              Verified
            </h3>
          </div>

        </div>

      </main>

    </div>
  );
};

export default Dashboard;