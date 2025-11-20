import {useContext} from "react";
import {ClassContext} from "../context/ClassContext";

export const useClass = () => {
  const context = useContext(ClassContext);

  if (!context) {
    throw new Error("useClass must be used within a ClassProvider");
  }

  return context;
};

export default useClass;
