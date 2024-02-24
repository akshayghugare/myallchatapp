import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import moment from 'moment'
import LearnMoreModal from '../modals/LearnMoreModal';
import AddUserPage from './AddUserPage';
import addusericon from '../assets/new-user.png'
import Config from '../utils/config';

const socket = io(Config.URL);

const ChatPage = () => {

    const navigate = useNavigate();
    const loggedUserID = localStorage.getItem('user');
    const loginUser = JSON.parse(loggedUserID);
    const currentUserID = loginUser?.user?._id || "";

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adduserModal, setAddUserModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
        const fetchContacts = () => {
            fetch(`${Config.URL}/getAllUsers`)
                .then(response => response.json())
                .then(data => {
                    const filteredContacts = data.filter(contact => contact._id !== currentUserID);
                    setContacts(filteredContacts);
                })
                .catch(error => console.error('Error fetching contacts:', error));
        };

        fetchContacts();

        const messageListener = (newMessage) => {
            // Update to check duplicates before setting messages
            setMessages((prevMessages) => {
                const isDuplicate = prevMessages.some(
                    (msg) => msg._id === newMessage._id // Assuming each message has a unique _id
                );
                if (!isDuplicate) {
                    return [...prevMessages, newMessage];
                } else {
                    return prevMessages; // Return the current state if duplicate
                }
            });
        };

        socket.on('message', messageListener);

        // Cleanup the event listener when the component unmounts or selectedContact/currentUserID changes
        return () => socket.off('message', messageListener);
    }, [selectedContact, currentUserID, adduserModal]);


    const selectContact = (contact) => {
        setSelectedContact(contact);
        fetch(`${Config.URL}/getMessages/${currentUserID}/${contact._id}`)
            .then(response => response.json())
            .then(data => setMessages(data))
            .catch(error => console.error('Error fetching messages:', error));
    };

    const sendMessage = () => {
        if (message.trim() && selectedContact) {
            socket.emit('sendMessage', {
                message,
                to: selectedContact._id,
                sender: currentUserID
            });
            setMessage('');
        }
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.mobileNumber.includes(searchQuery)
    );


    return (
        <div className="md:flex h-screen">
            <aside className={`w-full md:w-[30%] h-full  flex flex-col justify-between  border  text-black overflow-auto  `}>
                <div>
                    <div className=" flex justify-between item-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2">

                        <div className='flex item-center gap-2'>
                            <div className='rounded-full '>
                                <img className='rounded-full w-10 h-10 ' src={loginUser?.user?.profilePic} />
                            </div>
                            <div>
                                <div className='font-semibold'>{loginUser?.user?.name}</div>
                                <div className='text-xs'>{loginUser?.user?.mobileNumber}</div>
                            </div>
                        </div>

                        <div className='relative group flex justify-center items-center'>
                            <img src={addusericon} className='w-10 cursor-pointer rounded-full text-center' onClick={() => setAddUserModal(true)} />
                            <div className=' whitespace-nowrap w-full text-xs  absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out -top-1'>
                                Add
                            </div>
                        </div>

                    </div>
                    <div>
                        <div className="p-2">
                            <input
                                type="text"
                                placeholder="Search by name or number..."
                                className="w-full p-2 border rounded"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className='h-[370px] overflow-auto scrollbar-thin'>
                            {filteredContacts.map((contact, index) => (
                                <div key={index} onClick={() => selectContact(contact)} className="p-2 hover:bg-gray-500 hover:text-white cursor-pointer">
                                    <div>
                                        <div className='flex item-center gap-2 border p-1 border-t-0 border-l-0  border-r-0 '>
                                            <div className='rounded-full '>
                                                <img className='rounded-full w-10 h-10 ' src={contact?.profilePic} />
                                            </div>
                                            <div>
                                                <div className='font-semibold'>{contact?.name}</div>
                                                <div className='text-xs'>{contact?.mobileNumber}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='mb-8 p-2'>
                    <div onClick={() => {
                        localStorage.clear('user')
                        navigate('/')
                        Swal.fire("Logout successful!")
                    }} className=' p-2 w-full text-center border hover:bg-white hover:text-black cursor-pointer '>logout</div>
                </div>
            </aside>


            {
                selectedContact ?
                    <div className='w-full p-4'>
                        <div className='flex md:hidden '>
                            <div className='cursor-pointer' onClick={() => setSelectedContact('')}>Back</div>
                        </div>
                        <div className='border shadow-md  p-2'>
                            <div className='flex item-center gap-2 '>
                                <div className='rounded-full '>
                                    <img className='rounded-full w-10 h-10 ' src={selectedContact?.profilePic} />
                                </div>
                                <div>
                                    <div className='font-semibold'>{selectedContact?.name}</div>
                                    <div className='text-xs'>{selectedContact?.mobileNumber}</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-1 w-full flex flex-col justify-between border" >
                            <div className='h-[435px] overflow-auto flex flex-col scrollbar-thin p-2'>
                                <div className=" bg-cover bg-no-repeat min-h-screen p-4">
                                    {/* Container for messages */}
                                    <div className="space-y-2">
                                        {messages?.length ? messages.map((msg, index) => (
                                            <div
                                                key={index}
                                                className={`flex flex-col ${msg?.sender === currentUserID ? 'items-end' : 'items-start'}`}
                                            >
                                                <div
                                                    className={`flex gap-1 item-center mb-2 max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 ${msg?.sender === currentUserID ? 'bg-green-200' : 'bg-white'} rounded-lg shadow-md`}
                                                >
                                                    {msg?.message}
                                                    <div className="text-xs flex justify-end text-gray-500 mt-2">
                                                        {moment(msg?.timestamp).format('HH:mm')}
                                                    </div>
                                                </div>
                                            </div>
                                        )) :
                                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        {/* Icon placeholder - replace with actual icon */}
                                                        <span className="text-2xl">⚠️</span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="font-bold">Messages are end-to-end encrypted</p>
                                                        <p className="text-sm">No one outside of this chat, not even WhatsApp, can read or listen to them. <a href="#learn-more" onClick={() => setIsModalOpen(true)} className="font-bold underline">Click to learn more</a></p>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>


                            </div>
                            <div className="shadow-lg w-full mb-6">
                                <div className="flex-grow flex items-center relative border rounded border-gray-300">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full p-2 pl-10 rounded-l focus:outline-none"
                                        placeholder="Write a message..."
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="absolute right-0 ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-l"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div> : null
            }

            {
                isModalOpen ? <LearnMoreModal isOpen={isModalOpen} close={() => setIsModalOpen(false)} /> : null
            }
            {
                adduserModal ? <AddUserPage isAddUserModalOpen={adduserModal} closeAddUserModal={() => setAddUserModal(false)} /> : null
            }
            {/* <div onClick={() => navigate('/adduser')} className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                +
            </div> */}
        </div>
    );
};

export default ChatPage;
