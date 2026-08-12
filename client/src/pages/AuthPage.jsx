import AuthLayout from "../components/auth/AuthLayout";
import SignIn from "../components/auth/SignIn";
import SignUp from "../components/auth/SignUp";

export default function AuthPage({ page, navigate }) {
  function handleSuccess(user) {
    localStorage.setItem("userId", user._id);
    navigate("/chat");
  }

  return (
    <AuthLayout>
      {page === "signup"
        ? <SignUp onSwitch={() => navigate("/signin")} onSuccess={handleSuccess} />
        : <SignIn onSwitch={() => navigate("/signup")} onSuccess={handleSuccess} />}
    </AuthLayout>
  );
}
