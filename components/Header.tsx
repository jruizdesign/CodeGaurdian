
import React from 'react';

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 3 9-3a12.02 12.02 0 00-2.382-9.975z" />
  </svg>
);

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center space-x-3">
        <ShieldIcon />
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Code Guardian
        </h1>
      </div>
      <p className="mt-2 text-center text-lg text-gray-400">
        Your AI-powered security partner for robust and secure code.
      </p>
    </header>
  );
};

export default Header;
