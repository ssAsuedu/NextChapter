import React, { useEffect, useRef, useState } from "react";
import colors from "../styles/colors";

//const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const API_BASE = "http://localhost:5050/api";

const Profile = () => {
  const userName = localStorage.getItem("userName");
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const debounced = useRef();

  useEffect(() => {
    clearTimeout(debounced.current);
    if (!q.trim()) { 
      setResults([]); 
      setErr(""); 
      return; 
    }
    debounced.current = setTimeout(async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/books?q=${encodeURIComponent(q.trim())}`);
        if (!res.ok) throw new Error(await res.text());
        const responseData = await res.json();
        
        // Debug logging
        console.log("Full API Response:", responseData);
        
        // Handle different possible response structures
        let books = [];
        
        // Check if the response has a nested data structure
        if (responseData.data && responseData.data.hits) {
          books = responseData.data.hits;
          console.log("Found books in data.hits:", books);
        } else if (responseData.hits) {
          books = responseData.hits;
          console.log("Found books in hits:", books);
        } else if (Array.isArray(responseData)) {
          books = responseData;
          console.log("Response is already an array:", books);
        } else if (responseData.items) {
          books = responseData.items;
          console.log("Found books in items:", books);
        }
        
        setResults(books);
        console.log("Final results set:", books.length, "books");
      } catch (e) {
        setErr(e.message || "Search failed");
        console.error("Search error:", e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounced.current);
  }, [q]);

  return (
    <div style={{ 
      width: "100%",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      padding: "40px 20px"
    }}>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        padding: "60px 40px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
      }}>
        <h1 style={{ 
          color: "#333333",
          fontSize: "2.5rem",
          marginBottom: "1.5rem"
        }}>
          Welcome{userName ? `, ${userName}` : " to Your Profile"}
        </h1>
        <p style={{ 
          color: "#666666",
          fontSize: "1.2rem",
          lineHeight: "1.8",
          marginBottom: "2rem"
        }}>
          This is your profile page. Here you can manage your reading list, track your progress, 
          and connect with other book lovers.
        </p>

        {/* Search Bar Section */}
        <div style={{ 
          marginBottom: "3rem",
          padding: "30px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          border: "1px solid #e0e0e0"
        }}>
          <h2 style={{ 
            color: "#444444",
            fontSize: "1.5rem",
            marginBottom: "1rem"
          }}>
            Search Books
          </h2>
          
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8 }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search books by title, author, or ISBN…"
              style={{ 
                flex: 1, 
                padding: 12, 
                border: "2px solid #d0d0d0", 
                borderRadius: 8,
                fontSize: 16,
                backgroundColor: "#ffffff",
                color: "#333333"
              }}
            />
          </form>

          {loading && (
            <div style={{ 
              marginTop: 12, 
              textAlign: "center",
              color: "#666666"
            }}>
              Searching…
            </div>
          )}
          
          {err && (
            <div style={{ 
              marginTop: 12, 
              color: "#d32f2f", 
              textAlign: "center",
              backgroundColor: "#ffebee",
              padding: 8,
              borderRadius: 4
            }}>
              {err}
            </div>
          )}

          {results.length > 0 && (
            <div style={{ 
              marginTop: 16,
              maxHeight: 600,
              overflowY: "auto"
            }}>
              {results.map((item) => {
                // Get the book document from the hit
                const book = item.document;
                if (!book) return null;
                
                return (
                  <div 
                    key={book.id || book.slug || Math.random()} 
                    style={{ 
                      display: "flex",
                      gap: 16,
                      padding: "16px",
                      marginBottom: 12,
                      backgroundColor: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Book Cover */}
                    {book.image && (
                      <div style={{ 
                        flexShrink: 0,
                        width: 80,
                        height: 120,
                        backgroundColor: book.image.color || "#f0f0f0",
                        borderRadius: 4,
                        overflow: "hidden"
                      }}>
                        <img 
                          src={book.image.url} 
                          alt={book.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.backgroundColor = book.cover_color || "#e0e0e0";
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Book Details */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#333333",
                        margin: "0 0 8px 0"
                      }}>
                        {book.title}
                        {book.subtitle && (
                          <span style={{ 
                            fontSize: 14,
                            fontWeight: 400,
                            color: "#666666",
                            display: "block",
                            marginTop: 4
                          }}>
                            {book.subtitle}
                          </span>
                        )}
                      </h3>
                      
                      <div style={{ 
                        fontSize: 14,
                        color: "#666666",
                        marginBottom: 6
                      }}>
                        by {(book.author_names && book.author_names.join(", ")) || "Unknown Author"}
                      </div>
                      
                      <div style={{ 
                        display: "flex",
                        gap: 16,
                        fontSize: 13,
                        color: "#888888",
                        marginBottom: 8
                      }}>
                        {book.release_year && (
                          <span>📅 {book.release_year}</span>
                        )}
                        {book.pages && (
                          <span>📖 {book.pages} pages</span>
                        )}
                        {book.rating > 0 && (
                          <span>⭐ {book.rating.toFixed(1)}</span>
                        )}
                        {book.users_count > 0 && (
                          <span>👤 {book.users_count} readers</span>
                        )}
                      </div>
                      
                      {book.genres && book.genres.length > 0 && (
                        <div style={{ 
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                          marginBottom: 8
                        }}>
                          {book.genres.map((genre, i) => (
                            <span 
                              key={i}
                              style={{
                                padding: "2px 8px",
                                backgroundColor: "#f0f0f0",
                                borderRadius: 12,
                                fontSize: 11,
                                color: "#666666"
                              }}
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {book.description && (
                        <p style={{
                          fontSize: 12,
                          color: "#777777",
                          lineHeight: 1.5,
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {book.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Reading Stats Section */}
        <div style={{ 
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          border: "1px solid #e0e0e0"
        }}>
          <h2 style={{ 
            color: "#444444",
            fontSize: "1.5rem",
            marginBottom: "1rem"
          }}>
            Reading Stats
          </h2>
          <p style={{ 
            color: "#666666",
            fontSize: "1rem"
          }}>
            Your personalized reading statistics will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;