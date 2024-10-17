import React, { useState, useRef, useEffect } from "react";
import Participant from "./Participant";
import Editor from "./Editor";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { initializeSocket } from "../socket";
export default function EditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const soc = useRef(null);
  const codeRef = useRef(null);
  useEffect(() => {
    console.log(id);
    async function initSocket() {
      soc.current = await initializeSocket();
      soc.current.on("connect_error", (err) => {
        handleError(err);
      });
      soc.current.on("connect_failed", (err) => {
        handleError(err);
      });
      soc.current.emit("join-room", { id, name: location.state?.name });
      soc.current.on("participant-joined", (data) => {
        setParticipants(data.participants);
        soc.current.emit("sync-code", {
          code: codeRef.current,
          to: data.socketId,
        });
        if (data.name !== location.state?.name) {
          // alert(`${data.name} joined the room`);
        }
      });
      soc.current.on("participant-left", ({ socketId, name }) => {
        setParticipants((prev) =>
          prev.filter((participant) => participant.socketId !== socketId)
        );
        // alert(`${name} left the room`);
      });
    }
    initSocket();
    return () => {
      if (soc.current != null) {
        soc.current.off("connect_error");
        soc.current.off("connect_failed");
        soc.current.off("participant-joined");
        soc.current.off("participant-left");
        soc.current.disconnect();
      }
    };
  }, []);
  const handleLeave = () => {
    navigate("/");
  };
  const handleError = (err) => {
    console.log(err);
    alert("Server is down");
    navigate("/");
  };
  const [participants, setParticipants] = useState([
    // { socketId: 1, name: "user1" },
    // { socketId: 2, name: "user2" },
  ]);
  return (
    <>
      <div className="EditContainer">
        <div className="leftEditBox">
          <div className="sideContent">
            <div className="logoName">CO-DE</div>
            <div className="participants">
              {participants.map((participant, index) => {
                return (
                  <div key={index}>
                    <Participant name={participant.name} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="buttons">
            <button onClick={handleLeave}>leave</button>
          </div>
        </div>
        <div className="rightEditBox">
          <Editor
            socket={soc}
            language={"python"}
            roomId={id}
            name={location.state.name}
            onChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
      </div>
    </>
  );
}
