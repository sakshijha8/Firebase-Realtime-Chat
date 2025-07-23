import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, onValue, push, ref } from "firebase/database";

const Chat = () => {
    const { state } = useLocation();
    const currentUser = auth?.currentUser;
    const db = getDatabase();
    const chatId = [currentUser?.email, state?.email].sort().join("_").replace(/[^a-zA-Z0-9]/g, "_");
    const chatRef = ref(db, "chats/" + chatId + "/messages");

    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([]);

    const handleSend = () => {
        if (message.trim()) {
            push(chatRef, {
                text: message,
                sender: currentUser?.email,
                receiver: state?.email,
                timestamp: Date.now(),
            });
            setMessage("");
        }
    };

    useEffect(() => {
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const chatArray = Object.values(data);
                setChats(chatArray);
            } else {
                setChats([]);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div style={chatStyles.container}>
            <div style={chatStyles.header}>
                <h3 style={chatStyles.userName}>{state?.email || "Chat User"}</h3>
                <button onClick={() => navigate("/dashboard")} style={chatStyles.backButton}>⬅ Back</button>
            </div>

            <div style={chatStyles.chatBody}>
                {chats?.map((chat, index) => (
                    <div key={index} style={{
                        display: "flex",
                        justifyContent: chat?.sender === currentUser?.email ? "flex-end" : "flex-start",
                        marginBottom: "8px",
                    }}>
                        <div style={{
                            maxWidth: "60%",
                            padding: "8px 12px",
                            borderRadius: "15px",
                            background: chat?.sender === currentUser?.email ? "#DCF8C6" : "#fff",
                            border: "1px solid #ccc",
                            wordWrap: "break-word",
                        }}>
                            {chat?.text}
                        </div>
                    </div>
                ))}
            </div>


            <div style={chatStyles.inputContainer}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter message..."
                    style={chatStyles.input}
                />
                <button onClick={handleSend} style={chatStyles.sendButton}>Send</button>
            </div>
        </div>
    );
};

const chatStyles = {
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
    },
    header: {
        padding: "10px 15px",
        background: "#4fbaecff",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        background: "transparent",
        border: "none",
        color: "#fff",
        fontSize: "16px",
        marginRight: "10px",
        cursor: "pointer",
    },
    userName: {
        margin: 0,
        fontSize: "18px",
    },
    chatBody: {
        flex: 1,
        padding: "10px",
        overflowY: "auto",
        background: "#f4f4f4",
        display: "flex",
        flexDirection: "column",
    },
    chatMessage: {
        marginBottom: "8px",
        padding: "6px 10px",
        borderRadius: "5px",
    },
    inputContainer: {
        display: "flex",
        padding: "10px",
        borderTop: "1px solid #ddd",
        background: "#fff",
    },
    input: {
        flex: 1,
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        marginRight: "10px",
    },
    sendButton: {
        padding: "10px 15px",
        background: "#4fbaecff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default Chat;
