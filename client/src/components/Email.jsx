// Email.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Email = () => {
  const [emails, setEmails] = useState([]);

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
    }
  };

  return (
    <div>
      <h2>Emails</h2>
      <ul>
        {emails.map((email) => (
          <li key={email.id}>{email.snippet}</li>
        ))}
      </ul>
    </div>
  );
};

export default Email;
