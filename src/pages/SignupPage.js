import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import Config from '../utils/config';
function SignupPage() {
  // State for form fields
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: ''
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Correctly format the body as JSON and set Content-Type header
    fetch(`${Config.URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Indicate that the request body format is JSON
      },
      body: JSON.stringify(formData), // Properly stringify the formData object
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => { // Store the returned data instead of formData
      Swal.fire("Signup successful!")
      navigate('/')
    })
    .catch(error => console.error('Error adding user:', error));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 animate-fadeIn ">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Create account</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="name">Name</label>
              <input type="text" placeholder="Name" name="name"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="name" value={formData.name} onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="mobileNumber">Mobile Number</label>
              <input type="text" placeholder="Mobile Number" name="mobileNumber"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="mobileNumber" value={formData.mobileNumber} onChange={handleChange}
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button type="submit" className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Signup</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;