import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { useLogoutUserMutation } from "../../features/auth/authApi";
import { logout } from "../../features/auth/authSlice";

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isAuthenticated = useSelector(
        (state) => state.auth.isAuthenticated
    );

    const [logoutUser, { isLoading }] =
        useLogoutUserMutation();

    const handleLogout = async () => {
        try {
            await logoutUser().unwrap();
        } catch (error) {
            console.error("Logout API failed:", error);
        } finally {
            dispatch(logout());
            navigate("/login");
        }
    };

    return (
        <nav className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-xl font-bold text-blue-600"
                >
                    Bitmax
                </button>

                {/* Navigation */}
                <div className="flex items-center gap-3">

                    {isAuthenticated ? (
                        <>
                            <button
                                onClick={() => navigate("/profile")}
                                className="text-sm text-slate-600 hover:text-blue-600"
                            >
                                Profile
                            </button>

                            <button
                                onClick={handleLogout}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60"
                            >
                                {isLoading
                                    ? "Logging out..."
                                    : "Logout"}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/login")}
                                className="text-sm text-slate-600 hover:text-blue-600"
                            >
                                Login
                            </button>

                            <button
                                onClick={() => navigate("/register")}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Register
                            </button>
                        </>
                    )}

                </div>
            </div>
        </nav>
    );
};

export default Navbar;