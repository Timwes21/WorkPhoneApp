import { useEffect, useState, useContext } from 'react';
import { UserDataContext } from '../hooks/userDataContext.tsx';
import { userSettingsBase } from "../routes";
import { useAuth } from "@clerk/clerk-react";


type UserSetings = {
    real_number: string,
    name: string
    twilio_number: string
}

export default function Settings(){
    const userDataContext = useContext(UserDataContext);
    const settingsSkeleton = {
        real_number: "",
        name: "",
        twilio_number: ""
    }
    const [ settings, setSettings ] = useState<UserSetings>(settingsSkeleton);
    const [ settingsCopy, setSettingsCopy ] = useState<UserSetings>(settingsSkeleton);
    const [ isEditing, setIsEditing ] = useState<boolean>(false);
    const [ triggerReload, setTriggerReload ] = useState<boolean>(false);
    
    const { getToken } = useAuth();
    const [ token, setToken ] = useState<string>("");

    useEffect(()=> {
        (async()=>{
            console.log("getting settings");
            
            const fetchedToken = await getToken() || "";
            setToken(fetchedToken);


            
            const fetchedSettings = {
                real_number: userDataContext?.real_number || "",
                name: userDataContext?.name || "",
                twilio_number: userDataContext?.twilio_number || ""
            }

            setSettings(fetchedSettings);
            setSettingsCopy(fetchedSettings);
        })()
    }, [userDataContext?.real_number, userDataContext?.name, userDataContext?.twilio_number])

    const onChangeSettings = (setting: keyof UserSetings, value: string) => {
        setSettings(prev=>({
            ...prev,
            [setting]: value
        }))
    }

    const userSettings = (
        <>
            <div className="settings-content">
                <span style={{color: settings.name == ""? "black":"white"}}>{settings?.name || "aaaaaaa"}</span>
                <span>{settings?.real_number  || "Required"}</span>
                <span>{settings?.twilio_number || "Required"}</span>
            </div>
            <button className="edit-button" onClick={()=>setIsEditing(true)}>Edit</button>
        </>
    )

    const changeSettings = () => {
        const changed = {}

        Object.entries(settings).map(([key, value])=>{
            if (value !== settingsCopy[key]){
                
                changed[key] = value;
            }
        })
        
        if (Object.keys(changed).length === 0) {
            setIsEditing(false);
            return
        };
        console.log("did not return");
        
        fetch(userSettingsBase + "/change-user-settings",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({changed: changed})
        })
        .then(response=>{
            if (response.status == 200){
                console.log("returning");
                
                return response.json()
            }
        })
        .then(()=>{
            setIsEditing(false);
            setTriggerReload(!triggerReload);
            
        })
    }

    const edittingUserSettings  = (
        <>
            <div className="settings-content">
                <input type="text" value={settings?.name} onChange={e=>onChangeSettings("name", e.target.value)}/>
                <input type="text" value={settings?.real_number} onChange={e=>onChangeSettings("real_number", e.target.value)}/>
                <input type="text" value={settings?.twilio_number} onChange={e=>onChangeSettings("twilio_number", e.target.value)}/>
            </div>
            <button className="edit-button" onClick={changeSettings}>Save</button>
            <button className="edit-button" onClick={()=>setIsEditing(false)}>Cancel</button>
        </>
    )

    return(
        <div className="settings">
            <div className="settings-label">
                <span><b>Name:</b> </span>
                <span><b>Real Number:</b> </span>
                <span><b>Twilio Number:</b> </span>
            </div>
            {isEditing ? edittingUserSettings: userSettings}
        </div>
    )
}