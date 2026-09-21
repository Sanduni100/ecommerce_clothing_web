'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Send, MessageCircle } from 'lucide-react';

let socket;

export default function AdminChatPage() {
  const [conversations, setConversations] = useState({}); // room -> { lastText, name, unread }
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState({}); // room -> [messages]
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    socket.emit('admin:join');

    socket.on('chat:new-customer-message', (msg) => {
      setConversations((prev) => ({
        ...prev,
        [msg.room]: { lastText: msg.text, name: msg.name || 'Guest', unread: (prev[msg.room]?.unread || 0) + 1 },
      }));
    });

    socket.on('chat:message', (msg) => {
      setMessages((prev) => ({ ...prev, [msg.room]: [...(prev[msg.room] || []), msg] }));
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom]);

  const openConversation = (room) => {
    setActiveRoom(room);
    socket.emit('chat:join', room);
    setConversations((prev) => ({ ...prev, [room]: { ...prev[room], unread: 0 } }));
  };

  const sendReply = () => {
    if (!text.trim() || !activeRoom) return;
    socket.emit('chat:message', { room: activeRoom, from: 'admin', name: 'Support', text: text.trim() });
    setText('');
  };

  const rooms = Object.keys(conversations);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Live Chat Inbox</h1>
      <div className="card grid grid-cols-1 sm:grid-cols-3 h-[32rem] overflow-hidden">
        <div className="border-r border-gray-100 dark:border-gray-800 overflow-y-auto">
          {rooms.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No conversations yet — this list fills up as customers message live via the chat widget.</p>
          ) : (
            rooms.map((room) => (
              <button
                key={room}
                onClick={() => openConversation(room)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-900 hover:bg-blush dark:hover:bg-gray-900 ${activeRoom === room ? 'bg-blush dark:bg-gray-900' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{conversations[room].name}</p>
                  {conversations[room].unread > 0 && (
                    <span className="bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{conversations[room].unread}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{conversations[room].lastText}</p>
              </button>
            ))
          )}
        </div>

        <div className="sm:col-span-2 flex flex-col">
          {!activeRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageCircle size={32} />
              <p className="text-sm mt-2">Select a conversation to reply</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {(messages[activeRoom] || []).map((m, i) => (
                  <div key={i} className={`max-w-[70%] text-sm px-3 py-2 rounded-2xl ${
                    m.from === 'admin' ? 'ml-auto bg-primary text-white' : 'bg-blush dark:bg-gray-800'
                  }`}>
                    <p className="text-[10px] font-medium opacity-70 mb-0.5">{m.name}</p>
                    {m.text}
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                  placeholder="Reply as support..."
                  className="input flex-1"
                />
                <button onClick={sendReply} className="btn-primary px-4"><Send size={16} /></button>
              </div>
            </>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Note: chat history is relayed live via Socket.io and isn't persisted to the database yet — conversations only appear here while this page stays open.
      </p>
    </div>
  );
}
