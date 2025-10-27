import { useEffect, useState, useContext } from 'react';
import { UserDataContext } from '../hooks/userDataContext.tsx';
import useUpdateSettings from '../hooks/useUpdateSettings.tsx';

export default function TimeZone(){
    const updateSettings = useUpdateSettings()
    const userDataContext = useContext(UserDataContext);
    const [ timeZone, setTimeZone ] = useState<string>("");
    const timeZones = [
        "America/New_York",
        "America/Chicago",   
        "America/Denver",    
        "America/Los_Angeles",
        "America/Anchorage",  
        "Pacific/Honolulu",  
    ]

    useEffect(()=>{
        setTimeZone(userDataContext?.time_zone || "");
    }, [userDataContext?.time_zone])


    const changeTimeZone = async(timeZone: string) => {
        const update = {time_zone: timeZone};
        await updateSettings(update);
        setTimeZone(timeZone);
    }

    return (
        <>
            <select value={timeZone} onChange={e=>changeTimeZone(e.target.value)} name="" id="">
                <option value="">TimeZones</option>
                {timeZones.map((item, _)=>(
                    <option value={item}>{item}</option>

                ))}
                <option value=""></option>
            </select>
        </>
    )
}