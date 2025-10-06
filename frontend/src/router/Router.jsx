// src/Router.jsx
import React from "react";
import {Outlet, NavLink} from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-100 to-black ">
      {/* simple nav — keep it small, you can expand later */}
      {/* <nav className="p-4 flex gap-4">
        <NavLink to="/" end className="text-black">
          Home
        </NavLink>
        <NavLink to="/signup" className="text-black">
          SignUp
        </NavLink>
        <NavLink to="/login" className="text-black">
          Login
        </NavLink>
      </nav> */}

      {/* Where child routes render */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
