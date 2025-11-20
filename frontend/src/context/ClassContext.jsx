import {createContext} from "react";

// Define the shape of class context
export const ClassContext = createContext({
  // State
  classes: [],
  selectedClass: null,
  loading: false,
  error: null,

  // Actions
  fetchClasses: async () => {},
  createClass: async () => {},
  joinClass: async () => {},
  getClassDetails: async () => {},
  setSelectedClass: () => {},
  clearError: () => {},
});

export default ClassContext;
