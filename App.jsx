import React from "react";

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#141414",
      color: "#f5f0e6",
      fontFamily: "Georgia, serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
        Sartre’s Guests
      </h1>
      <p style={{ fontSize: "1.1rem", opacity: 0.85, maxWidth: "500px" }}>
        Site-ul este conectat și funcționează!
      </p>
    </div>
  );
}
