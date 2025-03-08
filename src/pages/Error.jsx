import React from 'react';

const ErrorPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md text-center">
                <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
                <p className="text-xl text-gray-700 mb-4">Page Not Found</p>
                <a href="/" className="text-blue-500 hover:underline">
                    Go back to Home
                </a>
            </div>
        </div>
    );
};

export default ErrorPage;