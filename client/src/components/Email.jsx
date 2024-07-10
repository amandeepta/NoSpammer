import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiLoader } from 'react-icons/fi';
import { AiOutlineMail } from 'react-icons/ai';

const Email = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await axios.get('http://localhost:5000/emails/get', {
        withCredentials: true
      });
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Oops! An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <h2 className="text-3xl font-bold mb-5 text-center">Emails</h2>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <FiLoader className="animate-spin text-4xl text-blue-500" />
          <span className="ml-4 text-xl">Loading emails...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-full">
          <span className="text-xl text-red-500">{error}</span>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {emails.map((email) => (
            <li key={email.id} className="py-4">
              <div className="flex items-center space-x-4">
                <AiOutlineMail className="text-4xl text-blue-500" />
                <div>
                  <span className="block text-lg">{email.snippet}</span>
                  <span className="block text-gray-500 text-sm">{formatDate(email.receivedDate)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Email;
