import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useGetProfileQuery } from "../../features/user/userApi";

const Profile = () => {
    const navigate = useNavigate();

    const { user: reduxUser } = useSelector(
        (state) => state.auth
    );

    const {
        data,
        isLoading,
        isError,
        error,
    } = useGetProfileQuery();

    // Backend response
    const user = data?.data || reduxUser;

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="w-8 h-8 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

                    <p className="mt-3 text-sm text-slate-500">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    // Error
    if (isError) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">

                    <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 text-xl font-bold">
                            !
                        </span>
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                        Unable to Load Profile
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        {error?.data?.message ||
                            "Something went wrong."}
                    </p>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mt-5 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                        Back to Dashboard
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

                {/* Back */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mb-5 text-sm text-slate-600 hover:text-blue-600 transition"
                >
                    ← Back to Dashboard
                </button>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Profile Header */}
                    <div className="bg-blue-600 px-6 py-8 text-center">

                        {/* Avatar */}
                        <div className="w-20 h-20 mx-auto rounded-full bg-white flex items-center justify-center">

                            <span className="text-3xl font-bold text-blue-600">
                                {user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                            </span>

                        </div>

                        {/* Name */}
                        <h1 className="mt-4 text-xl font-bold text-white">
                            {user?.name || "User"}
                        </h1>

                        {/* Email */}
                        <p className="mt-1 text-sm text-blue-100 break-all">
                            {user?.email || "No email"}
                        </p>

                    </div>

                    {/* Profile Details */}
                    <div className="p-6 sm:p-8">

                        <h2 className="text-lg font-semibold text-slate-900 mb-5">
                            Account Information
                        </h2>

                        <div className="space-y-5">

                            {/* Name */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <span className="text-sm text-slate-500">
                                    Full Name
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                    {user?.name || "N/A"}
                                </span>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <span className="text-sm text-slate-500">
                                    Email
                                </span>

                                <span className="text-sm font-medium text-slate-900 break-all">
                                    {user?.email || "N/A"}
                                </span>
                            </div>

                            {/* Phone */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <span className="text-sm text-slate-500">
                                    Phone
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                    {user?.phone || "N/A"}
                                </span>
                            </div>

                            {/* Email Verification */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <span className="text-sm text-slate-500">
                                    Email Verification
                                </span>

                                <span
                                    className={`text-sm font-semibold ${
                                        user?.isEmailVerified
                                            ? "text-green-600"
                                            : "text-red-500"
                                    }`}
                                >
                                    {user?.isEmailVerified
                                        ? "Verified"
                                        : "Not Verified"}
                                </span>
                            </div>

                            {/* Phone Verification */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <span className="text-sm text-slate-500">
                                    Phone Verification
                                </span>

                                <span
                                    className={`text-sm font-semibold ${
                                        user?.isPhoneVerified
                                            ? "text-green-600"
                                            : "text-red-500"
                                    }`}
                                >
                                    {user?.isPhoneVerified
                                        ? "Verified"
                                        : "Not Verified"}
                                </span>
                            </div>

                        </div>

                        {/* Back Button */}
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="w-full mt-8 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
};

export default Profile;