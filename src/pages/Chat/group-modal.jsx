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
                <h3 className="popup-title">Create New Group</h3>

                <input
                    className="popup-input"
                    placeholder="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />

                <div className="popup-section">
                    <strong>Select Members:</strong>
                    <div className="popup-users">
                        {Object.entries(users)?.map(([key, user]) => {
                            if (user?.email === currentUser?.email) return null;
                            return (
                                <label key={key} className="popup-checkbox">
                                    <input
                                        type="checkbox"
                                        value={key}
                                        onChange={() => handleCheckbox(key)}
                                        checked={selectedUsers?.includes(key)}
                                    />
                                    <span>{user?.email}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <textarea
                    className="popup-textarea"
                    placeholder="Send a message to the group"
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                />

                <div className="popup-actions">
                    <button className="popup-button" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="popup-button primary" onClick={handleCreateGroup}>
                        Create
                    </button>
                </div>
            </div>
        </div>

    );
};

export default GroupModal;
