import { useState } from "react";
import { ref, set, getDatabase } from "firebase/database";
import { auth } from "../../firebase";
import { genrateRandomString } from "../../helpers/utils";

const GroupModal = ({ users, onClose }) => {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [firstMessage, setFirstMessage] = useState("");
    const db = getDatabase();
    const currentUser = auth.currentUser;

    const handleCheckbox = (userId) => {
        setSelectedUsers((prevSelected) => {
            if (prevSelected?.includes(userId)) {
                return prevSelected?.filter((id) => id !== userId);
            } else {
                return [...prevSelected, userId];
            }
        });
    };

    const getProfilePath = (email) =>
        email.replace(/\./g, "_").replace(/@/g, "_");

    const handleCreateGroup = async () => {
        if (!groupName?.trim() || selectedUsers?.length < 1) return;

        const groupId = "GU-" + genrateRandomString();
        const groupRef = ref(db, `groups/${groupId}`);

        const currentUserId = getProfilePath(currentUser?.email);

        const allMemberIds = [...selectedUsers, currentUserId];

        const groupData = {
            id: groupId,
            name: groupName,
            members: allMemberIds.reduce((acc, id) => {
                acc[id] = true;
                return acc;
            }, {}),
            createdBy: currentUserId,
            createdAt: new Date().toISOString(),
            text: firstMessage.trim(),
        };

        await set(groupRef, groupData);

        for (const userId of allMemberIds) {
            const userEmail = users[userId]?.email || currentUser?.email;
            const profileChatRef = ref(
                db,
                `profile/${getProfilePath(userEmail)}/chats/${groupId}`
            );

            await set(profileChatRef, {
                groupName,
                timestamp: Date.now(),
                withUser: groupId,
            });
        }

        onClose();
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h3>Create New Group</h3>
                <input
                    placeholder="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />

                <div style={{ marginTop: "1rem" }}>
                    <strong>Select Members:</strong>
                    {Object.entries(users)?.map(([key, user]) => {
                        if (user?.email === currentUser?.email) return null;
                        return (
                            <label key={key} style={{ display: "block", marginTop: "5px" }}>
                                <input
                                    type="checkbox"
                                    value={key}
                                    onChange={() => handleCheckbox(key)}
                                    checked={selectedUsers?.includes(key)}
                                />
                                {user?.email}
                            </label>
                        );
                    })}
                </div>

                <textarea
                    placeholder="Send a message to the group"
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    style={{ width: "100%", marginTop: "10px", height: "80px" }}
                />

                <div style={{ marginTop: "10px" }}>
                    <button onClick={handleCreateGroup}>Create</button>
                    <button onClick={onClose} style={{ marginLeft: "10px" }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupModal;
