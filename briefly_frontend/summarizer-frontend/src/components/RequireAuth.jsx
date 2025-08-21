// src/components/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const hastranscriptId = location.state && location.state.transcriptId;

  if (!hastranscriptId) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default RequireAuth;