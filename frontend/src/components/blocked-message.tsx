import { useEffect, useState, useContext } from 'react';
import {UserDataContext} from '../context/UserDataContext.tsx';
import { userSettingsBase } from '../routes.ts';
import { useAuth } from "@clerk/clerk-react";





export default function BlockedMessage() {
    const userDataContext = useContext(UserDataContext);
    const [ token, setToken ] = useState<string>("");
    const [ blockedMessage, setBlockedMessage ] = useState<string>("");
    const [ editableBlockedMessage, setEditableBlockedMessage ] = useState<string>("");
    const [ editting, setEditting ] = useState<boolean>(false);
    const { getToken } = useAuth();

    
    
    
    useEffect(()=> {
        (async()=>{

            const fetchedToken = await getToken() || "";
            setToken(fetchedToken);
            const message = userDataContext.blocked_message;
            setBlockedMessage(message);
            setEditableBlockedMessage(message);
        })()

    }, [userDataContext.blocked_message])

    const saveChanges = () => {
        
        fetch(userSettingsBase + "/change-user-settings",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({changed: {"blocked_message": editableBlockedMessage}})
        })
        .then(r=>r.json())
        .then(d=>{
            console.log(d);
            if (d.Changed == "Success"){
                
                setEditting(false);
                setBlockedMessage(editableBlockedMessage);
            }
            else {
                cancel();
            }

        })
    }

    const cancel = () => {
        setEditableBlockedMessage(blockedMessage);
        setEditting(false);
    }

    const editButtons = (
        <>
            <button onClick={saveChanges}>Save</button>
            <button onClick={cancel}>Cancel</button>
        </>
    )

    

  return (
    
        
    <div className="blocked-message-con">
        <h4>Message to Blocked Caller</h4>
        <div style={{display: "flex", justifyContent: "center"}} className="block-message">
            {editting? <textarea value={editableBlockedMessage} onChange={e=>setEditableBlockedMessage(e.target.value)} style={{width: "80%" }} name="" id=""></textarea>:blockedMessage}
        </div>
        <div style={{display: "flex", justifyContent: "center", padding: "5px"}}>
            {editting? editButtons:<button onClick={()=>setEditting(true)}>Edit</button>}
        </div>
    </div>
  )
}

