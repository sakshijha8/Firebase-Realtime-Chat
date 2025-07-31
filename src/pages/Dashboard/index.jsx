import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import GroupModal from "../Chat/group-modal";

const Dashboard = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState({});
  const [groups, setGroups] = useState({});
  const currentUser = auth.currentUser;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const db = getDatabase();
  const getProfilePath = (email) => {
    return email?.replace(".", "_").replace("@", "_");
  };
  useEffect(() => {
    const usersRef = ref(db, "profile");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        setUsers(data);
      } else {
        console.log("no data");
        setUsers({});
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "profile/" + getProfilePath(currentUser?.email));

    const unsubscribeUser = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        setGroups(snapshot.val());
      } else {
        setGroups({});
      }
    });

    return () => {
      unsubscribeUser();
    };
  }, []);


 return (
  <div style={listStyles.container}>
    <div style={listStyles.header}>
      <h2 style={listStyles.title}>All Users</h2>
      <button
        style={listStyles.createGroupButton}
        onClick={() => setIsModalOpen(true)}
      >
        + Create Group
      </button>
    </div>

    <ul style={listStyles.userList}>
      {Object.entries(users)
        .filter(([_, user]) => user.email !== currentUser?.email)
        .map(([key, user]) => (
          <li
            key={key}
            onClick={() => navigate(`/chat/${key}`, { state: user })}
            style={listStyles.userItem}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                listStyles.userItemHover.backgroundColor)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                listStyles.userItem.backgroundColor)
            }
          >
            {user?.email}
          </li>
        ))}
    </ul>

    <div>
      <h3 style={listStyles.groupSectionTitle}>Your Groups</h3>
      <ul style={listStyles.userList}>
        {Object.entries(groups?.chats || {}).map(([key, item]) => (
          <li
            key={key}
            onClick={() =>
              navigate(`/chat/${key}`, {
                state: { email: item?.withUser, isGroup: true },
              })
            }
            style={listStyles.groupItem}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                listStyles.groupItemHover.backgroundColor)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                listStyles.groupItem.backgroundColor)
            }
          >
            {item?.groupName}
          </li>
        ))}
      </ul>
    </div>

    {isModalOpen && <GroupModal users={users} onClose={() => setIsModalOpen(false)} />}
  </div>
);
};

const listStyles = {
  container: {
    padding: "24px",
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "20px",
  },
  createGroupButton: {
    padding: "8px 12px",
    backgroundColor: "#4fbaec",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  userList: {
    listStyle: "none",
    paddingLeft: 0,
    marginBottom: "32px",
  },
  userItem: {
    padding: "10px 14px",
    marginBottom: "8px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  userItemHover: {
    backgroundColor: "#e0e7ff",
  },
  groupSectionTitle: {
    marginBottom: "12px",
    fontSize: "18px",
  },
  groupItem: {
    padding: "10px 14px",
    marginBottom: "8px",
    backgroundColor: "#e0f2f1",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  groupItemHover: {
    backgroundColor: "#b2dfdb",
  },
};

export default Dashboard;

