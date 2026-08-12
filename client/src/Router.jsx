import { useEffect, useState } from "react";
import App from "./App";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";

export default function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    function handleBackButton() {
      setPath(window.location.pathname);
    }

    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, []);

  function navigate(to) {
    window.history.pushState({}, "", to);
    setPath(to);
  }

  function replaceRoute(to) {
    window.history.replaceState({}, "", to);
    setPath(to);
  }

  function handleLogout() {
    localStorage.removeItem("userId");
    replaceRoute("/signin");
  }

  const isAuthenticated = Boolean(localStorage.getItem("userId"));
  const isPrivateRoute = path === "/chat" || path === "/profile";
  const isAuthRoute = path === "/" || path === "/signin" || path === "/signup";

  useEffect(() => {
    if (!isAuthenticated && isPrivateRoute) {
      replaceRoute("/signin");
    }

    if (isAuthenticated && isAuthRoute) {
      replaceRoute("/chat");
    }
  }, [path, isAuthenticated]);

  if (!isAuthenticated) {
    return <AuthPage page={path === "/signup" ? "signup" : "signin"} navigate={navigate} />;
  }

  if (path === "/profile") return <ProfilePage onBack={() => navigate("/chat")} />;
  if (path === "/chat") return <App onProfileClick={() => navigate("/profile")} onLogout={handleLogout} />;

  return null;
}
