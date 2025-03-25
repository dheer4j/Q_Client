# Quantum Secure Email Client

A modern email client with quantum-resistant encryption for secure communication in the post-quantum era.

## Features

- Quantum-resistant encryption for email communications
- Real-time notifications and updates via WebSockets
- Dark theme UI with responsive design
- Secure key exchange mechanism
- Email composition with encryption options
- Folder organization and search functionality
- Encryption status indicators

## Project Structure

The project consists of two main components:

1. **Backend (Rust)**: Provides the quantum encryption services, WebSocket communication, and API endpoints
2. **Frontend (React + TypeScript)**: User interface with dark theme and responsive design

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Rust (latest stable)
- Cargo (comes with Rust)
- PostgreSQL (for production use)

## Installation

### Backend Setup

1. Navigate to the project root directory:
   ```
   cd quantum_email_client
   ```

2. Install Rust dependencies:
   ```
   cargo build
   ```

3. Create a `.env` file in the project root with the following content:
   ```
   HOST=127.0.0.1
   PORT=8080
   DATABASE_URL=postgres://postgres:password@localhost:5432/quantum_email
   JWT_SECRET=development_quantum_secure_jwt_secret_key
   WEBSOCKET_PORT=8081
   ```

   Note: For development, you can use the default configuration. For production, update with your actual database credentials and a secure JWT secret.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd quantum_email_client/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install Tailwind CSS:
   ```
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

## Running the Application

### Start the Backend

1. From the project root directory:
   ```
   cargo run
   ```

   This will start the Rust backend server on http://localhost:8080 and the WebSocket server on port 8081.

### Start the Frontend

1. From the frontend directory:
   ```
   cd frontend
   npm start
   ```

   This will start the development server on http://localhost:3000.

## Development Mode

For development, the application includes mock data and services that can be used without a running backend:

1. The frontend services include mock implementations that return sample data
2. Authentication uses local storage for demo purposes
3. Encryption status is simulated

## Testing

### Backend Tests

Run the backend tests with:
```
cargo test
```

### Frontend Tests

Run the frontend tests with:
```
cd frontend
npm test
```

## Deployment

### Backend Deployment

1. Build the optimized release version:
   ```
   cargo build --release
   ```

2. The executable will be in `target/release/quantum_email_client`

### Frontend Deployment

1. Create an optimized production build:
   ```
   cd frontend
   npm run build
   ```

2. The build artifacts will be in the `build` folder

## Security Considerations

- The JWT secret should be a strong, randomly generated string in production
- Database credentials should be secured and not committed to version control
- For production, use HTTPS for all API communications
- Regularly rotate encryption keys

## License

MIT

## Acknowledgments

- This project uses post-quantum cryptography libraries
- UI design inspired by modern email clients with a focus on security
