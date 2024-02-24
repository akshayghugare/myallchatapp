import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Config from '../utils/config';
const AddUserPage = ({isAddUserModalOpen, closeAddUserModal }) => {
  const [newUser, setNewUser] = useState({
    name: '',
    mobileNumber: '',
    profilePic: null,
  });
  console.log("/",newUser)
  const addUser = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('name', newUser.name);
    formData.append('mobileNumber', newUser.mobileNumber);
    formData.append('profilePic', newUser.profilePic);

    fetch(`${Config.URL}/addUser`, {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      console.log('User added:', data);
      Swal.fire("Contact added")
      closeAddUserModal()
    })
    .catch(error => console.error('Error adding user:', error));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleFileChange = (event) => {
    setNewUser({ ...newUser, profilePic: event.target.files[0] });
  };

  if (!isAddUserModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-bold">Add User</h4>
          <button onClick={closeAddUserModal}>&times;</button>
        </div>
        <form onSubmit={addUser} className="space-y-4">
          {/* Form fields remain the same */}
          <div>
            <label htmlFor="name" className="block">Name:</label>
            <input id="name" type="text" name="name" value={newUser.name} onChange={handleInputChange} className="border p-1" required />
          </div>
          <div>
            <label htmlFor="mobileNumber" className="block">Mobile Number:</label>
            <input id="mobileNumber" type="text" name="mobileNumber" value={newUser.mobileNumber} onChange={handleInputChange} className="border p-1" required />
          </div>
          <div>
            <label htmlFor="profilePic" className="block">Profile Pic:</label>
            <input id="profilePic" type="file" name="profilePic" onChange={handleFileChange} className="border p-1" />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserPage;
