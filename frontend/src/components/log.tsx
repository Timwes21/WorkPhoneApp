import { useState, useRef } from 'react';
import { CallLog } from '../types/CallLogs';

type logProps = {callLog: CallLog}

export default function Log({callLog}: logProps){
    const now = new Date().toDateString();
    console.log(now);
    const date: string = `${callLog.date.month}${callLog.date.day}${callLog.date.year}`;
    

    
    
    const [ visible, setVisible ] = useState<boolean>(false);
    return (
        <>
            <div style={{display: "flex", justifyContent: "space-between", background: "rgba(216, 216, 216, 1)", cursor: "pointer"}} onClick={()=>setVisible(!visible)}>
                <b>{callLog.callsid}</b>
                <span>{now.includes(date) ? "Today":date}</span>
            </div>
            <hr />
            {visible && <div style={{display: "flex", flexDirection: "column"}}>
                <b style={{alignSelf: "center"}}>{callLog.date.time}</b>
                {callLog.transcript.map((line, i)=>(
                    <>
                        <b>{line.role}</b>
                        <span>{line.text}</span>
                    </>
                ))}
            </div>}
        </>
    )
}