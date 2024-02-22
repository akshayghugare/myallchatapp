const LearnMoreModal = ({ isOpen, close }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
          <div className="text-lg font-semibold mb-4">Your chats and calls are private</div>
          <p className="mb-4">End-to-end encryption keeps your personal messages and calls between you and the people you choose. Not even WhatsApp can read or listen to them. This includes your:</p>
          {/* List items */}
          <ul className="list-none space-y-2 mb-6">
            <li>Text and voice messages</li>  
            <li>Audio and video calls</li>  
            <li>Photos, video and documents</li>  
          </ul>
          <div className="flex justify-between">
            <button onClick={close} className="bg-gray-200 hover:bg-gray-300 rounded text-black px-4 py-2">OK</button>
            <button onClick={close} className="bg-blue-600 hover:bg-blue-700 rounded text-white px-4 py-2">Learn More</button>
          </div>
        </div>
      </div>
    );
  };

  export default LearnMoreModal
  