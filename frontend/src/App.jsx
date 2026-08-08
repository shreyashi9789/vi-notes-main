import { useState } from "react";
import axios from "axios";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loggedIn, setLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [text, setText] = useState("");
    const [keystrokes, setKeystrokes] = useState([]);
    const [result, setResult] = useState(null);

    // -----------------------------
    // LOGIN
    // -----------------------------

    const handleLogin = async () => {
        try {
            const res = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email: email,
                    password: password
                }
            );

            localStorage.setItem("token", res.data.token);

            setLoggedIn(true);

            alert("Login successful!");

        } catch (err) {
            console.log(err);

            alert(
                err.response?.data?.message ||
                "Login failed"
            );
        }
    };

    // -----------------------------
    // REGISTER
    // -----------------------------

    const handleRegister = async () => {
        try {
            const res = await axios.post(
                "http://localhost:5000/api/auth/register",
                {
                    email: email,
                    password: password
                }
            );

            alert(res.data.message);

        } catch (err) {
            console.log(err);

            alert(
                err.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    // -----------------------------
    // TRACK TYPING
    // -----------------------------

    const handleKeyDown = (e) => {
        const time = Date.now();

        let type = "type";

        if (
            e.key === "Backspace" ||
            e.key === "Delete"
        ) {
            type = "delete";
        }

        setKeystrokes((prev) => [
            ...prev,
            {
                type: type,
                time: time
            }
        ]);
    };

    // -----------------------------
    // TRACK PASTE
    // -----------------------------

    const handlePaste = (e) => {
        const pastedText =
            e.clipboardData.getData("text");

        setKeystrokes((prev) => [
            ...prev,
            {
                type: "paste",
                time: Date.now(),
                size: pastedText.length
            }
        ]);
    };

    // -----------------------------
    // SUBMIT SESSION
    // -----------------------------

    const handleSubmit = async () => {
        try {
            console.log("Sending request...");

            const token =
                localStorage.getItem("token");

            const res = await axios.post(
                "http://localhost:5000/api/session/create",
                {
                    content: text,
                    keystrokes: keystrokes
                },
                {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("RESPONSE:", res.data);

            setResult(res.data.analysis);

        } catch (err) {
            console.log("FULL ERROR:", err);

            if (err.response) {
                console.log(
                    "SERVER RESPONSE:",
                    err.response.data
                );

                setResult({
                    error:
                        err.response.data.message ||
                        "Server error"
                });
            } else {
                setResult({
                    error: "Could not connect to backend"
                });
            }
        }
    };

    // -----------------------------
    // LOGOUT
    // -----------------------------

    const handleLogout = () => {
        localStorage.removeItem("token");
        setLoggedIn(false);
    };

    // -----------------------------
    // LOGIN SCREEN
    // -----------------------------

    if (!loggedIn) {
        return (
            <div style={{ padding: "40px" }}>
                <h1>Vi-Notes</h1>

                <h2>Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <br />
                <br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <br />
                <br />

                <button onClick={handleLogin}>
                    Login
                </button>

                <button
                    onClick={handleRegister}
                    style={{ marginLeft: "10px" }}
                >
                    Register
                </button>
            </div>
        );
    }

    // -----------------------------
    // WRITING EDITOR
    // -----------------------------

    return (
        <div style={{ padding: "20px" }}>

            <h1>Vi-Notes Editor</h1>

            <button onClick={handleLogout}>
                Logout
            </button>

            <br />
            <br />

            <textarea
                rows="15"
                cols="70"
                value={text}
                onChange={(e) =>
                    setText(e.target.value)
                }
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Start writing here..."
            />

            <br />
            <br />

            <button onClick={handleSubmit}>
                Analyze Writing
            </button>

            {result && !result.error && (
                <div>
                    <h2>Writing Analysis</h2>

                    <p>
                        Words: {result.wordCount}
                    </p>

                    <p>
                        Typing Events:{" "}
                        {result.typingEvents}
                    </p>

                    <p>
                        Deletions:{" "}
                        {result.deletions}
                    </p>

                    <p>
                        Paste Events:{" "}
                        {result.pasteCount}
                    </p>

                    <p>
                        Largest Paste:{" "}
                        {result.largestPaste} characters
                    </p>

                    <p>
                        Pauses:{" "}
                        {result.pauseCount}
                    </p>

                    <p>
                        Longest Pause:{" "}
                        {result.longestPause / 1000} seconds
                    </p>
                </div>
            )}

            {result?.error && (
                <p style={{ color: "red" }}>
                    {result.error}
                </p>
            )}
        </div>
    );
}

export default App;