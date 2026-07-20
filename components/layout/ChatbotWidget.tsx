'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  { text: 'What is Yantriksha_X_Hub?', reply: 'Yantriksha_X_Hub is a Student-Driven Innovation and Cross-Disciplinary Collaboration Hub at Vel Tech. We bring together Engineering, Law, and Business students to collaborate, innovate, and solve real-world problems.' },
  { text: 'How to get ₹50k seed funding?', reply: 'Teams can request up to ₹50,000 for purchasing components, hardware parts, or developer services. You submit itemized bills and receipts under the "Funding" section in your user dashboard for advisor & treasurer verification.' },
  { text: 'What are the 14 journey steps?', reply: 'The incubation path has 14 bi-weekly milestone steps divided into Three Transformation Stages: Stage -1 (Confusion/Problem Discovery), Stage 0 (Idea validation & prototyping), and Stage 1 (Product finalization, IP patent filing, and business registration).' },
  { text: 'Who is in the core team?', reply: 'Our organizers include Dr. Vignesh Kumar (Faculty Coordinator), Vamsi Krishna (Engineering Lead), Aishwarya R. (Legal Operations), and Rahul Sharma (MBA Lead). You can view the full profiles on our "/team" page.' }
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am the Yantriksha Assistant Bot. Ask me anything about registration, milestones, the 14-stage journey, or seed funding!',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Listen for external open requests (e.g. from the Robot click)
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setUnreadCount(0);
    };
    window.addEventListener('open-yantriksha-chat', handleOpenChat);
    return () => window.removeEventListener('open-yantriksha-chat', handleOpenChat);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const processResponse = (userInput: string) => {
    setIsTyping(true);
    const input = userInput.toLowerCase();
    
    let reply = "I'm sorry, I didn't quite catch that. Try asking about 'funding', 'stages', 'core team', or 'registration'. You can also click on one of the quick questions above!";

    if (input.includes('funding') || input.includes('money') || input.includes('rupees') || input.includes('seed')) {
      reply = "Yantriksha_X_Hub offers up to ₹50,000 in seed funding for registered teams. Submit your itemized bills and invoices via your dashboard's Funding console for verification.";
    } else if (input.includes('stage') || input.includes('step') || input.includes('roadmap') || input.includes('journey')) {
      reply = "Our roadmap consists of 14 bi-weekly steps divided into three main phases: Stage -1 (Confusion), Stage 0 (Idea), and Stage 1 (Product). Teams submit reports at each step to progress.";
    } else if (input.includes('team') || input.includes('founder') || input.includes('coordinator') || input.includes('organizer')) {
      reply = "The core team comprises Dr. Vignesh Kumar, Vamsi Krishna, Aishwarya R., and Rahul Sharma. Check out our public '/team' page to learn more about them!";
    } else if (input.includes('register') || input.includes('signup') || input.includes('join') || input.includes('create')) {
      reply = "Click the 'Join Yantriksha Hub' button on the homepage, fill out your details, select your college, and submit. Once verified, you can log in, form a team, and begin your journey.";
    } else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      reply = "Hello there! How can I help you today with your Yantriksha startup journey?";
    } else if (input.includes('patent') || input.includes('ip') || input.includes('law') || input.includes('legal')) {
      reply = "Our Law students provide legal operations support, including patent prior-art searches, provisional claim filings, and company incorporation advice.";
    }

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: reply,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'user',
        text: userText,
        timestamp: new Date()
      }
    ]);
    setInputText('');
    
    // Process response after delay
    processResponse(userText);
  };

  const handleQuickQuestionClick = (text: string, reply: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'user',
        text: text,
        timestamp: new Date()
      }
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: reply,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div 
      className="flex flex-col items-end" 
      style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}
    >
      
      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="w-[360px] h-[500px] bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 backdrop-blur-xl animate-fadeIn">
          
          {/* Header */}
          <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 flex items-center justify-center">
                <Image src="/logo.png" fill className="object-contain" style={{ mixBlendMode: 'screen' }} alt="Bot" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Yantriksha Assistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">Online Support</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="text-gray-400 hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-850 border border-slate-800 transition"
            >
              ✕
            </button>
          </div>

          {/* Messages Log area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800 border border-slate-750 text-gray-200 rounded-tl-none'
                }`}>
                  <p>{m.text}</p>
                  <p className="text-[9px] text-gray-500 text-right mt-1.5 font-medium">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-750 text-gray-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Questions */}
          <div className="px-4 py-2 border-t border-slate-800/40 bg-slate-950/20">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Suggested Questions</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q.text}
                  onClick={() => handleQuickQuestionClick(q.text, q.reply)}
                  className="text-[10px] text-left bg-slate-850 hover:bg-slate-800 border border-slate-800/60 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg transition"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/40 border-t border-slate-800/80 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500/80"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
            >
              Send
            </button>
          </form>

        </div>
      )}

      {/* ── Floating Toggle Button ── */}
      <button
        onClick={handleToggle}
        className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 relative group border border-blue-500/30 overflow-hidden"
      >
        <span className="text-2xl z-10">💬</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Unread Alert badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute top-2 right-2 h-3.5 w-3.5 bg-red-500 border border-slate-950 rounded-full flex items-center justify-center text-[8px] font-bold">
            {unreadCount}
          </span>
        )}
      </button>

    </div>
  );
}
