import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/python/python.js";
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/css/css.js";
import "codemirror/mode/clike/clike.js";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

export default function Editor({ language, socket, roomId, onChange, name }) {
  const textAreaRef = useRef(null);
  const editor = useRef(null);
  const cursors = {};
  const lineLocks = useRef({});
  const getMode = (language) => {
    const modeMap = {
      javascript: "javascript",
      python: "python",
      html: "xml",
      css: "css",
      java: "text/x-java",
      cpp: "text/x-c++src",
      c: "text/x-csrc",
    };
    return modeMap[language] || "javascript";
  };
  const lockLine = (line, participant) => {
    lineLocks.current[line] = participant;
  };
  const unlockLine = (line) => {
    delete lineLocks.current[line];
  };
  const handleBeforeChange = (editor, change) => {
    console.log("handleBeforeChange called");
    console.log("change object:", change);
    const { from, to } = change;
    for (let line = from.line; line <= to.line; line++) {
      if (lineLocks.current[line] && lineLocks.current[line] !== name) {
        console.log(`Line ${line} is locked by ${lineLocks.current[line]}`);
        change.cancel();
        return;
      }
    }
  };
  useEffect(() => {
    if (editor.current) {
      console.log("Adding beforeChange event listener");
      editor.current.on("beforeChange", handleBeforeChange);
    }
    return () => {
      if (editor.current) {
        editor.current.off("beforeChange", handleBeforeChange);
      }
    };
  }, []);
  useEffect(() => {
    if (textAreaRef.current) {
      editor.current = Codemirror.fromTextArea(textAreaRef.current, {
        mode: getMode(language),
        theme: "material",
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
      });

      editor.current.on("change", (instance, changeObj) => {
        const { origin } = changeObj;
        const code = instance.getValue();
        onChange(code);
        if (origin !== "setValue") {
          socket.current.emit("code-change", {
            roomId,
            code,
          });
        }
      });

      editor.current.on("cursorActivity", (instance) => {
        const cursor = instance.getCursor();
        socket.current.emit("cursor-change", {
          roomId,
          cursor,
          participant: name,
        });
      });
    }

    const handleCodeChange = ({ code }) => {
      const cursorPosition = editor.current.getCursor();

      if (code !== null && editor.current) {
        editor.current.setValue(code);
      }
      editor.current.setCursor(cursorPosition);
    };

    const handleCursorChange = ({ cursor, participant }) => {
      if (participant !== name) {
        if (cursors[participant]) {
          if (cursors[participant].line) {
            editor.current.removeLineClass(
              cursors[participant].line,
              "background",
              "highlight-line"
            );
            unlockLine(cursors[participant].line);
          }
          cursors[participant].clear();
        }
        lockLine(cursor.line, participant);

        console.log(participant, cursor);
        const cursorElement = document.createElement("span");
        cursorElement.style.borderLeft = "1px solid white";
        cursors[participant] = editor.current.setBookmark(cursor, {
          widget: cursorElement,
          insertLeft: true,
        });
        editor.current.addLineClass(
          cursor.line,
          "background",
          "highlight-line"
        );
      }
    };
    const style = document.createElement("style");
    style.innerHTML = `
  .highlight-line {
    background-color: rgba(255, 0, 0, 0.3);
  }
`;
    document.head.appendChild(style);
    socket?.current?.on("code-change", handleCodeChange);
    socket?.current?.on("cursor-change", handleCursorChange);

    return () => {
      socket?.current?.off("code-change", handleCodeChange);
      socket?.current?.off("cursor-change", handleCursorChange);
      if (editor.current) {
        editor.current.toTextArea();
      }
    };
  }, [language, textAreaRef, socket, roomId, onChange, name]);

  return (
    <div>
      <textarea ref={textAreaRef}></textarea>
    </div>
  );
}