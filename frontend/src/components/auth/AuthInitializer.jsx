import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  setAccessToken,
  setLoading,
  logout,
} from "../../features/auth/authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken =
          localStorage.getItem("accessToken");

        if (accessToken) {
          dispatch(setAccessToken(accessToken));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error(
          "Auth initialization failed:",
          error
        );

        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return children;
};

export default AuthInitializer;