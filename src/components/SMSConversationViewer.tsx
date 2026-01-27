import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ArrowLeft, Filter, Search } from 'lucide-react';
import './SMSConversationViewer.css';

interface SMSMessage {
  id: string;
  customer_id: string;
  business_id: string;
  direction: 'inbound' | 'outbound';
  message_text: string;
  created_at: string;
  gpt_context?: {
    context?: {
      type?: string;
      mode?: string;
    };
    analysis?: {
      sentiment?: string;
      booking_intent?: boolean;
    };
  };
}

interface Customer {
  id: string;
  name: string;
  phone_number: string;
  sms_consent: boolean;
  last_visit?: string;
  last_message?: string;
  last_message_time?: string;
}

interface SMSConversationViewerProps {
  businessId: string;
}

const SMSConversationViewer: React.FC<SMSConversationViewerProps> = ({ businessId }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConsent, setFilterConsent] = useState<'all' | 'active' | 'opted_out'>('all');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [businessId, filterConsent]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchMessages(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      console.log('🔍 Fetching SMS conversations for business:', businessId);
      console.log('🔑 Token exists:', !!token);
      
      const url = `${process.env.REACT_APP_API_URL}/sms/conversations?business_id=${businessId}&limit=200`;
      console.log('📡 API URL:', url);
      
      // First get all SMS conversations for this business
      const conversationsResponse = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📥 Response status:', conversationsResponse.status);

      if (conversationsResponse.ok) {
        const conversations = await conversationsResponse.json();
        console.log('✅ Conversations received:', conversations.length);
        console.log('📋 First conversation:', conversations[0]);
        
        // Extract unique customers from conversations
        const customerMap = new Map();
        conversations.forEach((conv: any) => {
          if (conv.customers && !customerMap.has(conv.customer_id)) {
            customerMap.set(conv.customer_id, {
              id: conv.customer_id,
              name: conv.customers.name,
              phone_number: conv.customers.phone_number,
              sms_consent: true, // They have SMS history
              last_message: conv.message_text,
              last_message_time: conv.created_at
            });
          }
        });
        
        const uniqueCustomers = Array.from(customerMap.values());
        console.log('👥 Unique customers:', uniqueCustomers.length);
        setCustomers(uniqueCustomers);
      } else {
        const errorText = await conversationsResponse.text();
        console.error('❌ Failed to fetch conversations:', conversationsResponse.status, errorText);
      }
    } catch (error) {
      console.error('💥 Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (customerId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/sms/conversations/${customerId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Failed to fetch messages:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendManualSMS = async () => {
    if (!replyText.trim() || !selectedCustomer) return;
    
    setSending(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/sms/send-manual`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer_id: selectedCustomer.id,
            business_id: businessId,
            message: replyText
          })
        }
      );

      if (response.ok) {
        // Clear input
        setReplyText('');
        // Refresh messages
        await fetchMessages(selectedCustomer.id);
        console.log('✅ SMS sent successfully');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to send SMS:', response.status, errorText);
        alert('Failed to send SMS: ' + errorText);
      }
    } catch (error) {
      console.error('💥 Error sending SMS:', error);
      alert('Error sending SMS: ' + error);
    } finally {
      setSending(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone_number.includes(searchTerm)
  );

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'GREEN': return '#10b981';
      case 'YELLOW': return '#f59e0b';
      case 'RED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just nu';
    if (diffMins < 60) return `${diffMins} min sedan`;
    if (diffHours < 24) return `${diffHours} tim sedan`;
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    
    return date.toLocaleDateString('sv-SE', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="sms-viewer-loading">
        <div className="spinner-large"></div>
        <p>Laddar konversationer...</p>
      </div>
    );
  }

  return (
    <div className="sms-conversation-viewer">
      {/* Customer List */}
      <div className="customer-list">
        <div className="customer-list-header">
          <h2>
            <MessageSquare size={20} />
            SMS Konversationer
          </h2>
          
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Sök kund..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button
              className={filterConsent === 'all' ? 'active' : ''}
              onClick={() => setFilterConsent('all')}
            >
              Alla
            </button>
            <button
              className={filterConsent === 'active' ? 'active' : ''}
              onClick={() => setFilterConsent('active')}
            >
              Aktiva
            </button>
            <button
              className={filterConsent === 'opted_out' ? 'active' : ''}
              onClick={() => setFilterConsent('opted_out')}
            >
              Avanmälda
            </button>
          </div>
        </div>

        <div className="customer-list-items">
          {filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={48} />
              <p>Inga konversationer hittades</p>
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <div
                key={customer.id}
                className={`customer-item ${selectedCustomer?.id === customer.id ? 'selected' : ''}`}
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="customer-info">
                  <div className="customer-name">{customer.name}</div>
                  <div className="customer-phone">{customer.phone_number}</div>
                  {customer.last_message && (
                    <div className="last-message-preview">
                      {customer.last_message.substring(0, 50)}
                      {customer.last_message.length > 50 ? '...' : ''}
                    </div>
                  )}
                </div>
                <div className="customer-status">
                  {!customer.sms_consent && (
                    <span className="opted-out-badge">Avanmäld</span>
                  )}
                  {customer.last_message_time && (
                    <span className="last-visit">
                      {formatDate(customer.last_message_time)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Conversation View */}
      <div className="conversation-view">
        {selectedCustomer ? (
          <>
            <div className="conversation-header">
              <button
                className="back-button"
                onClick={() => setSelectedCustomer(null)}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="conversation-header-info">
                <h3>{selectedCustomer.name}</h3>
                <p>{selectedCustomer.phone_number}</p>
              </div>
              {!selectedCustomer.sms_consent && (
                <span className="opted-out-badge large">
                  🚫 Avanmäld från SMS
                </span>
              )}
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <MessageSquare size={48} />
                  <p>Inga meddelanden ännu</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.direction}`}
                  >
                    <div className="message-bubble">
                      <div className="message-text">{message.message_text}</div>
                      <div className="message-meta">
                        <span className="message-time">
                          {formatDate(message.created_at)}
                        </span>
                        {message.direction === 'outbound' && (
                          <Send size={12} />
                        )}
                      </div>
                    </div>
                    
                    {/* GPT Context Info */}
                    {message.gpt_context && (
                      <div className="message-context">
                        {message.gpt_context.context?.type && (
                          <span className="context-badge">
                            {message.gpt_context.context.type}
                          </span>
                        )}
                        {message.gpt_context.analysis?.sentiment && (
                          <span
                            className="sentiment-badge"
                            style={{
                              backgroundColor: getSentimentColor(message.gpt_context.analysis.sentiment)
                            }}
                          >
                            {message.gpt_context.analysis.sentiment}
                          </span>
                        )}
                        {message.gpt_context.analysis?.booking_intent && (
                          <span className="intent-badge">
                            📅 Bokningsintresse
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Manual Reply Input */}
            {selectedCustomer.sms_consent && (
              <div className="reply-input-container">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Skriv ditt meddelande här..."
                  className="reply-textarea"
                  rows={3}
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      sendManualSMS();
                    }
                  }}
                />
                <div className="reply-actions">
                  <span className="char-count">
                    {replyText.length} / 160 tecken
                  </span>
                  <button
                    onClick={sendManualSMS}
                    disabled={!replyText.trim() || sending}
                    className="send-button"
                  >
                    {sending ? (
                      <span>Skickar...</span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Skicka SMS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {!selectedCustomer.sms_consent && (
              <div className="reply-disabled">
                <p>🚫 Kunden har avanmält sig från SMS</p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <MessageSquare size={64} />
            <h3>Välj en konversation</h3>
            <p>Välj en kund från listan för att se SMS-historiken</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSConversationViewer;
