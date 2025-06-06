import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();

  if (!user?.token) {
    return <Navigate to="/user-auth" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;