import React, { useEffect, useState } from "react";
import { getMessages, markMessagesAsRead } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Messages.css";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedSender, setSelectedSender] = useState(null);
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getMessages(email);
        setMessages(res.data.messages);
      } catch (err) {
        console.error(err);
      }
    };
    if (email) fetchMessages();
  }, [email]);

  const grouped = messages.reduce((acc, msg) => {
    if (!acc[msg.sender]) acc[msg.sender] = [];
    acc[msg.sender].push(msg);
    return acc;
  }, {});

  const senders = Object.keys(grouped).sort((a, b) => {
    const aUnread = grouped[a].some((m) => m.unread === "unread");
    const bUnread = grouped[b].some((m) => m.unread === "unread");
    if (aUnread && !bUnread) return -1;
    if (!aUnread && bUnread) return 1;
    return 0;
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
          .filter((m) => m.unread === "unread")
          .map((m) => m.sender)
      ).size;
      window.dispatchEvent(new CustomEvent("messagesRead", { detail: { newCount } }));
    } catch (err) {
      console.error(err);
    }
  };

  const selectedMessages = selectedSender ? grouped[selectedSender] : [];

  return (
    <div className="dm-container">
      {/* Sidebar */}
      <div className="dm-sidebar">
        <h2 className="dm-sidebar-title">Messages</h2>
        {senders.length === 0 ? (
          <p className="dm-empty">No messages yet.</p>
        ) : (
          senders.map((sender) => {
            const senderMsgs = grouped[sender];
            const hasUnread = senderMsgs.some((m) => m.unread === "unread");
            const latest = senderMsgs[0]; // already sorted newest first
            const initial = sender.charAt(0).toUpperCase();

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
                    {sender}
                  </span>
                  <span className="dm-preview">{latest.messageText}</span>
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
              <div className="dm-avatar sm">{selectedSender.charAt(0).toUpperCase()}</div>
              <span>{selectedSender}</span>
            </div>
            <div className="dm-chat-messages">
              {[...selectedMessages].reverse().map((msg, idx) => (
                <div key={idx} className="dm-bubble-wrapper">
                  <div
                    className="dm-bubble"
                    onClick={() => navigate(`/book/${msg.volumeId}`)}
                    title="Click to view book"
                  >
                    <p>{msg.messageText}</p>
                    <small>{new Date(msg.sentAt).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Messages;