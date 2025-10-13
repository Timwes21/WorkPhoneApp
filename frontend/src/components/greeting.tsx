import { useEffect, useState } from 'react';
import { userSettingsBase } from '../routes.ts';
import { useAuth } from "@clerk/clerk-react";





export default function Greeting() {
    const [ token, setToken ] = useState<string>("");
    const [ prompt, setPrompt ] = useState<string>("");
    const [ editableGreeting, setEditableGreeting ] = useState<string>("");
    const [ editting, setEditting ] = useState<boolean>(false);
    const [ refresh, setRefresh ] = useState<boolean>(false);
    const { getToken } = useAuth();
    
    useEffect(()=> {
        (async()=>{
            const fetchedToken = await getToken() || "";
            setToken(fetchedToken);
            const res = await fetch(userSettingsBase + "/get-greeting", {
                headers : {
                    "token": fetchedToken
                }
            })
            const fetchedGreeting = (await res.text()).replaceAll("\"", "");
            
            setPrompt(fetchedGreeting);
            setEditableGreeting(fetchedGreeting);
        })()

    }, [refresh])

    const saveChanges = () => {
        
        fetch(userSettingsBase + "/change-user-settings",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({changed: {"greeting_message": editableGreeting}})
        })
        .then(r=>r.json())
        .then(d=>{
            console.log(d);
            if (d.Changed == "Success"){
                
                setEditting(false);
                setRefresh(!refresh);
                setPrompt(editableGreeting);
            }
            else {
                cancel();
            }

        })
    }

    const cancel = () => {
        setPrompt(prompt);
        setEditting(false);
    }

    const editButtons = (
        <>
            <button onClick={saveChanges}>Save</button>
            <button onClick={cancel}>Cancel</button>
        </>
    )

    

  return (
    
        
    <div className="blocked-message-con" style={{width: "90%"}}>
        <h4>Greeting for your AI Assistant</h4>
        <div style={{display: "flex", justifyContent: "center"}} className="block-message">
            {editting? <textarea rows={5} value={editableGreeting} onChange={e=>setEditableGreeting(e.target.value)} className='edit-text' name="" id=""></textarea>:prompt}
        </div>
        <div style={{display: "flex", justifyContent: "center", padding: "5px"}}>
            {editting? editButtons:<button onClick={()=>setEditting(true)}>Edit</button>}
        </div>
    </div>
  )
}

