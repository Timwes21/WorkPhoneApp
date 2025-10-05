import NavBar from '../components/navbar.tsx';
import BlockedList from '../components/blocked.tsx'
import { useEffect, useState } from 'react';
import { authBase } from '../routes.ts';
import { useAuth } from "@clerk/clerk-react";
import BlockedMessage from '../components/blocked-message.tsx';





export default function Blocked() {
    const [ token, setToken ] = useState<string>("");
    const [ blockedMessage, setBlockedMessage ] = useState<string>("");
    const [ editting, setEditting ] = useState<boolean>(false);
    const [ refresh, setRefresh ] = useState<boolean>();
    const { getToken } = useAuth();
    
    useEffect(()=> {
        (async()=>{
            const fetchedToken = await getToken() || "";
            setToken(fetchedToken);
            const fetchedBlockedMessage = await fetch(authBase + "/get-blocked-message", {
                headers : {
                    "token": fetchedToken
                }
            })
            setBlockedMessage((await fetchedBlockedMessage.text()).replaceAll("\"", ""));
        })()

    }, [refresh])

    const saveChanges = () => {
        fetch(authBase + "/update-blocked-message", {
            method: "POST",
            headers : {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({updated: blockedMessage})
        })
        .then(()=>{
            setEditting(false);
            setRefresh(!refresh);
        })
    }

    const editButtons = (
        <>
            <button>Save</button>
            <button onClick={()=>setEditting(false)}>Cancel</button>
        </>
    )

  return (
    
      <div className='page'>
        <NavBar page={"blocked"}/>
        <div className='content'>
        <h2 className='page-title'>Blocked Numbers</h2>
        <div className="page-content">

        
        <BlockedMessage/>
        <BlockedList/>
        </div>
        </div>
      </div>
  )
}

