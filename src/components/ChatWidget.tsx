import React, { useEffect, useRef, useState } from "react";
import { askQuestion } from "../api/windmason";
import BotIcon from "./icons/bot";
import SendIcon from "./icons/SendIcon";
import MaximizeIcon from "./icons/MaximizeIcon";
import CloseIcon from "./icons/CloseIcon";
import Minimize from "./icons/Minimize";

type Role = "user" | "assistant";

interface Message {
    id: string;
    role: Role;
    text: string;
    ts: number;
}

function uid(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatWidget() {
    const [open, setOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const raw = localStorage.getItem("chat_demo_history");
            return raw ? (JSON.parse(raw) as Message[]) : [];
        } catch {
            return [];
        }
    });
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [openQuestions, setOpenQuestions] = useState(true);
    const [isEnlarged, setIsEnlarged] = useState(false);

    const listRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    /* Scroll to bottom when messages update */
    useEffect(() => {
        localStorage.setItem("chat_demo_history", JSON.stringify(messages));
        requestAnimationFrame(() => {
            if (listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
            }
        });
    }, [messages]);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [open]);
    const toggleOpen = () => {
        if (!open) {
            const audio = new Audio();
            audio.src = 'https://drive.google.com/file/d/1AkVj97x3E3rhXhSsakDtugMJwlg5pvnV/view'
            audio.play().catch(err => console.error("Audio playback failed:", err));
        }
        setOpen(v => !v);
        if (open) setOpenQuestions(true);
    };



    const pushMessage = (role: Role, text: string) => {
        const m: Message = { id: uid(), role, text, ts: Date.now() };
        setMessages((s) => [...s, m]);
        return m;
    };

    const send = async () => {
        const trimmed = value.trim();
        if (!trimmed) return;

        pushMessage("user", trimmed);
        setValue("");
        setLoading(true);

        try {
            const reply = await askQuestion(trimmed);
            await new Promise((r) => setTimeout(r, 250));

            const audio = new Audio("https://drive.google.com/file/d/13nFf4qhEZoTxxn3wjvIwcnieqB123rep/view?usp=sharing");
            audio.play().catch(() => { });

            pushMessage("assistant", reply);
        } catch {
            pushMessage("assistant", "Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const handlePresetClick = (text: string) => {
        setValue(text);
        if (!open) toggleOpen();
        inputRef.current?.focus();
    };

    // Disable scroll when enlarged
    useEffect(() => {
        document.body.style.overflow = isEnlarged ? "hidden" : "";
    }, [isEnlarged]);

    // Inline styles below
    const styles: any = {
        fab: {
            position: "fixed",
            right: "22px",
            bottom: "22px",
            width: "64px",
            height: "64px",
            borderRadius: "999px",
            background: "#EE0C08",
            color: "white",
            border: "none",
            boxShadow: "0 12px 32px rgba(9,35,87,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all .2s",
            zIndex: 1200,
            transform: open ? "rotate(45deg)" : "none",
        },

        panel: {
            position: "fixed",
            right: !isEnlarged ? '22px' : 0,
            // left: 0,
            bottom: !isEnlarged ? '100px' : 0,
            width: isEnlarged ? "100%" : "360px",
            height: isEnlarged ? "100vh" : "72vh",
            maxWidth: isEnlarged ? "100vw" : "360px",
            maxHeight: isEnlarged ? "100vh" : "72vh",
            borderRadius: isEnlarged ? "0" : "16px",
            background: "white",
            display: open ? "flex" : "none",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 12px 32px rgba(9,35,87,0.12)",
            zIndex: isEnlarged ? 2000 : 1199,
            transition: "all .3s ease",
        },

        header: {
            padding: "14px",
            background: "#EE0C08",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },

        messages: {
            flex: 1,
            padding: "14px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            background: "linear-gradient(20deg, #ffffff, #f9fbfd)",
        },

        msgRow: (role: string) => ({
            display: "flex",
            justifyContent: role === "user" ? "flex-end" : "flex-start",
            flexDirection: role === "user" ? "row" : "column",
            gap: role === "user" ? "0" : "10px",


        }),

        bubble: (role: string) => ({
            background: role === "assistant" ? "#EE0C08" : "white",
            color: role === "assistant" ? "white" : "#092357",
            padding: "12px",
            borderRadius: "14px",
            boxShadow: "0 8px 24px rgba(9,35,87,0.08)",
            maxWidth: "80%",
            whiteSpace: "pre-wrap",

        }),

        inputRow: {
            padding: "12px",
            background: "#fff",
            display: "flex",
        },

        inputBox: {
            flex: 1,
            background: "#F3F5F6",
            borderRadius: "20px",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
        },

        input: {
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: "14px",
        },

        sendBtn: {
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "6px",
            opacity: value.trim() ? 1 : 0.4,
        },
    };

    return (
        <div>

            {/* Floating Chat Button */}
            <button style={styles.fab} onClick={toggleOpen}>
                {open ? <CloseIcon /> : <BotIcon />}
            </button>

            {/* Chat Panel */}
            <div style={styles.panel}>

                {/* HEADER */}
                <div style={styles.header}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <BotIcon />
                        <div>
                            <div style={{ fontWeight: "700", fontSize: 14 }}>Chatbot</div>
                            <div style={{ fontSize: 12 }}>
                                <span style={{
                                    width: 8,
                                    height: 8,
                                    background: "#43ee7d",
                                    display: "inline-block",
                                    borderRadius: "50%",
                                    marginRight: 4,
                                }} />
                                Online
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: "white" }}
                            onClick={() => setIsEnlarged(!isEnlarged)}
                        >
                            <MaximizeIcon />
                        </button>
                        <button
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: "white" }}
                            onClick={toggleOpen}
                        >
                            <Minimize />
                        </button>
                    </div>
                </div>

                {/* MESSAGES */}
                <div style={styles.messages} ref={listRef}>
                    {messages.map((m) => (
                        <div key={m.id} style={styles.msgRow(m.role)}>
                            <div style={styles.bubble(m.role)}>
                                {m.text}
                                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>
                                    {new Date(m.ts).toLocaleTimeString()}
                                </div>
                            </div>

                            {/* Assistant avatar */}
                            {m.role === "assistant" && (
                                <div
                                    style={{
                                        width: "30px",
                                        height: "30px",
                                        padding: "6px",
                                        backgroundColor: "#EE0C08",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: "8px",

                                    }}
                                >
                                    <BotIcon />
                                </div>
                            )}
                        </div>
                    ))}




                    {loading && (
                        <div style={styles.msgRow("assistant")}>
                            <div style={styles.bubble("assistant")}>Thinking...</div>
                        </div>
                    )}
                </div>

                {/* INPUT */}
                <form
                    style={styles.inputRow}
                    onSubmit={(e) => {
                        e.preventDefault();
                        send();
                    }}
                >
                    <div style={styles.inputBox}>
                        <input
                            style={styles.input}
                            placeholder="Ask a question..."
                            ref={inputRef}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleEnter}
                        />
                        <button type="submit" style={styles.sendBtn}>
                            <SendIcon />
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
