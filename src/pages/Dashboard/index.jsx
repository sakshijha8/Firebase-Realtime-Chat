import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState({});
  const currentUser = auth.currentUser;
  console.log("currentUser", currentUser)

  useEffect(() => {
    const db = getDatabase();
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


  return (
    <div style={{ padding: "20px" }}>
      <h2>All Users:</h2>
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

    </div>
  );
};

export default Dashboard;

