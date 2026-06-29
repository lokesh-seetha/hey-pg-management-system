import React, { useState, useEffect, useRef } from 'react';

export default function Chatbot({ todayMenu, ownerPhone }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Hello! I am the PG Support Bot. How can I help you today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Process Bot Response after a small typing delay
    setTimeout(() => {
      let reply = '';
      const cleanText = text.toLowerCase();

      if (cleanText.includes('wifi') || cleanText.includes('password') || cleanText.includes('net')) {
        reply = '🌐 **Hey-PG WiFi details:**\nNetwork Name: `Hey-PG_HighSpeed_5G`\nPassword: `wifi@heypg2026`';
      } else if (cleanText.includes('menu') || cleanText.includes('lunch') || cleanText.includes('breakfast') || cleanText.includes('dinner') || cleanText.includes('food')) {
        if (todayMenu) {
          reply = `🍲 **Today's Menu:**\n🍳 *Breakfast:* ${todayMenu.breakfast || 'Not set'}\n🍛 *Lunch:* ${todayMenu.lunch || 'Not set'}\n🥣 *Dinner:* ${todayMenu.dinner || 'Not set'}`;
        } else {
          reply = '🍲 Today\'s menu is not updated yet. Please check the food timetable page.';
        }
      } else if (cleanText.includes('owner') || cleanText.includes('contact') || cleanText.includes('phone') || cleanText.includes('warden')) {
        reply = `📞 **Owner / Warden Contact Details:**\nName: Mr. Karthik (Warden)\nPhone: \`${ownerPhone || '9876543210'}\`\nEmail: \`warden@heypg.com\``;
      } else if (cleanText.includes('emergency') || cleanText.includes('medical') || cleanText.includes('doctor') || cleanText.includes('ambulance')) {
        reply = '🚨 **Emergency Contact Details:**\nAmbulance: `102`\nOwner SOS Direct: `9876543210`\nCity General Hospital: `080-2234-5678`\n\n*Tip: You can also use the red SOS button at the top to trigger an instant alarm on the Owner\'s screen.*';
      } else if (cleanText.includes('rent') || cleanText.includes('payment') || cleanText.includes('fee') || cleanText.includes('due')) {
        reply = '💰 Rent plans are: Monthly, 6-Months, or Yearly. Dues are generated at the end of each billing cycle. You can pay via UPI, NetBanking, Card, or Cash directly to the Warden.';
      } else if (cleanText.includes('complaint') || cleanText.includes('grievance') || cleanText.includes('working') || cleanText.includes('broken')) {
        reply = '🔧 To file a complaint, go to the "Grievances" section. Choose a category (WiFi, Washing Machine, Electricity, Plumbing, etc.), write the description, and hit Submit. The warden will receive it immediately!';
      } else {
        reply = '🤖 I\'m a support assistant. Try asking about "wifi password", "today\'s food", "owner phone number", or "emergencies"!';
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-wrapper" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {/* Bot Chat Window */}
      {isOpen && (
        <div className="chatbot-window glass-panel" style={{
          width: '360px',
          height: '480px',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          marginBottom: '1rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Hey-PG Assistant</h4>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Online Support</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#fff' }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#0e1320' }}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  background: msg.sender === 'user' ? '#6366f1' : 'rgba(255,255,255,0.06)',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  whiteSpace: 'pre-line',
                  lineHeight: '1.4'
                }}>
                  {/* Basic markdown parsing for bold text */}
                  {msg.text.split('\n').map((line, lIdx) => {
                    let formatted = line;
                    // Simple bold format: **Text** -> <strong>Text</strong>
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    // Code highlight format: `text` -> <code>text</code>
                    const codeRegex = /`(.*?)`/g;
                    
                    return (
                      <div key={lIdx}>
                        {line.startsWith('🌐') || line.startsWith('🍲') || line.startsWith('📞') || line.startsWith('🚨') || line.startsWith('💰') || line.startsWith('🔧') ? (
                          <span dangerouslySetInnerHTML={{ 
                            __html: line
                              .replace(boldRegex, '<strong>$1</strong>')
                              .replace(codeRegex, '<code style="background: rgba(0,0,0,0.3); padding: 2px 4px; border-radius: 4px; color: #f43f5e;">$1</code>') 
                          }} />
                        ) : (
                          <span dangerouslySetInnerHTML={{ 
                            __html: line
                              .replace(boldRegex, '<strong>$1</strong>')
                              .replace(codeRegex, '<code style="background: rgba(0,0,0,0.3); padding: 2px 4px; border-radius: 4px; color: #f43f5e;">$1</code>') 
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.75rem',
            background: '#0e1320',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <button onClick={() => handleSendMessage('WiFi Password')} style={{ padding: '0.35rem 0.65rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s' }}>🌐 WiFi Password</button>
            <button onClick={() => handleSendMessage("Today's Food Menu")} style={{ padding: '0.35rem 0.65rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s' }}>🍲 Today's Menu</button>
            <button onClick={() => handleSendMessage('Warden Contact')} style={{ padding: '0.35rem 0.65rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s' }}>📞 Owner Phone</button>
            <button onClick={() => handleSendMessage('Medical Emergency Contact')} style={{ padding: '0.35rem 0.65rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s' }}>🚨 SOS Info</button>
          </div>

          {/* Input Area */}
          <div style={{
            display: 'flex',
            padding: '0.75rem',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid rgba(255,255,255,0.06)'
          }}>
            <input 
              type="text" 
              placeholder="Ask WiFi password, menu, owner..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <button 
              onClick={() => handleSendMessage()}
              style={{
                marginLeft: '0.5rem',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(99,102,241,0.3)',
                color: '#fff'
              }}
            >
              <i className="fa-solid fa-paper-plane" style={{ fontSize: '0.9rem' }}></i>
            </button>
          </div>
        </div>
      )}

      {/* Bot Launcher Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
          transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="bot-trigger"
      >
        {isOpen ? (
          <i className="fa-solid fa-chevron-down" style={{ fontSize: '1.4rem', color: '#fff' }}></i>
        ) : (
          <i className="fa-solid fa-comment-dots" style={{ fontSize: '1.6rem', color: '#fff' }}></i>
        )}
      </button>
    </div>
  );
}
