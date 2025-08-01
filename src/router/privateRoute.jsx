import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const userEmail = sessionStorage.getItem("userEmail");
  return userEmail ? children : <Navigate to="/login" />;
};

export default PrivateRoute;