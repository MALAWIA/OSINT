# 🔐 NSE Authentication System - Frontend

Complete authentication system for NSE Authentication platform with dual-factor authentication (email + password + unique identification code).

## 🚀 Features

### 🔐 Authentication Features
- **User Registration** with comprehensive validation and password strength indicators
- **Dual-Factor Login** (email + password + unique ID)
- **Password Visibility Toggle** for better UX
- **Form Validation** with real-time error feedback
- **Remember Me** functionality for user convenience
- **Loading States** with spinners and progress indicators
- **Responsive Design** for all devices (mobile, tablet, desktop)

### 🛡️ Security Features
- **Unique Identification Code** system integration
- **Password Strength Requirements** (8+ chars, uppercase, lowercase, numbers)
- **Email Validation** with proper format checking
- **Phone Number Validation** with international format support
- **Secure Token Storage** in localStorage
- **Automatic Logout** on token expiration
- **Protected Routes** with authentication guards

### 🎨 UI/UX Features
- **Modern Design** with Tailwind CSS and gradient backgrounds
- **Responsive Layout** for mobile and desktop
- **Accessibility** with proper ARIA labels and semantic HTML
- **Loading Indicators** for better UX
- **Error Messages** with clear, actionable feedback
- **Success States** with next steps guidance
- **Password Strength Meter** with visual indicators
- **Interactive Elements** (toggles, buttons, forms)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx         # Login page
│   │   ├── SignupPage.tsx        # Registration page
│   │   ├── DashboardPage.tsx      # User dashboard
│   │   └── RegistrationSuccessPage.tsx  # Success page
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.ts          # Authentication hook
│   └── App.tsx             # Main app with routing
├── package.json
├── tailwind.config.js
└── README.md
```

## 🔧 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- React 18+
- TypeScript

### Setup Steps

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   ```bash
   # Create .env file
   REACT_APP_API_URL=http://localhost:8000/api
   ```

4. **Start Development Server**
   ```bash
   # Option 1: Using npm
   npm start
   
   # Option 2: Using starter script
   python start_frontend.py
   ```

5. **Open Browser**
   - Navigate to: http://localhost:3000

## 🔐 Authentication Flow

### User Registration
1. User fills registration form with personal details
2. System validates email, password strength, phone format
3. Account created and pending admin approval
4. Administrator provides unique identification code
5. User can login with email + password + unique ID

### User Login
1. User enters email, password, and unique identification code
2. Backend validates all three authentication factors
3. JWT token issued and stored locally
4. User redirected to dashboard

### Protected Routes
- Unauthenticated users are redirected to login
- After successful login, users access protected content
- Automatic logout on token expiration

## 📱 Pages Overview

### 🔐 Login Page (`/login`)
- Email input with validation and remember me
- Password input with visibility toggle
- Unique ID input with visibility toggle and format validation
- Submit button with loading state
- Error display for failed attempts
- Navigation links to signup and password reset

### 📝 Signup Page (`/signup`)
- Personal info (first name, last name)
- Contact info (email, phone number)
- Password fields with strength validation and visual indicator
- Terms & conditions checkbox
- Real-time validation with error messages

### ✅ Registration Success (`/registration-success`)
- Success message with confirmation
- Next steps for user guidance
- Security notice about unique ID
- Navigation buttons to login and home

### � Dashboard (`/dashboard`)
- User profile with avatar and information
- Quick actions for profile, password, security
- Account information with detailed user data
- Navigation header with logout functionality

## 🚀 Quick Start

```bash
cd frontend
npm install
npm start
# Then visit http://localhost:3000
```

## 🎯 Available Routes

- **/** - Login page (default)
- **/login** - Login page
- **/signup** - User registration
- **/registration-success** - Success page after signup
- **/dashboard** - Protected dashboard (requires login)
- **/profile** - User profile (protected)
- **/change-password** - Password change (protected)
- **/security** - Security settings (protected)
- **/forgot-password** - Password reset (public)

## 🔐 Security Features

- **Dual-Factor Authentication**: Email + Password + Unique ID
- **Password Requirements**: 8+ chars with uppercase, lowercase, numbers
- **Form Validation**: Real-time feedback on all inputs
- **Secure Storage**: JWT tokens in localStorage
- **Rate Limiting**: Protection against brute force attacks
- **Protected Routes**: Authentication guards for sensitive pages

Ready for production deployment with your NSE Authentication backend! 🚀
