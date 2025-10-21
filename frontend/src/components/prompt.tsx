import { useEffect, useState, useContext } from 'react';
import {UserDataContext} from '../context/UserDataContext.tsx';
import { userSettingsBase } from '../routes.ts';
import { useAuth } from "@clerk/clerk-react";


export default function Prompt() {
    const userDataContext = useContext(UserDataContext);
    const [ token, setToken ] = useState<string>("");
    const [ prompt, setPrompt ] = useState<string>("");
    const [ editablePrompt, setEditablePrompt ] = useState<string>("");
    const [ editting, setEditting ] = useState<boolean>(false);
    const { getToken } = useAuth();
    
    useEffect(()=> {
        (async()=>{
            const fetchedToken = await getToken() || "";
            setToken(fetchedToken);
            const p = userDataContext.ai_prompt;
            
            setPrompt(p);
            setEditablePrompt(p);
        })()

    }, [userDataContext.ai_prompt])

    const saveChanges = () => {
        
        fetch(userSettingsBase + "/change-user-settings",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({changed: {"ai_prompt": editablePrompt}})
        })
        .then(r=>r.json())
        .then(d=>{
            console.log(d);
            if (d.Changed == "Success"){    
                setEditting(false);
                userDataContext.ai_prompt = editablePrompt;
                setPrompt(editablePrompt);
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
        <h4>Prompt for AI Assistant</h4>
        <div style={{display: "flex", justifyContent: "center"}} className="block-message">
            {editting? <textarea rows={5} value={editablePrompt} onChange={e=>setEditablePrompt(e.target.value)} className='edit-text' name="" id=""></textarea>:prompt}
        </div>
        <div style={{display: "flex", justifyContent: "center", padding: "5px"}}>
            {editting? editButtons:<button onClick={()=>setEditting(true)}>Edit</button>}
        </div>
    </div>
  )
}

