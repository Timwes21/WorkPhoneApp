import { useState } from "react"
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";


export default function NavBar({page}){
    const { has } = useAuth();
    const hasPlan = has?.({ plan: "paid_tier"});

    const aiLink = <Link to={"/ai"} className={`menu-item ${page == "ai" && "open"}`}>AI Assitant</Link>
    const fadedAiLink = <li className="menu-item faded">AI Assistant</li>
    
    return (
            <ul className="menu">
                <Link to={"/blocked"} className={`menu-item ${page == "blocked" && "open"}`}>Blocked Numbers</Link>
                <br />
                {/* {hasPlan? aiLink: fadedAiLink} */}
                {aiLink}

            </ul>
    )
}