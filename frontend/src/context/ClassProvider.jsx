import {useReducer, useCallback, useMemo} from "react";
import {ClassContext} from "./ClassContext";
import {classAPI} from "../services/api";
import {useAuth} from "../hooks/useAuth";

// Class reducer for state management
const classReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return {...state, loading: true, error: null};

    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        classes: action.payload,
        error: null,
      };

    case "FETCH_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "CREATE_SUCCESS":
      return {
        ...state,
        classes: [action.payload, ...state.classes],
        loading: false,
        error: null,
      };

    case "JOIN_SUCCESS":
      return {
        ...state,
        classes: [action.payload, ...state.classes],
        loading: false,
        error: null,
      };

    case "SET_SELECTED_CLASS":
      return {
        ...state,
        selectedClass: action.payload,
        loading: false,
        error: null,
      };

    case "CLEAR_ERROR":
      return {...state, error: null};

    default:
      return state;
  }
};

const initialState = {
  classes: [],
  selectedClass: null,
  loading: false,
  error: null,
};

export const ClassProvider = ({children}) => {
  const [state, dispatch] = useReducer(classReducer, initialState);
  const {user} = useAuth();

  // Fetch classes based on user role
  const fetchClasses = useCallback(async () => {
    if (!user) return;

    try {
      dispatch({type: "FETCH_START"});

      const response =
        user.role === "teacher"
          ? await classAPI.getTeacherClasses()
          : await classAPI.getStudentClasses();

      dispatch({type: "FETCH_SUCCESS", payload: response.data.classes});
      return {success: true, data: response.data.classes};
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch classes";
      dispatch({type: "FETCH_ERROR", payload: errorMessage});
      return {success: false, error: errorMessage};
    }
  }, [user]);

  // Create new class (teacher only)
  const createClass = useCallback(async (classData) => {
    try {
      dispatch({type: "FETCH_START"});

      const response = await classAPI.createClass(classData);
      dispatch({type: "CREATE_SUCCESS", payload: response.data.class});

      return {success: true, data: response.data.class};
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create class";
      dispatch({type: "FETCH_ERROR", payload: errorMessage});
      return {success: false, error: errorMessage};
    }
  }, []);

  // Join class (student only)
  const joinClass = useCallback(
    async (classCode) => {
      try {
        dispatch({type: "FETCH_START"});

        const response = await classAPI.joinClass(classCode);

        // Fetch updated classes list
        await fetchClasses();

        return {success: true, message: response.data.message};
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to join class";
        dispatch({type: "FETCH_ERROR", payload: errorMessage});
        return {success: false, error: errorMessage};
      }
    },
    [fetchClasses]
  );

  // Get class details
  const getClassDetails = useCallback(async (classId) => {
    try {
      dispatch({type: "FETCH_START"});

      const response = await classAPI.getClassDetails(classId);
      dispatch({type: "SET_SELECTED_CLASS", payload: response.data.class});

      return {success: true, data: response.data.class};
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch class details";
      dispatch({type: "FETCH_ERROR", payload: errorMessage});
      return {success: false, error: errorMessage};
    }
  }, []);

  // Set selected class
  const setSelectedClass = useCallback((classData) => {
    dispatch({type: "SET_SELECTED_CLASS", payload: classData});
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({type: "CLEAR_ERROR"});
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      ...state,
      fetchClasses,
      createClass,
      joinClass,
      getClassDetails,
      setSelectedClass,
      clearError,
    }),
    [
      state,
      fetchClasses,
      createClass,
      joinClass,
      getClassDetails,
      setSelectedClass,
      clearError,
    ]
  );

  return (
    <ClassContext.Provider value={contextValue}>
      {children}
    </ClassContext.Provider>
  );
};

export default ClassProvider;
