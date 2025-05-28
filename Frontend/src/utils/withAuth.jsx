import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponents) => {
  const AuthComponent = (props) => {
    const router = useNavigate();

    const isAuthenticated = () => {
      if (localStorage.getItem("token")) {
        return true;
      }
      return false;
    };

    useEffect(() => {
      if (!isAuthenticated()) {
        router("/auth");
      }
    }, []);
    // else
    return <WrappedComponents {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
