'use client';
import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Headset } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { FAQ_ITEMS, getAutoReply } from '../lib/faqData';

let socket;

export default function LiveChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [mode, setMode] = useState('bot'); // 'bot' | 'human'
  const [room] = useState(() => {
    if (typeof window === 'undefined') return 'guest';
    let r = localStorage.getItem('chat_room');
    if (!r) {
      r = 'room-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('chat_room', r);
    }
    return r;
  });
  const endRef = useRef(null);

  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    socket.emit('chat:join', room);
    socket.on('chat:message', (msg) => {
      if (msg.room === room) setMessages((prev) => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, [room]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const pushMessage = (msg) => {
    const full = { room, ...msg };
    socket.emit('chat:message', full);
  };

  const maybeAutoReply = (customerText) => {
    if (mode === 'human') return; // a human has taken over - stay quiet
    if (/\b(agent|human|representative|real person)\b/i.test(customerText)) {
      setMode('human');
      setTimeout(() => pushMessage({ from: 'bot', name: 'coop shop bot', text: "Connecting you with our support team — they'll reply here as soon as they're available. 🙋" }), 400);
      return;
    }
    const reply = getAutoReply(customerText);
    setTimeout(() => pushMessage({ from: 'bot', name: 'coop shop bot', text: reply }), 500);
  };

  const sendMessage = (overrideText) => {
    const value = (overrideText ?? text).trim();
    if (!value) return;
    pushMessage({ from: 'customer', name: user?.name || 'Guest', text: value });
    setText('');
    maybeAutoReply(value);
  };

  const handleQuickReply = (item) => {
    sendMessage(item.q);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-80 h-[26rem] card flex flex-col overflow-hidden mb-3 shadow-2xl">
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Live Support</p>
              <p className="text-[11px] text-white/70 flex items-center gap-1">
                {mode === 'human' ? <><Headset size={11} /> Waiting for an agent</> : 'coop shop assistant'}
              </p>
            </div>
            <button onClick={() => setOpen(false)}><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-blush/40 dark:bg-gray-950">
            {messages.length === 0 && (
              <>
                <p className="text-xs text-gray-500 text-center mt-4 mb-3">
                  👋 Hi! Ask us anything, or pick a quick question below.
                </p>
                <div className="flex flex-col gap-1.5">
                  {FAQ_ITEMS.slice(0, 4).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(item)}
                      className="text-left text-xs px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary"
                    >
                      {item.q}
                    </button>
                  ))}
                </div>
              </>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[80%] text-sm px-3 py-2 rounded-2xl ${
                m.from === 'customer'
                  ? 'ml-auto bg-primary text-white rounded-br-sm'
                  : m.from === 'admin'
                  ? 'bg-secondary/30 dark:bg-secondary/20 rounded-bl-sm'
                  : 'bg-white dark:bg-gray-800 rounded-bl-sm'
              }`}>
                {m.from !== 'customer' && <p className="text-[10px] font-medium text-gray-500 mb-0.5">{m.name}</p>}
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="p-2 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-blush dark:bg-gray-800 focus:outline-none"
            />
            <button onClick={() => sendMessage()} className="p-2 rounded-lg bg-primary text-white">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:bg-primary-dark transition-colors"
        aria-label="Live chat"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
