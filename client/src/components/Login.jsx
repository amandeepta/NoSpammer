
import { FaGoogle } from 'react-icons/fa';

function Login() {
    const googleAuth = () => {
        const apiUrl = "http://localhost:5000"; // Accessing environment variable
        window.open(
            `${apiUrl}/auth/google/callback`,
            "_self"
        );
    };

    return (
        <button onClick={googleAuth} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
            <FaGoogle className="w-6 h-6 mr-2" />
            <span>Sign in with Google</span>
        </button>
    );
}

export default Login;
