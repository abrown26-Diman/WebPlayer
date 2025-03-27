import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const OAuthLogin = ({ onLoginSuccess }) => {
  const handleLoginSuccess = (credentialResponse) => {
    const token = credentialResponse.credential; // Google token
    console.log("Google OAuth Token:", token);
    onLoginSuccess(token); // Pass token to parent component
  };

  const handleLoginFailure = (error) => {
    console.error("Login failed:", error);
  };

  return (
    <GoogleOAuthProvider clientId="218732270797-sldpk0fruhqre2f9tudb0udv18tk1ma3.apps.googleusercontent.com">
      <div>
        <h2>Login to YouTube</h2>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginFailure}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default OAuthLogin;

