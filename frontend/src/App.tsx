import Home from './Routes/Home.tsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Blocked from './Routes/Blocked.tsx';
import TwilioTutorial from './Routes/TwilioTutorial.tsx';
import NavBar from './components/navbar.tsx';
import Header from './components/header.tsx';
import Assistant from './Routes/AIAssiatant.tsx';
import { useAuth } from "@clerk/clerk-react";


function App() {
  const { has } = useAuth();
  const hasPlan = has?.({ plan: "paid_tier"});
  

  const app = (
    <BrowserRouter>
    <div style={{height: "100vh"}}>

    <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/twilio-tutorial' element={<TwilioTutorial/>}/>
        <Route path='/blocked' element={<Blocked/>}/>
        {<Route path='/ai' element={<Assistant/>}/>}
      </Routes>
    </div>
    </BrowserRouter>
  )

  return app;
}

export default App
