import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";


export default function NavBar({page}){
    const { has, isSignedIn } = useAuth();

    const fadedStyle = {listStyle: "none", color: "rgba(173, 173, 173, 1)"};
    
    
    const hasPlan = has?.({ plan: "paid_tier"});
    
    const aiLink = <Link to={"/ai"} className={`menu-item ${page == "ai" && "open"}`}>AI Assitant</Link>
    const fadedAiLink = <li style={fadedStyle}>AI Assistant</li>


    const signedInMenu = (
            <>
                <Link to={"/blocked"} className={`menu-item ${page == "blocked" && "open"}`}>Blocked Numbers</Link>
                <br />
                {hasPlan? aiLink: fadedAiLink}
            </>
    )

    const signedOutMenu = (
        <>
        <li style={fadedStyle}>Blocked Numbers</li>
        {fadedAiLink}
        </>
    )
    
    return (
            <ul className="menu">
                {isSignedIn? signedInMenu: signedOutMenu}

            </ul>
    )
}