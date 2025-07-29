import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, onValue, push, ref, remove, update } from "firebase/database";

const Chat = () => {
    const { state } = useLocation();
    const currentUser = auth?.currentUser;
    const db = getDatabase();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [isDelete, setIsDelete] = useState({
        deleteConversation: false,
        deleteMessage: false,
        deleteId: ''
    });
    const [editState, setEditState] = useState({ id: null, text: "" });
    const [chats, setChats] = useState([]);
    const chatId = [currentUser?.email, state?.email].sort().join("_").replace(/[^a-zA-Z0-9]/g, "_");
    const chatRef = ref(db, "chats/" + chatId + "/messages");

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
                const chatArray = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));
                setChats(chatArray);
            } else {
                setChats([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleDeleteConversation = () => {
        remove(chatRef)
            .then(() => {
                alert("Message deleted successfully!");
                setChats([]);
                setIsDelete((prev) => ({
                    ...prev,
                    deleteConversation: false,
                }));
            })
            .catch((error) => {
                console.error("Error deleting message:", error);
            });
    };


    const handleEdit = (id, currentText) => {
        setEditState({ id, text: currentText });
    };

    const handleDeleteMessage = async (messageId) => {
        const messageRef = ref(db, `chats/${chatId}/messages/${messageId}`);
        try {
            await remove(messageRef);
            alert("Message deleted successfully!");
            setIsDelete((prev) => ({
                    ...prev,
                    deleteId: '',
                    deleteMessage: false,
                }));
        } catch (err) {
            console.error("Error deleting message:", err);
        }
    };

    const handleSaveEdit = async () => {
        if (!editState.text.trim()) return;

        const messageRef = ref(db, `chats/${chatId}/messages/${editState.id}`);
        try {
            await update(messageRef, { text: editState.text });
            setEditState({ id: null, text: "" });
        } catch (err) {
            console.error("Error updating message:", err);
        }
    };


    return (
        <>
            <div style={chatStyles.container}>
                <div style={chatStyles.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h3 style={chatStyles.userName}>{state?.email || "Chat User"}</h3>
                        <button style={{ color: "red", cursor: "pointer" }} onClick={() => setIsDelete({ deleteConversation: true })}>Delete Conversation</button>
                    </div>
                    <button onClick={() => navigate("/dashboard")} style={chatStyles.backButton}>⬅ Back</button>
                </div>

                <div style={chatStyles.chatBody}>
                    {chats?.map((chat, index) => (
                        <div key={index} style={{
                            display: "flex",
                            justifyContent: chat?.sender === currentUser?.email ? "flex-end" : "flex-start",
                            marginBottom: "8px",
                        }}>

                            {editState.id === chat.id ? (
                                <>
                                    <input
                                        value={editState.text}
                                        onChange={(e) =>
                                            setEditState((prev) => ({ ...prev, text: e.target.value }))
                                        }
                                    />
                                    <button onClick={handleSaveEdit}>Save</button>
                                    <button onClick={() => setEditState({ id: null, text: "" })}>Cancel</button>
                                </>
                            ) : (
                                <>
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
                                    <div>
                                        <button onClick={() => handleEdit(chat.id, chat.text)}>Edit</button>
                                        <button onClick={() => setIsDelete({ deleteMessage: true, deleteId: chat.id })}>Delete</button>
                                    </div>
                                </>
                            )}

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
            {(isDelete.deleteConversation || isDelete.deleteMessage) && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>
                            {isDelete.deleteMessage
                                ? "Delete Message"
                                : "Delete Conversation"}
                        </h2>
                        <p>
                            Are you sure you want to{" "}
                            {isDelete.deleteMessage
                                ? "delete this message"
                                : "delete the entire conversation"}
                            ? This action cannot be undone.
                        </p>
                        <button
                            onClick={() =>
                                setIsDelete({
                                    deleteMessage: false,
                                    deleteConversation: false,
                                })
                            }
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (isDelete.deleteMessage) {
                                    handleDeleteMessage(isDelete.deleteId);
                                }
                                if (isDelete.deleteConversation) {
                                    handleDeleteConversation();
                                }
                            }}
                            style={{
                                backgroundColor: "#e01e5a",
                                marginLeft: "12px",
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </>
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
