# Customer Retention System - Frontend

This is the React frontend for the Customer Retention Automation System. It provides a dashboard for managing customers, businesses, workflows, and viewing analytics.

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication
- React Hook Form with Yup validation
- React Context for state management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:8000`

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the frontend directory with:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Protected routes
- Automatic logout on token expiration

### Dashboard
- Overview statistics (total customers, new customers, active customers, scheduled SMS)
- Recent customers list
- Scheduled SMS management
- Quick access to all features

### API Integration

The frontend integrates with the following backend API endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

#### Dashboard
- `GET /api/dashboard/overview` - Dashboard statistics
- `GET /api/dashboard/customers/recent` - Recent customers
- `GET /api/dashboard/sms/scheduled` - Scheduled SMS messages
- `POST /api/dashboard/sms/cancel/{sms_id}` - Cancel scheduled SMS

#### Customers
- `GET /api/customers/` - List customers
- `POST /api/customers/` - Create customer
- `GET /api/customers/{id}` - Get customer details
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

#### Businesses
- `POST /api/businesses/` - Create business
- `GET /api/businesses/{id}` - Get business details
- `PUT /api/businesses/{id}` - Update business
- `POST /api/businesses/{id}/locations` - Add location mapping

#### Workflows
- `GET /api/workflows/` - List workflows
- `POST /api/workflows/` - Create workflow
- `GET /api/workflows/{id}` - Get workflow details
- `PUT /api/workflows/{id}` - Update workflow
- `DELETE /api/workflows/{id}` - Delete workflow

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (AuthContext)
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   └── Dashboard.tsx   # Main dashboard
├── services/           # API services
│   └── api.ts          # API client with axios
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
├── App.tsx             # Main app component with routing
├── index.css           # Global styles with Tailwind
└── index.tsx           # App entry point
```

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8000)

## Build for Production

1. Create a production build:
   ```bash
   npm run build
   ```

2. The build files will be in the `build` directory

## Development Notes

- The app uses React Router for client-side routing
- Authentication state is managed through React Context
- API requests are handled through a centralized axios instance
- Form validation is done with React Hook Form and Yup schemas
- Tailwind CSS is used for responsive, utility-first styling

## Common Issues

1. **CORS Errors**: Ensure the backend has CORS configured to allow requests from `http://localhost:3000`

2. **Authentication Errors**: Check that the backend is running and the JWT secret is properly configured

3. **Styling Issues**: Make sure Tailwind CSS is properly configured and the build process includes PostCSS
