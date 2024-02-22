import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  let navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/chat');
    }
  }, [navigate]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Our Chat Application</h1>
        <p className="mt-4">Get started by watching our quick demo:</p>
      </div>

      {/* Video Container */}
      <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-lg shadow-lg">
        {/* <video
          className="w-full"
          controls
          src="https://youtu.be/2NPHJgg5ROM?si=dtzhf3t9BXzyRGuQ" // Replace this URL with your actual video file URL
        >
          Your browser does not support the video tag.
        </video> */}
        <iframe  className="w-full h-[300px]" src="https://www.youtube.com/embed/2NPHJgg5ROM?si=dtzhf3t9BXzyRGuQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>

      <div className="mt-8 text-center">
        <p className="mb-8 text-lg">To start using the chat application, please follow these steps:</p>
        <ul className="mb-8 text-left list-disc list-inside">
          <li>First, sign up to create a new account.</li>
          <li>Then, log in to access the chat.</li>
        </ul>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none"
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
