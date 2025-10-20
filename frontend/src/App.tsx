import Home from './Routes/Home.tsx';
import { useEffect, useState} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Blocked from './Routes/Blocked.tsx';
import TwilioTutorial from './Routes/TwilioTutorial.tsx';
import NavBar from './components/navbar.tsx';
import Header from './components/header.tsx';
import Assistant from './Routes/AIAssiatant.tsx';
import { useAuth } from "@clerk/clerk-react";
import { UserData } from './types/UserData.tsx';
import { userSettingsBase } from './routes.ts';


function App() {
  const { has, isSignedIn, getToken } = useAuth();
  const hasPlan = has?.({ plan: "paid_tier"});
  const [ userData, setUserData ] = useState<UserData>();

  // useEffect(()=> {
  //   (async()=>{

  //     const fetchedToken = await getToken() || "";
  //     fetch(userSettingsBase + "/get-user-settings", {
  //       headers: {
  //         "token": fetchedToken
  //       }
  //     })
  //     .then(response=>response.json())
  //     .then(data=>{
  //       // console.log(data.results);
  //       setUserData(data.results)
  //       console.log(userData);
        
        
  //     })
  //   })()
  // }, [])
  

  const app = (
    <BrowserRouter>
    <div style={{height: "100vh"}}>

    <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/twilio-tutorial' element={<TwilioTutorial/>}/>
        {isSignedIn&& (
          <>
            <Route path='/blocked' element={<Blocked/>}/>
            {hasPlan && <Route path='/ai' element={<Assistant/>}/>}
          </>
        )}
      </Routes>
    </div>
    </BrowserRouter>
  )

  return app;
}

export default App
