import { useState } from "react"

type Logs = Record<string, Record<string, string>>
export default function Logs(){
    const [ logs, setLogs ] = useState<Logs>();

    return (
        <div className="missed-calls">
            <h2 className="sub-headings">Missed Call Logs</h2>
            <hr />
            {/* <div className="log">
                <span>7726210972</span>
                <p>this is about something that requires alot</p>
            </div>
            <div className="log">
                <span>7726210972</span>
                <p>This is also something but i think i like food</p>
            </div> */}
        </div>
    )
}