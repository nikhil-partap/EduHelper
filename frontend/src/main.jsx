import React from "react";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
// import "./index.css";
import App from "./App.jsx";
// import "react-toastify/dist/ReactToastify.css";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import RootLayout from "./router/Router.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<App />} />
      {/* <Route path="login" element={<Login />} /> */}
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      {/* <Route path="result" element={<ResultsPage />} /> */}
      {/* <Route path="make_profile" element={<MakeProfile />} /> */}
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
