import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatedBy from './CreatedBy';

const LandingPage = () => {
  let navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/chat');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient-xy">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">Welcome to Our Chat Application</h1>
        <p className=" mt-2 text-white">Get started by watching our quick demo:</p>
      </div>

      <div className="text-center">
        <p className=" text-lg text-white">To start using the chat application, please follow these steps:</p>
        <ul className=" mb-5 text-left list-disc list-inside">
          <li className="text-white">First, sign up to create a new account.</li>
          <li className="text-white">Then, log in to access the chat.</li>
        </ul>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/signup')}
            className="px-10 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none transition duration-300 ease-in-out transform hover:scale-105"
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-10 py-2  text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none transition duration-300 ease-in-out transform hover:scale-105"
          >
            Login
          </button>
        </div>
      </div>
      <CreatedBy
                  mystyle={"mt-10 text-sm font-semibold"}
                />
    </div>
  );
};

export default LandingPage;


