import React from 'react';

const AuthDivider: React.FC = () => {
  return (
    <div className="flex items-center my-6">
      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
      <span className="mx-4 text-gray-400 dark:text-gray-500 font-medium">or</span>
      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
    </div>
  );
};

export default AuthDivider;
