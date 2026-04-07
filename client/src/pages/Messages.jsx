import React, { useEffect, useState, useRef } from "react";
import { getMessages, markMessagesAsRead, getFriends, sendMessage } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Messages.css";

const QUICK_REPLIES = {
  book_recommendation: [
    "Thanks for the recommendation!",
    "I'll check it out!",
    "Already read it!",
    "Not really my genre, but thanks!",
  ],
};

function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedSender, setSelectedSender] = useState(null);
  const [nameMap, setNameMap] = useState({});
  const [repliedMessages, setRepliedMessages] = useState(() => {
    const stored = localStorage.getItem("repliedMessages");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    const init = async () => {
      if (!email) return;
      try {
        const [msgRes, friendsRes] = await Promise.all([
          getMessages(email),
          getFriends(email),
        ]);
        setMessages(msgRes.data.messages);
  
        const map = {};
        (friendsRes.data.friends || friendsRes.data || []).forEach((f) => {
          const friendEmail = f.email || f.friendEmail;
          const friendName = f.name || f.friendName || friendEmail;
          if (friendEmail) map[friendEmail] = friendName;
        });
        setNameMap(map);
      } catch (err) { console.error(err); }
    };
    init();
  }, [email]);

  useEffect(() => {
    if (selectedSender) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant", block: "nearest" });
    }
  }, [selectedSender, messages]);

  const grouped = messages.reduce((acc, msg) => {
    const otherPerson = msg.sender === email ? msg.receiver : msg.sender;
    if (!acc[otherPerson]) acc[otherPerson] = [];
    acc[otherPerson].push(msg);
    return acc;
  }, {});
  
  const senders = Object.keys(grouped).sort((a, b) => {
    const aLatest = new Date(grouped[a][0].sentAt);
    const bLatest = new Date(grouped[b][0].sentAt);
    return bLatest - aLatest;
  });

  const handleSelectSender = async (sender) => {
    setSelectedSender(sender);
    try {
      await markMessagesAsRead(email, sender);
  
      const updatedMessages = messages.map((msg) =>
        msg.sender === sender ? { ...msg, unread: "read" } : msg
      );
      setMessages(updatedMessages);
  
      const newCount = new Set(
        updatedMessages
          .filter((m) => m.unread === "unread" && m.receiver === email)
          .map((m) => m.sender)
      ).size;
      window.dispatchEvent(new CustomEvent("messagesRead", { detail: { newCount } }));
    } catch (err) {
      console.error(err);
    }
  };

  const selectedMessages = selectedSender ? grouped[selectedSender] : [];
  const displayName = (senderEmail) => nameMap[senderEmail] || senderEmail;
  const chronological = [...selectedMessages].reverse();

  const getMessageType = (msg) => {
    return msg.type || (msg.volumeId ? "book_recommendation" : null);
  };

  const handleQuickReply = async (receiver, text, msgId) => {
    try {
      await sendMessage({
        senderEmail: email,
        receiverEmail: receiver,
        messageText: text,
        type: "text",
      });
      const newMsg = {
        sender: email,
        receiver,
        messageText: text,
        type: "text",
        volumeId: null,
        unread: "read",
        sentAt: new Date().toISOString(),
      };
      setMessages((prev) => [newMsg, ...prev]);
      setRepliedMessages((prev) => {
        const updated = new Set([...prev, msgId]);
        localStorage.setItem("repliedMessages", JSON.stringify([...updated]));
        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`dm-container ${selectedSender ? "chat-open" : ""}`}>
      {/* Sidebar */}
      <div className="dm-sidebar">
        <h2 className="dm-sidebar-title">Messages</h2>
        {senders.length === 0 ? (
          <p className="dm-empty">No messages yet.</p>
        ) : (
          senders.map((sender) => {
            const senderMsgs = grouped[sender];
            const hasUnread = senderMsgs.some((m) => m.unread === "unread" && m.receiver === email);
            const latest = senderMsgs[0];
            const name = displayName(sender);
            const initial = name.charAt(0).toUpperCase();

            return (
              <div
                key={sender}
                className={`dm-sender-row ${selectedSender === sender ? "active" : ""}`}
                onClick={() => handleSelectSender(sender)}
              >
                <div className={`dm-avatar ${hasUnread ? "avatar-unread" : ""}`}>
                  {initial}
                </div>
                <div className="dm-sender-info">
                  <span className={`dm-sender-name ${hasUnread ? "unread-text" : ""}`}>
                    {name}
                  </span>
                  <span className="dm-preview">
                    {latest.sender === email ? `You: ${latest.messageText}` : latest.messageText}
                  </span>
                </div>
                {hasUnread && <span className="dm-unread-dot" />}
              </div>
            );
          })
        )}
      </div>

      {/* Chat panel */}
      <div className="dm-chat-panel">
        {!selectedSender ? (
          <div className="dm-placeholder">
            <p>Select a conversation</p>
          </div>
        ) : (
          <>
            <div className="dm-chat-header">
              <button className="dm-back-btn" onClick={() => setSelectedSender(null)}>←</button>
              <div className="dm-avatar sm">{displayName(selectedSender).charAt(0).toUpperCase()}</div>
              <span>{displayName(selectedSender)}</span>
            </div>
            <div className="dm-chat-messages">
              {chronological.map((msg, idx) => {
                const isSent = msg.sender === email;
                const bookData = msg.volumeId ? {
                  thumb: msg.coverUrl || null,
                  title: msg.title || null,
                  author: msg.author || null,
                } : null;
                const type = getMessageType(msg);
                const replies = !isSent && type ? QUICK_REPLIES[type] : null;

                return (
                  <div key={idx} className={`dm-bubble-wrapper ${isSent ? "sent" : ""}`}>
                    <div
                      className={`dm-bubble ${isSent ? "dm-bubble-sent" : ""}`}
                      style={{ cursor: "default" }}
                    >
                      <p className="dm-bubble-intro">{msg.messageText}</p>
                      {bookData && (
                        <div
                          className="dm-book-card"
                          onClick={() => navigate(`/book/${msg.volumeId}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {bookData.thumb && (
                            <img src={bookData.thumb} alt="Book cover" className="dm-book-thumb" />
                          )}
                          <div className="dm-book-info">
                            {bookData.title && <span className="dm-book-title">{bookData.title}</span>}
                            {bookData.author && <span className="dm-book-author">Author: {bookData.author}</span>}
                          </div>
                        </div>
                      )}
                      <small>{new Date(msg.sentAt).toLocaleString()}</small>
                      {replies && !repliedMessages.has(msg._id) && (
                        <div>
                          <hr className="dm-bubble-divider" />
                          <p className="dm-reply-label">Reply:</p>
                          <div className="dm-quick-replies">
                            {replies.map((text) => (
                              <button
                                key={text}
                                className="dm-quick-reply-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickReply(msg.sender, text, msg._id);
                                }}
                              >
                                {text}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Messages;