import React from 'react';
import { Route, Routes } from "react-router-dom";
import Main from "./Main";
import ExecuteAction from "./components/executeAction/ExecuteAction";

// import PriceCheck from "./components/priceCheck/PriceCheck";


function App() {
  return (
    <div>
      <Routes>
        <Route path={'/'} element={<Main/>}/>
        <Route path={"action"} element={<ExecuteAction/>}/>
        {/*<Route path={"pricing"} element={<PriceCheck/>}/>*/}
      </Routes>
    </div>
  )
}

export default App;
