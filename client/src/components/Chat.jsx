import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io(window.location.origin.includes('5173') ? `http://${window.location.hostname}:3000` : '/');

export default function Chat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  const [contacts, setContacts] = useState([]);
  const [activeContactId, setActiveContactId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(d => {
        const others = (d.users || []).filter(u => String(u.id) !== String(currentUser.id));
        setContacts(others);
        if (others.length > 0) setActiveContactId(others[0].id);
      });
  }, [currentUser.id]);

  useEffect(() => {
    if (!activeContactId) return;

    socket.emit('join', String(currentUser.id));

    fetch(`/api/messages/${currentUser.id}/${activeContactId}`)
      .then(r => r.json())
      .then(d => {
        if (d.messages) setMessages(d.messages);
      });

    const handleReceiveMessage = (msg) => {
      if (
        (String(msg.senderId) === String(currentUser.id) && String(msg.receiverId) === String(activeContactId)) ||
        (String(msg.senderId) === String(activeContactId) && String(msg.receiverId) === String(currentUser.id))
      ) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, [currentUser.id, activeContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeContactId) return;

    socket.emit('send_message', {
      senderId: currentUser.id,
      receiverId: activeContactId,
      content: messageText
    });

    setMessageText('');
  };

  const activeContact = contacts.find(c => c.id === activeContactId);

  return (
    <div style={{ display: 'flex', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', height: 500, overflow: 'hidden' }}>
      {/* Sidebar contact list */}
      <div style={{ width: 220, borderRight: '1px solid var(--gray-200)', background: 'var(--gray-50)', overflowY: 'auto' }}>
        <div style={{ padding: 16, fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-200)' }}>
          CONVERSATIONS
        </div>
        {contacts.map(c => {
          const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const isActive = c.id === activeContactId;
          return (
            <div key={c.id} onClick={() => setActiveContactId(c.id)} style={{ padding: '12px 16px', background: isActive ? '#fff' : 'transparent', borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{isActive ? 'Active 🟢' : 'Offline'}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {/* Chat Header */}
        <div style={{ padding: 16, borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{activeContact ? activeContact.name : 'Select a user'}</div>
        </div>

        {/* Messages List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--gray-400)', marginTop: 'auto', marginBottom: 'auto' }}>
              Say hello! History is saved.
            </div>
          )}

          {messages.map((m, i) => {
            const isMe = m.senderId === currentUser.id;
            return (
              <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                <div style={{
                  background: isMe ? 'var(--primary)' : 'var(--gray-100)',
                  color: isMe ? '#fff' : '#000',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  borderBottomRightRadius: isMe ? '4px' : '16px',
                  borderBottomLeftRadius: !isMe ? '4px' : '16px',
                  lineHeight: 1.4,
                  fontSize: 15
                }}>
                  {m.content}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: 16, borderTop: '1px solid var(--gray-200)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Type your message..."
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              style={{ flex: 1, padding: '10px 16px', borderRadius: 999, border: '1px solid var(--gray-200)', outline: 'none' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: 999, padding: '10px 20px' }}
              disabled={!messageText.trim()}
            >
              Send 🚀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
