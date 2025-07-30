# IT Request System

## Overview

This project is a comprehensive IT Equipment Request Management System designed to streamline the process of requesting and approving IT equipment within an organization. The system implements a multi-level approval workflow involving HR, HOD (Head of Department), and ITHOD (IT Head of Department) roles, ensuring proper authorization and tracking of equipment requests.

## Key Features

### Request Management
- Intuitive request form with dynamic validation
- Automatic HOD email population based on department selection
- Real-time form validation and error handling
- Prevention of duplicate submissions with loading indicators

### Multi-level Approval System
- Role-based access control (HR, HOD, ITHOD)
- Secure email-based approval workflow
- Single-use approval links for enhanced security
- Real-time status updates across all dashboards

### User Interface
- Responsive design for all screen sizes
- Role-specific dashboards with filtering and sorting
- Clear status indicators and action buttons
- Loading states and feedback for all user actions

### Security Features
- Secure approval link generation and validation
- Input sanitization and validation on both frontend and backend
- CORS protection with configurable origins
- Prevention of unauthorized access and duplicate actions

## Technology Stack

### Backend
- Node.js with Express.js framework
- MongoDB for data persistence
- Nodemailer for email notifications
- JWT for secure authentication
- Environment-based configuration

### Frontend
- Modern HTML5 and CSS3
- Vanilla JavaScript with ES6+ features
- Responsive design principles
- AJAX for asynchronous operations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance
- SMTP server access for email functionality

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd it-request-system
   ```

2. Backend Setup:
   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the backend directory with:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

5. Frontend Setup:
   - Open the frontend files in a web browser
   - Or serve them using a static file server

## Usage Guide

1. **Submitting Requests**
   - Access the request form
   - Fill in required details
   - Submit the form (button disables after submission)

2. **Approval Process**
   - Approvers receive email notifications
   - Click approval link in email
   - Choose to approve or reject
   - Link becomes invalid after use

3. **Dashboard Access**
   - HR Dashboard: Overview of all requests
   - HOD Dashboard: Department-specific requests
   - ITHOD Dashboard: Technical approval interface

## Security Considerations

- All approval links are single-use and time-limited
- Input validation on both client and server side
- CORS configuration for production deployment
- Secure email handling and link generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For technical support or feature requests, please:
1. Check existing issues
2. Create a new issue with detailed information
3. Contact the project maintainer

## License

This project is licensed under the MIT License - see the LICENSE file for details.
