import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Config from '../utils/config';
import Loader from '../assets/loader.svg'; // Make sure you have this loader SVG for the animation

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Reset errors for a specific field when it changes
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required.';
    }
    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = 'Mobile number must be 10 digits.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    fetch(`${Config.URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem('user', JSON.stringify(data));
        Swal.fire('Login successful!');
        navigate('/chat');
      })
      .catch((error) => {
        console.error('Error during login:', error);
        Swal.fire('Error', 'Failed to login. Please try again.', 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md px-8 py-6 bg-white shadow-lg rounded-lg animate-scaleIn">
        <h3 className="text-2xl font-bold text-center">Login</h3>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {formErrors.name && <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="text"
              name="mobileNumber"
              id="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {formErrors.mobileNumber && <p className="mt-2 text-sm text-red-600">{formErrors.mobileNumber}</p>}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <img src={Loader} alt="Loading" className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Login'
              )}
            </button>
            <a
              onClick={() => navigate('/signup')}
              className="cursor-pointer text-sm text-blue-600 hover:text-blue-500"
            >
              Register
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;


