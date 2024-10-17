import React from "react";

export default function Participant({ name }) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        //   justifyContent: "center",
          alignItems: "center",
          padding: "9px",
          border: "1px solid #ccc",
          borderRadius: "7px",
          backgroundColor: "#FFD700", // Gold color for the outer box
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          maxWidth: "300px",
          margin: "10px",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "25px",
            backgroundColor: "#007bff", // Keeping the avatar color as is
            color: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
            marginRight: "10px", // Add space between the avatar and the name
          }}
        >
          {name.substring(0, 2).toUpperCase()}
        </div>
        <div style={{ fontSize: "20px" ,color:"black"}}>{name}</div>
      </div>
    );
  }
