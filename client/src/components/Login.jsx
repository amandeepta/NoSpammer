import React from 'react';

function Login() {
    const googleAuth = () => {
        const apiUrl = "http://localhost:5000"; // Accessing environment variable
        window.open(
            `${apiUrl}/auth/google/callback`,
            "_self"
        );
    };

    return (
        <button onClick={googleAuth}>
            <span>Sign in with Google</span>
        </button>
    );
}

export default Login;
