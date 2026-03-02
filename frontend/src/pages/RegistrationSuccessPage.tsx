import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Success Icon */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Registration Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your NSE account has been created successfully.
          </p>
        </div>

        {/* Success Card */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-green-700">
                  <p className="font-medium">Account Created Successfully</p>
                  <p className="mt-1">Your registration has been received and is being processed.</p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-3">
                Next Steps:
              </h3>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                <li>
                  <strong>Wait for administrator approval</strong> - Your account is being reviewed
                </li>
                <li>
                  <strong>Receive your Unique Identification Code</strong> - Admin will send this separately
                </li>
                <li>
                  <strong>Use both email and unique code</strong> - Required for login
                </li>
                <li>
                  <strong>Complete your profile</strong> - After first login
                </li>
              </ol>
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Important Security Notice:
              </h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• Your unique identification code is <strong>confidential</strong></p>
                <p>• Never share this code with anyone</p>
                <p>• The code will be provided by the administrator</p>
                <p>• Keep your login credentials secure</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">
                Need Help?
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• Email: support@nse.co.ke</p>
                <p>• Phone: +254 712 345 678</p>
                <p>• Office Hours: Mon-Fri, 8:00 AM - 5:00 PM</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Go to Login
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="text-center text-sm text-gray-600">
          <p>You will receive an email notification when your account is approved.</p>
          <p className="mt-1">Check your spam folder if you don't see the email.</p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessPage;
