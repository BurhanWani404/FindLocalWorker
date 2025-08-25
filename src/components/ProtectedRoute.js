import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";

const ProtectedRoute = ({
  isAuthenticated,
  allowedUserType = "worker",
  children,
}) => {
  const { userInfo } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  if (userInfo?.userType !== allowedUserType) {
    return <Navigate to="/home" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
