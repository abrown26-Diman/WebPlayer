import React from "react";
import { GoogleLogin } from "react-google-login";

const OAuthLogin = ({ onLoginSuccess }) => {
  const handleLoginSuccess = (response) => {
    const token = response.accessToken;
    console.log("Access Token:", token);
    onLoginSuccess(token); // Pass access token to parent component
  };

  const handleLoginFailure = (error) => {
    console.error("Login failed:", error);
  };

  return (
    <div>
      <h2>Login to YouTube</h2>
      <GoogleLogin
        clientId="218732270797-sldpk0fruhqre2f9tudb0udv18tk1ma3.apps.googleusercontent.com" // Replace with your actual Client ID
        buttonText="Login with Google"
        onSuccess={handleLoginSuccess}
        onFailure={handleLoginFailure}
        scope="https://www.googleapis.com/auth/youtube.readonly"
      />
    </div>
  );
};

export default OAuthLogin;
