import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import ProtectedHeader from "./ProtectedHeader";

const ClientProtectedLayout = () => {
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);

  if (!isAuthenticated || userInfo?.userType !== "client") {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      <ProtectedHeader />
      <Outlet />
    </>
  );
};

export default ClientProtectedLayout;