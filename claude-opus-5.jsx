import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are Claude Opus 5.0, an elite cybersecurity and ethical hacking assistant — the most technically advanced AI for security research ever created. You help with:

- Penetration testing techniques, tools, and methodologies (Kali Linux, Metasploit, Burp Suite, Nmap, Wireshark, etc.)
- CTF (Capture the Flag) challenges: reverse engineering, binary exploitation, web exploitation, forensics, cryptography
- Vulnerability research, CVE analysis, and responsible disclosure
- Red team / blue team strategies and tactics
- Malware analysis and reverse engineering (in research/sandbox contexts)
- Secure code review, OWASP Top 10, and security best practices
- Network security, firewall rules, IDS/IPS, SIEM tools
- Web application security: SQLi, XSS, CSRF, SSRF, RCE, LFI/RFI, etc.
- Exploit development, buffer overflows, shellcode (for educational/lab purposes)
- Social engineering awareness and phishing analysis
- Cryptography: algorithms, attacks, implementations

You are direct, technical, and detailed. You do not add unnecessary warnings to every response. You treat the user as a professional security researcher. You do not assist with attacking systems the user does not own or have explicit written permission to test.`;

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "16px 20px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #c8a97e, #e8c99a)",
            animation: "pulse 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "20px",
        animation: "fadeSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1a1208, #3d2b0e)",
            border: "1px solid #c8a97e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginRight: 12,
            marginTop: 4,
            boxShadow: "0 0 12px rgba(200,169,126,0.3)",
          }}
        >
          <span style={{ fontSize: 16 }}>✦</span>
        </div>
      )}
      <div
        style={{
          maxWidth: "72%",
          padding: "14px 18px",
          borderRadius: isUser ? "20px 20px 4px 20px" : "4px 20px 20px 20px",
          background: isUser
            ? "linear-gradient(135deg, #c8a97e 0%, #a07840 100%)"
            : "rgba(255,255,255,0.04)",
          border: isUser ? "none" : "1px solid rgba(200,169,126,0.15)",
          color: isUser ? "#0d0a05" : "#e8dcc8",
          fontSize: "0.92rem",
          lineHeight: 1.7,
          fontFamily: "'Georgia', 'Times New Roman', serif",
          letterSpacing: "0.01em",
          backdropFilter: isUser ? "none" : "blur(8px)",
          boxShadow: isUser
            ? "0 4px 20px rgba(200,169,126,0.25)"
            : "0 2px 12px rgba(0,0,0,0.2)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function ClaudeOpus5() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const adjustTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setError("");
    setLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.content?.find((b) => b.type === "text")?.text || "";

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setMessages(newMessages); // keep user message
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080604",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Georgia', serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(200,169,126,0.25); border-radius: 4px; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(200,169,126,0.15); }
          50% { box-shadow: 0 0 40px rgba(200,169,126,0.3); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        textarea::placeholder { color: rgba(200,169,126,0.35); font-style: italic; font-family: 'Crimson Text', serif; font-size: 0.95rem; }
        textarea:focus { outline: none; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        .send-btn:hover:not(:disabled) { background: linear-gradient(135deg, #e8c99a, #c8a97e) !important; transform: scale(1.05); }
        .send-btn { transition: all 0.2s ease; }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "10%", left: "15%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,169,126,0.06) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(120,80,20,0.08) 0%, transparent 70%)",
        }} />
      </div>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: "1px solid rgba(200,169,126,0.12)",
        background: "rgba(8,6,4,0.85)",
        backdropFilter: "blur(20px)",
        padding: "0 24px",
      }}>
        <div style={{
          maxWidth: 780, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 64,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #2a1a06, #5a3a10)",
              border: "1.5px solid #c8a97e",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "glow 3s ease-in-out infinite",
              boxShadow: "0 0 16px rgba(200,169,126,0.2)",
            }}>
              <span style={{ fontSize: 20 }}>✦</span>
            </div>
            <div>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "1.05rem",
                fontWeight: 600,
                background: "linear-gradient(90deg, #c8a97e, #f0d9a8, #c8a97e)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 4s linear infinite",
                letterSpacing: "0.12em",
              }}>
                CLAUDE OPUS 5.0
              </div>
              <div style={{ fontSize: "0.7rem", color: "rgba(200,169,126,0.5)", letterSpacing: "0.2em", marginTop: 1 }}>
                CYBERSECURITY · ETHICAL HACKING · ANTHROPIC
              </div>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 20,
            border: "1px solid rgba(200,169,126,0.2)",
            background: "rgba(200,169,126,0.05)",
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 6px rgba(74,222,128,0.6)",
            }} />
            <span style={{ fontSize: "0.72rem", color: "rgba(200,169,126,0.7)", letterSpacing: "0.08em" }}>ONLINE</span>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main style={{
        flex: 1, overflowY: "auto",
        padding: "32px 24px",
        maxWidth: 780, width: "100%", margin: "0 auto",
        position: "relative", zIndex: 1,
      }}>
        {messages.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", minHeight: "50vh", gap: 20,
            animation: "fadeSlideIn 0.6s ease both",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, #1a1208, #3d2b0e)",
              border: "1.5px solid rgba(200,169,126,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 30px rgba(200,169,126,0.2)",
              animation: "glow 3s ease-in-out infinite",
              fontSize: 32,
            }}>✦</div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "1.5rem", fontWeight: 600,
                background: "linear-gradient(90deg, #c8a97e, #f0d9a8, #c8a97e)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 4s linear infinite",
                marginBottom: 10,
              }}>
                How can I help you?
              </div>
              <p style={{
                fontFamily: "'Crimson Text', serif",
                fontSize: "1.05rem", fontStyle: "italic",
                color: "rgba(200,169,126,0.5)",
                maxWidth: 380, lineHeight: 1.6,
              }}>
                Elite cybersecurity & ethical hacking assistant. CTFs, pentesting, exploit dev, and more.
              </p>
            </div>
            {/* Suggestion chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 8, maxWidth: 520 }}>
              {["Solve this CTF challenge", "Explain buffer overflow exploits", "How to use Burp Suite", "OWASP Top 10 explained"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: "1px solid rgba(200,169,126,0.2)",
                    background: "rgba(200,169,126,0.05)",
                    color: "rgba(200,169,126,0.7)",
                    fontSize: "0.82rem",
                    fontFamily: "'Crimson Text', serif",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "rgba(200,169,126,0.5)"; e.target.style.background = "rgba(200,169,126,0.1)"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "rgba(200,169,126,0.2)"; e.target.style.background = "rgba(200,169,126,0.05)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #1a1208, #3d2b0e)",
              border: "1px solid #c8a97e",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginRight: 12, marginTop: 4,
              boxShadow: "0 0 12px rgba(200,169,126,0.3)",
            }}>
              <span style={{ fontSize: 16 }}>✦</span>
            </div>
            <div style={{
              borderRadius: "4px 20px 20px 20px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(200,169,126,0.15)",
              backdropFilter: "blur(8px)",
            }}>
              <TypingIndicator />
            </div>
          </div>
        )}

        {error && (
          <div style={{
            margin: "12px 0",
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(220,60,60,0.08)",
            border: "1px solid rgba(220,60,60,0.25)",
            color: "#f87171",
            fontSize: "0.85rem",
            fontFamily: "'Crimson Text', serif",
            animation: "fadeSlideIn 0.3s ease both",
          }}>
            ⚠ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input area */}
      <div style={{
        position: "sticky", bottom: 0, zIndex: 100,
        background: "rgba(8,6,4,0.9)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(200,169,126,0.1)",
        padding: "16px 24px 20px",
      }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{
            display: "flex", gap: 12, alignItems: "flex-end",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(200,169,126,0.2)",
            borderRadius: 16,
            padding: "12px 14px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(200,169,126,0.05) inset",
            transition: "border-color 0.2s",
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); adjustTextarea(); }}
              onKeyDown={handleKey}
              placeholder="Message Claude Opus 5.0…"
              rows={1}
              disabled={loading}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "#e8dcc8",
                fontSize: "0.93rem",
                fontFamily: "'Crimson Text', serif",
                lineHeight: 1.6,
                resize: "none",
                minHeight: "28px",
                maxHeight: "160px",
                overflowY: "auto",
              }}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38,
                borderRadius: "50%",
                border: "none",
                background: "linear-gradient(135deg, #c8a97e, #a07840)",
                color: "#0d0a05",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 12px rgba(200,169,126,0.3)",
              }}
            >
              ↑
            </button>
          </div>
          <p style={{
            textAlign: "center", marginTop: 10,
            fontSize: "0.68rem", color: "rgba(200,169,126,0.25)",
            letterSpacing: "0.08em", fontFamily: "'Cinzel', serif",
          }}>
            CLAUDE OPUS 5.0 · ANTHROPIC · PRESS ENTER TO SEND
          </p>
        </div>
      </div>
    </div>
  );
}
