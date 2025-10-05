import { useEffect, useState } from "react"
import { authBase } from "../routes";
import { useAuth } from "@clerk/clerk-react";


type UserSetings = {
    real_number: string,
    name: string
    twilio_number: string
}

export default function Settings(){
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
            
            

            fetch(authBase + "/user-settings", {
                headers: {"token": fetchedToken},
            })
            .then(response=>{
                if (response.status === 200){
                    return response.json();
                }
            })
            .then(data=>{
                console.log(data);
                
                const {name, real_number, twilio_number} = data;
                const fetchedSettings = {
                    name: name,
                    real_number: real_number,
                    twilio_number: twilio_number
                }
                setSettings(fetchedSettings);
                setSettingsCopy(fetchedSettings);
            })
        })()
    }, [triggerReload])

    const onChangeSettings = (setting: keyof UserSetings, value: string) => {
        setSettings(prev=>({
            ...prev,
            [setting]: value
        }))
    }

    const userSettings = (
        <>
            <div className="settings-content">
                <span>{settings?.name}</span>
                <span>{settings?.real_number}</span>
                <span>{settings?.twilio_number}</span>
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
        
        if (Object.keys(changed).length === 0) return;
        
        fetch(authBase + "/change-user-settings",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({changed: changed})
        })
        .then(response=>{
            if (response.status == 200){
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
                <span><b>Number to Route To:</b> </span>
                <span><b>Twilio Number:</b> </span>
            </div>
            {isEditing ? edittingUserSettings: userSettings}
        </div>
    )
}