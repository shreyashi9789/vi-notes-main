# Vi-Notes — Writing Behavior Analysis Platform

Vi-Notes is a full-stack web application developed during a MERN Stack virtual internship at Vicharanashala Lab, IIT Ropar. The project explores how writing-session behavior, such as typing activity, deletions, paste events, and pauses, can be analyzed alongside the final written text.

The application provides user authentication, a browser-based writing editor, rule-based writing behavior analysis, and MongoDB persistence for writing sessions.

> **Project scope:** This repository contains a foundational implementation of the writing behavior analysis concept. Its current analysis engine uses predefined rules and heuristics; it does not use a trained machine-learning model to determine authorship.

## Features

- **User authentication:** Registration and login with password hashing using bcrypt.
- **JWT-based authorization:** Protected API access using JSON Web Tokens.
- **Writing editor:** A React-based interface for entering and submitting text.
- **Writing event tracking:** Records typing-related events, deletion events, paste events, and event timestamps.
- **Pause detection:** Identifies gaps greater than two seconds between consecutive recorded events.
- **Writing statistics:** Calculates word count, event counts, paste statistics, and pause-related metrics.
- **Rule-based behavior scoring:** Applies predefined rules to produce a heuristic score and assessment.
- **Database persistence:** Stores user accounts and writing-session records in MongoDB.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| HTTP communication | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password hashing | bcryptjs |
| Configuration | dotenv |
| Cross-origin requests | CORS |

## Architecture

The application follows a client-server architecture.

1. The user interacts with the React frontend to register, log in, or write text.
2. The frontend records selected writing events and sends requests to the Express backend using Axios.
3. The backend verifies JWTs for protected requests.
4. The session-analysis route calculates writing statistics and applies the rule-based scoring logic.
5. Mongoose saves the writing session in MongoDB.
6. The backend returns a JSON response, which the frontend uses to display the analysis.

```text
User
 |
 v
React + Vite Frontend
 |
 | HTTP requests (Axios)
 v
Node.js + Express Backend
 |
 +---- Authentication Routes
 |
 +---- JWT Authentication Middleware
 |
 +---- Writing Session Analysis
 |
 v
Mongoose
 |
 v
MongoDB
```

## Project Structure

```text
vi-notes-main/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Session.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── session.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

*The structure above describes the intended source layout. Keep `.env.example` as a template containing placeholder values, and do not commit a real `.env` file.*

## Getting Started

### Prerequisites

Install the following before running the application:

- Node.js and npm
- MongoDB, either a local instance or a configured MongoDB deployment
- Git

### 1. Clone the repository

```bash
git clone https://github.com/shreyashi9789/vi-notes-main.git
cd vi-notes-main
```

### 2. Configure the backend

Navigate to the backend directory and install its dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory. Configure the variable names to match those read by `backend/server.js` and the authentication routes.

Example configuration:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/vi-notes
JWT_SECRET=replace_with_a_long_random_secret
```

Make sure MongoDB is running and that the connection string is valid.

Start the backend using the start script defined in `backend/package.json`. If no start script is configured, the server entry point can be run directly:

```bash
node server.js
```

The example configuration assumes the backend reads `PORT`, `MONGO_URI`, and `JWT_SECRET`. Verify the exact environment variable names in your source code before using it.

### 3. Configure the frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will print the local development URL in the terminal. Open that URL in your browser.

Ensure the Axios base URL or API requests in the frontend point to the running backend. If the application uses a hardcoded local URL, update it as necessary for your environment.

## API Endpoints

The current backend exposes the following endpoints:

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Not required |
| POST | `/api/auth/login` | Authenticate a user and issue a JWT | Not required |
| POST | `/api/session/create` | Analyze and save a writing session | Required |

### Registration

The registration endpoint receives an email and password, checks for an existing account, hashes the password, and saves the user record.

### Login

The login endpoint verifies the supplied credentials using bcrypt and returns a signed JWT upon successful authentication.

### Create writing session

The session endpoint receives the written content and recorded event data. After authentication, it calculates the available metrics, generates a rule-based assessment, and saves the session in MongoDB.

A protected request must include the JWT in its `Authorization` header in the format expected by the authentication middleware.

## Writing Behavior Analysis

The current implementation calculates several metrics from the submitted writing session:

- **Word count:** Counts whitespace-separated words in the submitted text.
- **Typing events:** Counts recorded events classified as typing.
- **Deletion events:** Counts recorded Backspace and Delete events.
- **Paste events:** Counts recorded paste operations.
- **Paste size:** Calculates the largest recorded paste size.
- **Pause statistics:** Counts consecutive-event timestamp gaps greater than 2,000 milliseconds and identifies the longest gap.
- **Behavior score:** Starts from a baseline score and adjusts it using predefined rules for typing, deletion, pauses, and paste size.

The score is clamped to the range from 0 to 100. The backend maps score ranges to qualitative assessment labels and returns supporting evidence.

These metrics are heuristic indicators of observed browser interaction. They do not establish whether text was written by a human, generated by AI, or copied from another source.

## Database Models

### User

The User model stores account information, including:

- Email address
- Hashed password

### Session

The Session model stores writing-session information, including:

- Associated user ID
- Submitted text content
- Recorded writing events
- Session creation timestamp

The session model references the associated user through a MongoDB ObjectId.

## Security Considerations

- Passwords are hashed before being stored.
- Protected session requests require JWT verification.
- Database credentials and signing secrets should be stored in environment variables.
- Real secrets must not be committed to version control.
- Input validation, request-size limits, secure token handling, and appropriate data-retention controls are important for production use.

The current implementation is a prototype and should receive additional security and validation work before being used with sensitive or production data.

## Current Limitations

- The behavior score is rule-based rather than generated by a trained machine-learning model.
- Event tracking does not capture every aspect of typing behavior and may count non-character key presses as typing events.
- Pause detection measures timestamp gaps, not a user's mental state or intention.
- The system does not independently establish whether text is AI-generated.
- The current backend saves submitted writing content along with event metadata.
- The current API does not expose a dedicated endpoint for retrieving a user's previous sessions.

## Future Improvements

- Improve keyboard-event classification and writing-session validation.
- Add session-history retrieval and a more detailed analytics interface.
- Add automated tests for API routes, authentication, and analysis calculations.
- Improve input validation, error handling, and environment-specific configuration.
- Evaluate alternative behavioral features against a representative, labeled dataset before making authorship-related claims.
- Improve privacy controls, data retention, and deletion capabilities.

## Learning Outcomes

This project provided practical experience with:

- Building a React frontend using component state and event handlers.
- Integrating frontend and backend components through REST APIs.
- Implementing registration, password hashing, and JWT authentication.
- Designing MongoDB schemas using Mongoose.
- Processing timestamped event data with JavaScript.
- Handling asynchronous requests and errors.
- Understanding the difference between a rule-based prototype and a validated machine-learning system.

## Author

**Shreyashi Chatterjee**

GitHub: [shreyashi9789](https://github.com/shreyashi9789)

Repository: [vi-notes-main](https://github.com/shrey
