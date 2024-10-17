import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
export default function LoginPage() {
  const navigate = useNavigate();
  const [createRoom, setCreateRoom] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const handleCreate = (e) => {
    e.preventDefault();
    setRoomId("");
    setCreateRoom((prev) => !prev);
    if (createRoom === false) {
      const id = uuidv4();
      setRoomId(id);
    }
  };
  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId === "" || name === "") {
      alert("Please fill all fields");
    } else {
      navigate(`/edit/${roomId}`, { state: { name: name } });
    }
  };
  const handleEnter = (e) => {
    if(e.key==="Enter"){
      handleJoin(e)
    }
  }
  return (
    <div className="loginWrap">
      <div className="loginBox">
        {createRoom === true ? <h2>CREATE ROOM</h2> : <h2>JOIN ROOM</h2>}
        <div className="inputWrap">
          <input
            type="text"
            disabled={createRoom}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            onKeyUp={handleEnter} 

          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Your Name"
            onKeyUp={handleEnter} 

          />
          <button onClick={handleJoin} onKeyUp={handleEnter}>
            {createRoom === true ? "create" : "Join"}
          </button>
          {createRoom === false ? (
            <span>
              Create Room?{" "}
              <a href="" onClick={handleCreate}>
                create
              </a>
            </span>
          ) : (
            <span>
              Join Room?{" "}
              <a href="" onClick={handleCreate}>
                Join
              </a>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
