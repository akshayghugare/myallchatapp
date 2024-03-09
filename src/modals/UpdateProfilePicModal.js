import React, { useState } from 'react';
import axios from 'axios';
import config from '../utils/config';

const UpdateProfilePicModal = ({ userId, onClose }) => {
    console.log("userId:::",userId)
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.name === "profilePic") {
        setSelectedFile(e.target.files[0]);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(e.target.files[0]);
    } else {
        console.log("wwww")
    }
};

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('profilePic', selectedFile);

      const response = await axios.post(`${config.URL}/updateProfilePic/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    console.log("ddd",response)
      if (response.data.user) {
        setSuccessMessage(response.data.message);
        onClose();
      }
    } catch (error) {
      setError('Error updating profile picture');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Update Profile Picture</h2>
        <div className='w-full px-3'>
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="profilePic">
            Profile Picture
        </label>
        {imagePreview && (
            <img src={imagePreview} alt="Profile Preview" className="w-[200px] h-[200px] rounded-full mx-auto object-cover" />
        )}
        <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="profilePic" type="file" name="profilePic" onChange={handleFileChange} />
        
    </div>
        {error && <p className="text-red-500">{error}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={handleSubmit}>Update</button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePicModal;
