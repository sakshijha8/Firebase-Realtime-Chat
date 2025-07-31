import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import Input from "../../components/Input";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { getDatabase, onValue, ref, set, update } from "firebase/database";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const Login = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const handleCreateUser = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    handleLogin();
                    console.log("userCredential", userCredential);
                })

                .catch((error) => {
                    console.error("Error", error.message);
                });
        } catch (err) {
            console.error("Error creating user:", err);
        }
    }


    const handleLogin = async (e) => {
        e?.preventDefault();
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password)
                .then(async () => {
                    await setUserInFirebase(email, password);
                    navigate("/dashboard");
                })
                .catch((error) => {
                    if (error.code === "auth/invalid-credential") {
                        handleCreateUser(email, password);
                    }
                    console.log(error.code, "error");
                });

            console.log("Login successful", user);
            navigate("/dashboard");
        } catch (error) { }
    };

    const setUserInFirebase = async (email, password) => {
        const emailTemp = email.replace(".", "_").replace("@", "_");
        const db = getDatabase();
        const usersRef = ref(db, "profile/" + emailTemp);

        onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                update(
                    ref(db, "profile/" + email.replace(".", "_").replace("@", "_")),
                    {
                        email,
                        password,
                    }
                );
            } else {
                set(ref(db, "profile/" + email.replace(".", "_").replace("@", "_")), {
                    email,
                    password,
                });
            }
        });
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Login</h2>
            <form onSubmit={handleLogin} style={styles.form}>
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />
                <div style={{ position: "relative" }}>
                    <Input
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                    <div
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "58%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                        }}
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? (
                            <FaEye />
                        ) : (
                            <FaEyeSlash />
                        )}
                    </div>
                </div>
                <button type="submit" style={styles.button}>Login</button>
            </form>
        </div>
    );
};

export const styles = {
    container: {
        maxWidth: "350px",
        margin: "100px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        textAlign: "start",
    },
    title: { marginBottom: "20px", fontSize: "24px", textAlign: "center" },
    form: { display: "flex", flexDirection: "column" },
    button: {
        padding: "10px",
        fontSize: "16px",
        background: "#007BFF",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    error: { color: "red", marginBottom: "10px" },
};

export default Login;
