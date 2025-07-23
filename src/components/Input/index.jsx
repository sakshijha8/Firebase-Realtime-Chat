
const Input = ({ label, type = "text", value, onChange, placeholder, ...rest }) => {
    return (
        <div style={styles.container}>
            {label && <label style={styles.label}>{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={styles.input}
                {...rest}
            />
        </div>
    );
};

const styles = {
    container: { marginBottom: "15px", display: "flex", flexDirection: "column" },
    label: { marginBottom: "5px", fontWeight: "bold" },
    input: {
        padding: "10px",
        fontSize: "16px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        outline: "none",
    },
};

export default Input;
