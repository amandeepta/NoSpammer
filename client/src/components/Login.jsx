import { FaGoogle } from 'react-icons/fa';

function Login() {
    const googleAuth = () => {
        const apiUrl = "http://localhost:5000";
        window.open(
            `${apiUrl}/auth/google/callback`,
            "_self"
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-5">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 mb-8 text-center">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">Welcome to NoSpammer</h2>
                <p className="text-gray-700 mb-2">This app uses a machine learning model to filter your spam messages.</p>
                <p className="text-gray-700 mb-2">This app displays the snippets of the emails that are detected as spam.</p>
                <p className="text-gray-700 mb-2">This app allows you to log in to your Gmail account to fetch emails.</p>
                <p className="text-gray-700">This app uses custom token-based authentication to securely store your credentials.</p>
            </div>
            <button 
                onClick={googleAuth} 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full inline-flex items-center shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
                <FaGoogle className="w-6 h-6 mr-2" />
                <span>Sign in with Google</span>
            </button>
        </div>
    );
}

export default Login;
