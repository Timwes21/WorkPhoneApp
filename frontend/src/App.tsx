import Home from './Routes/Home.tsx';
import { useEffect, useState} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Blocked from './Routes/Blocked.tsx';
import TwilioTutorial from './Routes/TwilioTutorial.tsx';
import NavBar from './components/navbar.tsx';
import Header from './components/header.tsx';
import Assistant from './Routes/AIAssiatant.tsx';
import { useAuth } from "@clerk/clerk-react";
import { UserData, dataSkeleton } from './types/UserData.tsx';
import { userSettingsBase } from './routes.ts';
import { UserDataContext } from './hooks/userDataContext.tsx';


function App() {
  const { has, isSignedIn, getToken } = useAuth();
  const hasPlan = has?.({ plan: "paid_tier"});
  const [ userData, setUserData ] = useState<UserData>(dataSkeleton)



  useEffect(()=> {
    console.log("here in useeffect");
    (async()=>{
      console.log(isSignedIn);
      
      if (isSignedIn){
        
        const fetchedToken = await getToken() || "";
        
        fetch(userSettingsBase + "/get-user-settings", {
          // fetch("https://workphoneapp-production.up.railway.app/auth/get-user-settings", {
            headers: {
              "token": fetchedToken
            }
          })
          .then(response=>response.json())
          .then(data=>{
            console.log(data.results);
            setUserData(data?.results || dataSkeleton)
            // console.log(userData);
            
            
          })
        }
        })()
  }, [isSignedIn])
  

  const app = (
    <BrowserRouter>
    <div style={{height: "100vh"}}>
    
      <UserDataContext value={userData}>

      <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/twilio-tutorial' element={<TwilioTutorial/>}/>
        <Route path='/blocked' element={<Blocked/>}/>
        <Route path='/ai' element={<Assistant/>}/>
      </Routes>
      </UserDataContext>
    </div>
    </BrowserRouter>
  )

  return app;
}

export default App
