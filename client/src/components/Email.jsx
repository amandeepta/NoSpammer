import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiLoader } from 'react-icons/fi';
import { AiOutlineMail } from 'react-icons/ai';

const Email = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async (pageToken = null) => {
    try {
      const url = pageToken ? `http://localhost:5000/emails/get?pageToken=${pageToken}` : 'http://localhost:5000/emails/get';
      const response = await axios.get(url, {
        withCredentials: true
      });
      const { messages, nextPageToken } = response.data;

      setEmails(prevEmails => [...prevEmails, ...messages]);
      setNextPageToken(nextPageToken);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Oops! An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEmails = () => {
    if (nextPageToken) {
      setLoadingMore(true);
      fetchEmails(nextPageToken);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-5">
      <h2 className="text-3xl font-bold mb-5 text-center text-blue-900">Emails</h2>
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
        <>
          <ul className="space-y-4">
            {emails.map((email, index) => (
              <li key={`${email.id}-${index}`} className="bg-white shadow-md rounded-lg p-4 transition-transform transform hover:scale-90">
                <div className="flex items-center space-x-4">
                  <AiOutlineMail className="text-4xl text-blue-500" />
                  <div>
                    <span className="block text-lg font-semibold text-gray-800">{email.snippet}</span>
                    <span className="block text-gray-500 text-sm">{formatDate(email.receivedDate)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {nextPageToken && (
            <div className="flex justify-center mt-4">
              <button
                onClick={loadMoreEmails}
                className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg focus:outline-none transition-opacity duration-300 ${loadingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Email;
