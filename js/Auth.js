// components/Auth.js
import React from 'react';
import { GoogleLogin } from 'react-google-login';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const navigate = useNavigate();

    const responseGoogle = async (response) => {
        try {
            const token = response.tokenId;
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });
            
            const data = await res.json();
            localStorage.setItem('token', data.token);
            navigate('/dashboard');
        } catch (error) {
            console.error('Authentication failed:', error);
        }
    };

    return (
        <div className="auth-container">
            <h2>Log in to D&D Party Tracker</h2>
            <GoogleLogin
                clientId={process.env.REACT_APP_CLIENT_ID}
                buttonText="Login with Google"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                cookiePolicy="single_host_origin"
                className="google-login-button"
            />
        </div>
    );
};

export default Auth;