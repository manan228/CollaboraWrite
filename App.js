import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TextEditor from "./TextEditor";
import { v4 as uuidV4 } from "uuid";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/documents/${uuidV4()}`} replace />}
        ></Route>
        <Route path="/documents/:id" element={<TextEditor />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
