export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = "https://mini-crm-platform-tnsk.onrender.com/api/oauth/google";
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Sign in with Google
    </button>
  );
}
