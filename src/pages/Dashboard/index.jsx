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
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "100px", alignItems: "center" }}>
        <h2>All Users:</h2> <button onClick={() => setIsModalOpen(true)} >Create Group</button></div>
      <ul>
        {Object.entries(users)
          .filter(([key, user]) => user.email !== currentUser?.email)
          .map(([key, user]) => (
            <li key={key} style={{ cursor: "pointer" }}
              onClick={() => navigate(`/chat/${key}`, {
                state: user
              })}
            >{user?.email}</li>
          ))}
      </ul>

      <h3>Your Groups</h3>
      <ul>
        {Object.entries(groups?.chats || {}).map(([key, item]) => {
          return (
            <h4
              key={key}
              onClick={() => {
                navigate(`/chat/${key}`, {
                  state: { email: item?.withUser, isGroup: true },
                });
              }}
              style={{ cursor: "pointer" }}
            >
              {item?.groupName}
            </h4>
          );
        })}
      </ul>
      {isModalOpen && (
        <GroupModal users={users} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;

