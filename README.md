# No Spammer

## Overview

No Spammer is a machine learning-based email filtering application. Users log in using Google authentication, and the app collects their emails. The collected emails are then analyzed by a trained ML model to identify and filter out spam messages, providing users with a cleaner and more efficient inbox.

## Features

- **Google Login**: Users can securely log in via their Google account.
- **Email Collection**: Automatically retrieves emails from the user's inbox after login.
- **Spam Detection**: An ML model is used to classify and filter out spam emails from the inbox.
- **User Dashboard**: View filtered emails and interact with the spam filter results.
- **Efficient Inbox Management**: Focus on important emails while the spam ones are automatically moved to a separate folder.

## Technologies

- **Frontend**: React
- **Backend**: Node.js, Express
- **Machine Learning**: Python, Scikit-learn (or another ML framework)
- **Google Authentication**: Google OAuth API
- **Email API**: Gmail API
- **Hosting**: 
  - Frontend: Vercel
  - Backend: Heroku (or Render)

## Installation

### Prerequisites

- Node.js
- Python (for running the ML model)
- Node package manager
- A Google Developer account (for Gmail API and Google OAuth)

### Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/no-spammer.git
    cd no-spammer
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    - Create a `.env` file in the root directory and add the following:
    ```bash
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_REDIRECT_URI=http://localhost:3000/callback
    GMAIL_API_KEY=your_gmail_api_key
    BACKEND_URL=https://your-backend-url.com
    FRONTEND_URL=https://your-frontend-url.com
    ```

4. Start the development server:
    ```bash
    npm run dev
    ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Log in using your Google account.
3. Allow the app to access your Gmail inbox.
4. The ML model will analyze and filter spam emails automatically.

## Production Build

To create a production build, run:
```bash
yarn build
