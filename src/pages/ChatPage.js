import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import moment from 'moment'
import LearnMoreModal from '../modals/LearnMoreModal';
import AddUserPage from './AddUserPage';
import addusericon from '../assets/new-user.png'
import defaultUserIcon from '../assets/defaultuser2.png'
import defaultLoginUserIcon from '../assets/defaultuser.png'
import Config from '../utils/config';
import Loader from '../assets/loader.svg';
import plusIcon from '../assets/plus.png';
import CreatedBy from './CreatedBy';
import UpdateProfilePicModal from '../modals/UpdateProfilePicModal';
import axios from 'axios';
// import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io(Config.URL);

const ChatPage = () => {
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const [isMobileContactsVisible, setIsMobileContactsVisible] = useState(true);
    const loggedUserID = localStorage.getItem('user');
    const loginUser = JSON.parse(loggedUserID);
    const currentUserID = loginUser?.user?._id || '';
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adduserModal, setAddUserModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [iconSpinning, setIconSpinning] = useState(false);
    const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState(false);
    const [myId, setMyId] = useState('');
    const [callToId, setCallToId] = useState('');
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState('');
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const userVideo = useRef(null);
    const partnerVideo = useRef(null);
    const [heightMessages, setHeightMessages] = useState(false);

    useEffect(() => {
       if(heightMessages){
        socket.current = io(Config.URL);
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((currentStream) => {
            setStream(currentStream);
            if (userVideo.current) {
              userVideo.current.srcObject = currentStream;
            }
          });
    
        socket.current.on('myId', (id) => {
          setMyId(id);
        });
    
        socket.current.on('callReceived', (data) => {
          setReceivingCall(true);
          setCaller(data.from);
          setCallerSignal(data.signal);
          Swal.fire(`Incoming call from ${data.from}`)
        //   alert(`Incoming call from ${data.from}`);
        });
    
        socket.current.on('message', (data) => {
          setMessages((prevMessages) => [...prevMessages, data]);
        });
    
        // Clean up on component unmount
        return () => {
          socket.current.disconnect();
        };
       }else{
        console.log("ddd something went wrong")
       }
      }, [receivingCall,heightMessages]);
    
    const callUser = () => {
        setHeightMessages(true);
        if(heightMessages){
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: stream,
              });
          
              peer.on('signal', (data) => {
                socket.current.emit('callUser', { userToCall: callToId, signalData: data, from: myId });
              });
          
              peer.on('stream', (partnerStream) => {
                if (partnerVideo.current) {
                  partnerVideo.current.srcObject = partnerStream;
                }
              });
          
              socket.current.on('callAccepted', (signal) => {
                setCallAccepted(true);
                peer.signal(signal);
              });
        }else{
            console.log("fsdsd something went wrong")
        }
    };
    
    const acceptCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream,
        });
    
        peer.on('signal', (data) => {
          socket.current.emit('acceptCall', { signal: data, to: caller });
        });
    
        peer.on('stream', (partnerStream) => {
          partnerVideo.current.srcObject = partnerStream;
        });
    
        peer.signal(callerSignal);
    };

    const cancelCall = () => {
        console.log("Cancel call");
        setReceivingCall(false);
        socket.current.emit('cancelCall', { signal: callerSignal ,to: caller });
    };

    const selectContact = (contact) => {
        setSelectedContact(contact);
        setIsMobileContactsVisible(false);
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

    const handleLogout = () => {
        setLoading(true);
        const payload = {
            name: loginUser?.user?.name,
            mobileNumber: loginUser?.user?.mobileNumber
        };
        fetch(`${Config.URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('User login:', data);
                localStorage.clear('user');
                setLoading(false);
                navigate('/');
                Swal.fire("Logout successful!");
            })
            .catch(error => console.error('Error adding user:', error));
    };

    const handleBackToContacts = () => {
        setIsMobileContactsVisible(true);
        setSelectedContact(null);
    };

    const toggleDropdown = () => {
        setIconSpinning(true);
        setTimeout(() => setIconSpinning(false), 1000);
        setDropdownOpen(!dropdownOpen);
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setMessage(`${type}: ${file.name}`);
            setDropdownOpen(false);
        }
    };

    const handleDeleteContact = async (contact) => {
        try {
            const response = await axios.post(`${Config.URL}/delete-user/${contact._id}`);
            console.log("delete", response);
            if (response) {
                await axios.get(`${Config.URL}/getAllUsers`);
                Swal.fire("User Delete successful!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const openProfilePicModal = () => {
        setIsProfilePicModalOpen(true);
    };

    const closeProfilePicModal = () => {
        setIsProfilePicModalOpen(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleVideoCall = (contact) => {
        console.log('Initiating video call with', contact);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (currentUserID && selectedContact) {
            socket.emit('joinChat', { userId: currentUserID, contactId: selectedContact._id });

            socket.on('message', (newMessage) => {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });
        }

        return () => {
            socket.off('message');
        };
    }, [message, messages]);

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
            setMessages((prevMessages) => {
                const isDuplicate = prevMessages.some(
                    (msg) => msg._id === newMessage._id
                );
                if (!isDuplicate) {
                    return [...prevMessages, newMessage];
                } else {
                    return prevMessages;
                }
            });
        };

        socket.on('message', messageListener);

        return () => socket.off('message', messageListener);
    }, [selectedContact, currentUserID, adduserModal]);

    return (
        <div className="md:flex h-screen">
            <aside className={`${isMobileContactsVisible ? 'block' : 'hidden'} md:block md:w-[40%] h-screen flex flex-col justify-between border text-black overflow-auto`}>
                <div>
                    <div className="flex justify-between item-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 bg-gradient-to-r from-blue-700 via-blue-300 to-blue-500 animate-gradient-xy">
                        <div className='flex item-center gap-2'>
                            <div onClick={() => { openProfilePicModal() }} className='rounded-full cursor-pointer'>
                                <img className='rounded-full w-10 h-10' src={loginUser?.user?.profilePic ? loginUser?.user?.profilePic : defaultLoginUserIcon} alt="Profile" />
                            </div>
                            <div>
                                <div className='font-semibold'>{loginUser?.user?.name}</div>
                                <div className='text-xs'>{loginUser?.user?.mobileNumber}</div>
                            </div>
                        </div>

                        <div className='relative group flex justify-center items-center'>
                            <img src={addusericon} alt="Add user" className='w-10 cursor-pointer rounded-full text-center' onClick={() => setAddUserModal(true)} />
                            <div className='whitespace-nowrap w-full text-xs absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out -top-1'>
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
                        <div className='overflow-auto scrollbar-thin' style={{ height: 'calc(100vh - 220px)' }}> {/* Adjusted for dynamic height */}
                            {filteredContacts.map((contact, index) => (
                                <div key={index}  className="p-2 border hover:bg-blue-50  border-t-0 border-l-0 border-r-0 ">
                                    <div className='flex items-center justify-between'>
                                    <div onClick={() => selectContact(contact)} className='flex items-center gap-2 relative cursor-pointer '>
                                        <div className='rounded-full'>
                                            <img className='rounded-full w-10 h-10' src={contact?.profilePic ? contact?.profilePic : defaultUserIcon} alt="Contact" />
                                            {/* Status indicator dot */}
                                            <span className={`absolute left-6 top-0 block h-3 w-3 rounded-full ${contact.isLogin ? 'bg-green-500' : 'bg-gray-400'}`} style={{ border: '2px solid white', transform: 'translate(50%, 50%)' }}></span>
                                        </div>
                                        <div>
                                            <div className='font-semibold capitalize'>{contact?.name}</div>
                                            <div className='text-xs'>{contact?.mobileNumber}</div>
                                        </div>
                                    </div>
                                    <div className='mr-2 text-red-500 cursor-pointer' onClick={()=>{ handleDeleteContact(contact)}}>
                                        Delete
                                    </div>
                                     </div>   
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className=' p-2 w-full'>
                    <div onClick={() => handleLogout()}
                        className="w-full cursor-pointer inline-flex justify-center py-3 px-4 border border shadow-lg text-sm font-medium rounded-md  disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <img src={Loader} alt="Loading" className="w-5 h-5 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Logout'
                        )}
                    </div>
                </div>
                <CreatedBy
                    mystyle={"p-2 text-sm font-semibold"}
                />
            </aside>



            {
                selectedContact ?
                    <div className={`${isMobileContactsVisible ? 'hidden' : 'block'} md:block w-full `}>
                        <div className='flex md:hidden '>
                            <div className='cursor-pointer mb-2' onClick={handleBackToContacts}>Back to contact list</div>
                        </div>
                        <div className={`border shadow-md p-2 bg-gradient-to-r from-blue-300 via-white to-blue-200 animate-gradient-xy ${heightMessages?"h-60px":"md:h-[70px]"}`}>
                            <div className='md:flex md:items-center md:justify-between '>
                                <div className='flex items-center gap-2 relative '>
                                <div className='rounded-full'>
                                    <img className='rounded-full w-10 h-10' src={selectedContact?.profilePic ? selectedContact?.profilePic : defaultUserIcon} alt={`loading`} />
                                    {/* Status indicator dot */}
                                    <span className={`absolute left-6 top-0 block h-3 w-3 rounded-full ${selectedContact.isLogin ? 'bg-green-500' : 'bg-gray-400'}`} style={{ border: '2px solid white', transform: 'translate(50%, 50%)' }}></span>
                                </div>
                                <div>
                                    <div className='font-semibold capitalize'>{selectedContact?.name}</div>
                                    <div className='text-xs'>{selectedContact?.mobileNumber}</div>
                                </div>
                                </div>
                                <div className={`sm:flex md:gap-5 ${receivingCall && !callAccepted || callAccepted?"hidden":"block"}`}>
                                {myId && <p>Your ID: {myId}</p>}
                                    <input
                                    className={`h-10 rounded-lg p-2 border border-black  ${heightMessages?"block":"hidden"}`}
                                        type="text"
                                        value={callToId}
                                        onChange={(e) => setCallToId(e.target.value)}
                                        placeholder="ID to call"
                                    />
                                    <button className='h-10 ml-2 sm:ml-0 rounded-lg py-2 px-8 border border-black' onClick={callUser}>Call</button>
                                </div>
                                
                            </div>
                            <div className='flex item-center gap-5 '>
                            <div className={`${heightMessages?"block":"hidden"}`}>
                                    
                                    {/* {stream ?
                                        <div>
                                            <div>My window</div>
                                            <video playsInline muted ref={userVideo} autoPlay style={{ width: "300px" }} />

                                        </div>
                                    :null} */}
                                    {callAccepted ?
                                    <div>
                                        <video playsInline ref={partnerVideo} autoPlay style={{ width: "300px" }} />
                                        <button className='h-10 ml-2 sm:ml-0 rounded-lg py-2 px-8 border border-black' onClick={cancelCall}>Cancel</button>
                                    </div>
                                    :""}
                                </div>
                                {receivingCall && !callAccepted && (
                                    <div>
                                        <h1>Incoming call...</h1>
                                        <button className='h-10 rounded-lg py-2 px-8 border border-black' onClick={acceptCall}>Accept</button>
                                    </div>
                                )}
                                </div>
                        </div>
                        <div className={`p-1 w-full flex flex-col justify-between border ${heightMessages?'h-[44vh]':'h-[87vh]'}`} >
                            <div className='flex-grow overflow-auto flex flex-col scrollbar-thin p-2' > {/* Adjusted for dynamic height */}
                                <div className=" bg-cover bg-no-repeat min-h-screen p-4">
                                    {/* Container for messages */}
                                    <div className="space-y-2">
                                        {messages?.length ? messages.map((msg, index) => (
                                            <div
                                                key={index}
                                                className={`flex flex-col ${msg?.sender === currentUserID ? 'items-end' : 'items-start'}`}
                                                ref={index === messages.length - 1 ? messagesEndRef : null} // Set the ref to the last message
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
                                <div className="flex items-center relative border rounded border-gray-300">
                                    <div className="flex items-center ml-8">
                                        <div className="cursor-pointer" onClick={toggleDropdown}>
                                            <img src={plusIcon} className={`rounded-full w-5 ${dropdownOpen ? "animate-spin" : ""} `} />
                                        </div>
                                        {dropdownOpen && (
                                            <div className="absolute bottom-full mb-2 left-0 bg-white shadow-md rounded border border-gray-300">
                                                <ul className="text-sm text-gray-700">
                                                    <li className="cursor-pointer p-2 hover:bg-gray-100" onClick={() => document.getElementById('image-upload').click()}>Image Upload</li>
                                                    <li className="cursor-pointer p-2 hover:bg-gray-100" onClick={() => document.getElementById('doc-upload').click()}>Doc Upload</li>
                                                </ul>
                                            </div>
                                        )}
                                        {/* Separate inputs for image and document uploads, hidden from view */}
                                        <input id="image-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'Image')} className="hidden" />
                                        <input id="doc-upload" type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => handleFileChange(e, 'Document')} className="hidden" />
                                    </div>
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full py-3 pl-5 pr-20 rounded-l focus:outline-none" // Adjust padding-right to reserve space for the button
                                        placeholder="Write a message..."
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()} // Optional: send message on Enter key press
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="absolute right-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-6 rounded-md"
                                        style={{ top: '50%', transform: 'translateY(-50%)' }} // Vertically center the button
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
            {isProfilePicModalOpen ? <UpdateProfilePicModal userId={currentUserID} onClose={closeProfilePicModal} /> : null}

            {/* <div onClick={() => navigate('/adduser')} className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                +
            </div> */}
        </div>
    );
};

export default ChatPage;
