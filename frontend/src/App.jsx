import { useState } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [keystrokes, setKeystrokes] = useState([]);
  const [result, setResult] = useState("");

  // 👉 Track typing behavior
  const handleKeyDown = (e) => {
    const time = Date.now();

    setKeystrokes((prev) => [
      ...prev,
      {
        key: e.key,
        time: time,
      },
    ]);
  };

  // 👉 Send data to backend
  const handleSubmit = async () => {
    try {
      console.log("Sending request...");
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/session/create",
        {
          content: text,
          keystrokes: keystrokes,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json"
          },
        }
      );

    console.log("Received response"); 
    console.log("RESPONSE:", res); 

      setResult(res.data.analysis || res.data.message);
    } catch (err) {
      console.log(err);
      setResult("Error occurred");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vi-Notes Editor</h2>

      <textarea
        rows="10"
        cols="50"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start typing here..."
      />

      <br /><br />

      <button onClick={handleSubmit}>Analyze</button>

      <h3>Result: {result}</h3>
    </div>
  );
}

export default App;