import {useReducer, useEffect} from "react";
import {AuthContext} from "./AuthContext";
import {authAPI} from "../services/api";

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return {...state, loading: true, error: null};
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };
    case "LOGIN_ERROR":
    case "REGISTER_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "CLEAR_ERROR":
      return {...state, error: null};
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true, // Start with loading true to check authentication
  error: null,
};

export const AuthProvider = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          // Verify token is still valid
          const response = await authAPI.getMe();
          
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {user: response.data.data.user, token},
          });
        } catch (error) {
          console.log("Token validation failed:", error.message);
          localStorage.removeItem("token");
          dispatch({type: "LOGOUT"});
        }
      } else {
        // No token found, set loading to false
        dispatch({type: "LOGOUT"});
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({type: "LOGIN_START"});
    try {
      const response = await authAPI.login(credentials);
      const {user, token} = response.data.data; // Fix: use response.data.data

      localStorage.setItem("token", token);
      dispatch({type: "LOGIN_SUCCESS", payload: {user, token}});
      return {success: true};
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Login failed"; // Fix: use .error instead of .message
      dispatch({type: "LOGIN_ERROR", payload: errorMessage});
      return {success: false, error: errorMessage};
    }
  };

  const register = async (userData) => {
    dispatch({type: "REGISTER_START"});
    try {
      const response = await authAPI.register(userData);
      const {user, token} = response.data.data; // Fix: use response.data.data

      localStorage.setItem("token", token);
      dispatch({type: "REGISTER_SUCCESS", payload: {user, token}});
      return {success: true};
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Registration failed"; // Fix: use .error instead of .message
      dispatch({type: "REGISTER_ERROR", payload: errorMessage});
      return {success: false, error: errorMessage};
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({type: "LOGOUT"});
  };

  const clearError = () => {
    dispatch({type: "CLEAR_ERROR"});
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
