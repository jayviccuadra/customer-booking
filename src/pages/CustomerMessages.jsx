import React, { useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { UserContext } from '../context/AuthContext';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

const CustomerMessages = () => {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);

  const customerId = user?.auth_id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch or Create Conversation
  useEffect(() => {
    const initializeConversation = async () => {
      if (!customerId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Check if conversation exists
        const { data: existingConv, error: fetchError } = await supabase
          .from('conversations')
          .select('id')
          .eq('customer_id', customerId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
           console.error('Error fetching conversation:', fetchError);
           setLoading(false);
           return;
        }

        if (existingConv) {
          setConversationId(existingConv.id);
        } else {
          // 2. Create new conversation if not exists
          const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert([{ customer_id: customerId }])
            .select()
            .single();

          if (createError) {
             console.error('Error creating conversation:', createError);
             setLoading(false);
             return;
          }
          setConversationId(newConv.id);
        }
      } catch (err) {
        console.error('Error initializing conversation:', err);
        setLoading(false);
      }
    };

    initializeConversation();
  }, [customerId]);

  // Fetch Messages and Subscribe to Realtime
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        // Optimistically update or re-fetch. 
        // Since we need sender details, re-fetching or manually patching is needed.
        // For simplicity, let's fetch the single new message with details
        fetchNewMessageDetails(payload.new.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversationId]);

  const fetchNewMessageDetails = async (messageId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (data && !error) {
      setMessages(prev => {
        // Prevent duplicates
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !customerId) return;

    setSending(true);
    try {
      const messageData = {
        conversation_id: conversationId,
        sender_id: customerId,
        content: newMessage.trim(),
        is_read: false
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!user) return <div className="p-4">Please log in to view messages.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white shadow-md">
        <h2 className="text-xl font-bold flex items-center">
          <span className="mr-2">💬</span> Customer Support
        </h2>
        <p className="text-blue-100 text-sm">Chat with our admin for inquiries.</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-blue-500 text-3xl" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-5xl mb-3">👋</div>
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === customerId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      {msg.sender?.fullname || 'Support'}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            disabled={sending || loading}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim() || loading}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center w-12"
          >
            {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerMessages;
