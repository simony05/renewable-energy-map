import React, { forwardRef, useImperativeHandle, useState } from "react";
import Groq from "groq-sdk";
import "./Style.css";

const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_API_KEY, dangerouslyAllowBrowser: true });

const InfoBlock = forwardRef((props, ref) => {
  const [countyName, setCountyName] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useImperativeHandle(ref, () => ({
    setCountyName: (name) => {
      // Update the county name
      if (name !== countyName) {
        // Clear chat history or update with new selection message
        setChatHistory([]); // Clear chat history if desired
        setCountyName(name);
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: `You selected ${name}. What would you like to know?` }
        ]);
      }
    },
  }));

  const handleInputChange = (e) => {
    setChatInput(e.target.value);
  };

  const handleSend = async () => {
    if (!chatInput) return;

    // Add user message to chat history
    const userMessage = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, userMessage]);

    // Clear input field
    setChatInput("");

    // Get response from Groq only when the user sends a question
    await getGroqResponse(userMessage.content);
  };

  const limitResponseToSentences = (text, maxSentences = 3) => {
    const sentences = text.split('.').filter(Boolean);
    const limitedSentences = sentences.slice(0, maxSentences).join('. ') + (sentences.length > maxSentences ? '.' : '');
    return limitedSentences.trim();
  };

  const getGroqResponse = async (messageContent) => {
    const stream = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are an environmental entrepreneur chatbot, but don't say you are, just explain your answer to every question you are asked like you are in a conversation." },
        { role: "user", content: messageContent },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: true,
    });
    let responseContent = "";
    // Add a placeholder for the assistant's response
    setChatHistory((prev) => [...prev, { role: "assistant", content: "" }]);
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      responseContent += content;
      const limitedResponse = limitResponseToSentences(responseContent, 3);
      setChatHistory((prev) => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1].content = limitedResponse; // Update last assistant message
        return updatedHistory;
      });
    }
  };

  return (
    <div className='info-container'>
      <h2>County Information</h2>
      <p>{countyName ? `Selected County: ${countyName}` : "Hover over a county to see details."}</p>

      {/* Chat History */}
      <div
        style={{
          flex: 1,
          width: "100%",
          overflowY: "scroll",
          padding: "10px",
          borderTop: "1px solid black",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {chatHistory.map((message, index) => (
          <div key={index} style={{ marginBottom: "5px", textAlign: message.role === "user" ? "right" : "left" }}>
            <strong>{message.role === "user" ? "You" : "Assistant"}:</strong>
            <p style={{ margin: 0 }}>{message.content}</p>
          </div>
        ))}
      </div>
      
      {/* Input Area */}
      <div style={{ display: "flex", width: "100%", padding: "10px" }}>
        <input
          type="text"
          value={chatInput}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          style={{ flex: 1, padding: "5px" }}
        />
        <button onClick={handleSend} style={{ marginLeft: "5px", padding: "5px 10px" }}>
          Send
        </button>
      </div>
    </div>
  );
});

export default InfoBlock;
