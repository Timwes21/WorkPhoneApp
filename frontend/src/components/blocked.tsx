import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState, useContext } from 'react';
import {UserDataContext} from '../hooks/userDataContext.tsx';
import { userSettingsBase } from "../routes";

export default function BlockedList(){
    const userDataContext = useContext(UserDataContext);
    const { getToken } = useAuth();
    const [ token, setToken ] = useState<string>("");
    const [ number, setNumber ] = useState<string>("");
    const [ pressed, setPressed ] = useState<boolean>(false);
    const [ blockedNumbers, setBlockedNumbers ] = useState<string[]>([]);

    useEffect(()=>{
        (async()=>{
            const fetchedToken = await getToken() || ""
            setToken(fetchedToken);
            const list = userDataContext.blocked_numbers;
            setBlockedNumbers(list);
        })()
    }, [userDataContext?.blocked_numbers])

    const addNumber = () => {
        if (number.length !== 10)return;
        
        setNumber(prev=>prev.replace("(", "").replace(")", "").replace("-", "").replace(" ", ""))
        fetch(userSettingsBase + "/add-blocked-number", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({"number": number})
        })
        .then(()=>{
            setBlockedNumbers(e=>[...e, number])
            setNumber("");
            setPressed(false);
        })
    }


    const removeNumber = (number: string, index: number) => () => {
        fetch(userSettingsBase + "/remove-blocked-number", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({number: number})
        })
        .then(()=>{
            setBlockedNumbers(blockedNumbers.filter(e=>e !== number));
        })

    }

    const addHandler = (
        pressed?(
                <div style={{display: "flex", justifyContent: "center"}}>
                    <input type="text" onChange={e=>setNumber(e.target.value)}/>
                    <button className="content-button" onClick={addNumber}>Save</button>
                    <button className="content-button" onClick={()=>setPressed(false)}>Cancel</button>
                </div>
            ):<button className="content-button" onClick={()=>{
                setPressed(true);
            }}>+ Add Number</button>
    )


    
    const displayBlockedNumbers = (
        <ul style={{color: "black", listStyle: "none"}}>

        {blockedNumbers.map((number, index)=>(

            <li key={number}>
                <span>{number}</span>
                <button onClick={removeNumber(number, index)} style={{float: "right", padding: "3px"}}>Delete</button>
            </li>
        ))}
        </ul>

    )
        



    return (
        <div className="blocked-list">
            {addHandler}
            {displayBlockedNumbers}
        </div>
    )
}