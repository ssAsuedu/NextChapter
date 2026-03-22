import React, { useEffect, useState } from "react";
import { getMessages, markMessagesAsRead } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Messages.css";

function Messages() {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getMessages(email);
        setMessages(res.data.messages);

        // mark as read when opened
        await markMessagesAsRead(email);
      } catch (err) {
        console.error(err);
      }
    };

    if (email) fetchMessages();
  }, [email]);

  return (
    <div className="messages-page">
      <h2>Your Messages</h2>

      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message-card ${
              msg.unread === "unread" ? "unread" : ""
            }`}
            onClick={() =>
              navigate(`/book/${msg.volumeId}`)
            }
          >
            <p><strong>{msg.sender}</strong></p>
            <p>{msg.messageText}</p>
            <small>{new Date(msg.sentAt).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
}

export default Messages;