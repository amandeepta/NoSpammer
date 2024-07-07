import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Email from './components/Email';

function App() {
  return (

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/emails" element={<Email />} />
      </Routes>
  );
}

export default App;
