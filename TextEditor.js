import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import { io } from "socket.io-client";
import { useParams } from "react-router";
import "quill/dist/quill.snow.css";
import { SAVE_INTERVAL_MS, TOOLBAR_OPTIONS, SOCKET_URL } from "./constants";

const TextEditorReact = () => {
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [value, setValue] = useState("");
  const quillRef = useRef(null);
  const { id: documentId } = useParams();

  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });
    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket === null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (!quillRef) return;

    const quill = quillRef.current.getEditor();

    quill.disable();
    quill.setText("Loading...");

    setQuill(quill);
  }, []);

  return (
    <ReactQuill
      className="container"
      ref={quillRef}
      modules={TOOLBAR_OPTIONS}
      theme="snow"
      value={value}
      onChange={setValue}
    />
  );
};

export default TextEditorReact;
