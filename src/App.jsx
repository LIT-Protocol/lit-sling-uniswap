import React from 'react';
import { Route, Routes } from "react-router-dom";
import Main from "./Main";
import ExecuteAction from "./components/ExecuteAction";

function App() {
  return (
    <div>
      <Routes>
        <Route path={'/'} element={<Main/>}/>
        <Route path={"action"} element={<ExecuteAction/>}/>
      </Routes>
    </div>
  )
}

export default App;
