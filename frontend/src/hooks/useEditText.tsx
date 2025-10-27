import { useEffect, useState, useContext } from 'react';
import { userSettingsBase } from '../routes';
import { useAuth } from "@clerk/clerk-react";
import { UserData } from '../types/UserData';


export default function EditTextBlock(UserDataContext: React.Context<UserData>,  textType: string){
    const userDataContext = useContext(UserDataContext);
    const [ token, setToken ] = useState<string>("");
    const [ text, setText ] = useState<string>("");
    const [ editableText, setEditableText ] = useState<string>("");
    const [ editting, setEditting ] = useState<boolean>(false);
    const { getToken } = useAuth();

    
    
    
    useEffect(()=> {
        (async()=>{

            const fetchedToken = await getToken() || "";
            setToken(fetchedToken);
            const message = userDataContext?.[textType];
            setText(message);
            setEditableText(message);
        })()

    }, [userDataContext?.[textType]])

    const saveChanges = () => {
        
        fetch(userSettingsBase + "/change-user-settings",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({changed: {[textType]: editableText, "name": userDataContext.name}})
        })
        .then(r=>r.json())
        .then(d=>{
            console.log(d);
            if (d.Changed == "Success"){
                
                setEditting(false);
                setText(editableText);
            }
            else {
                cancel();
            }

        })
    }

    const cancel = () => {
        setEditableText(text);
        setEditting(false);
    }

    const editButtons = (
        <>
            <button onClick={saveChanges}>Save</button>
            <button onClick={cancel}>Cancel</button>
        </>
    )

    
    const textLine = (
        <>
        {editting? <textarea rows={5} value={editableText} onChange={e=>setEditableText(e.target.value)} className='edit-text' name="" id=""></textarea>:text}
        </>)

    const displayedButtons = (
        <>
            {editting? editButtons:<button onClick={()=>setEditting(true)}>Edit</button>}
        </>
    )

    return { displayedButtons, textLine}


}