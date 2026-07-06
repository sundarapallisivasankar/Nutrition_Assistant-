import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { MessageSquare, Send, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../layouts/AppLayout';

const AiAssistant = () => {
  const { showNotification } = useNotification();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your AI Nutrition Assistant. 🍎

I can help you build meal plans, calculate physical goals, suggest healthy recipe swaps, or provide general wellness guidance. 

What are you looking to achieve today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const autoScroll = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    autoScroll();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Map state history to server expected format (role: user/assistant, content: string)
      const apiHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await api.post('/ai/chat', {
        message: text,
        history: apiHistory,
      });

      if (response.data.success) {
        const assistantMsg = {
          id: Date.now() + 1 + '',
          role: 'assistant',
          content: response.data.reply,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (error) {
      console.error(error);
      showNotification('AI failed to reply. Please check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (prompt) => {
    handleSendMessage(prompt);
  };

  const templates = [
    'Recommend a healthy weight loss recipe',
    'How do I calculate TDEE?',
    'Healthy protein alternatives to chicken',
    'Explain the ketogenic diet'
  ];

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-slate-205/30 pb-3">
          <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">AI Nutrition Assistant</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Instant meal design and calorie advice powered by NutriAssist AI.
            </p>
          </div>
        </div>

        {/* Chat view container */}
        <div className="flex-1 glass-panel rounded-3xl p-6 bg-white/50 dark:bg-slate-900/40 flex flex-col justify-between overflow-hidden relative">
          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none shadow-md'
                      : 'glass-panel bg-white/90 dark:bg-slate-950/60 text-slate-800 dark:text-slate-250 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="glass-panel bg-white/90 dark:bg-slate-950/60 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  AI is crafting a reply...
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick template prompt bubbles */}
          {messages.length === 1 && !loading && (
            <div className="mb-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Queries</span>
              <div className="flex flex-wrap gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl}
                    onClick={() => handleTemplateClick(tpl)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-650 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    {tpl} <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input text form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2 pt-3 border-t border-slate-205/30"
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. recommend a vegan diet, BMR equations)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </AppLayout>
  );
};

export default AiAssistant;
