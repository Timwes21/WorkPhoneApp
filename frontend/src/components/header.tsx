import Settings from "./settings.tsx";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";



export default function Header(){
    const { isSignedIn, user } = useUser();
    console.log(isSignedIn);
    

    return (
        <header className="header">
            <h1>Work Phone</h1>
            {isSignedIn &&<>
            <Settings/>
            <Link to='/twilio-tutorial' className="create-an-account">How to Get a Twilio Number</Link>
            </> }
            <header className="clerk-signin">
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </header>
        </header>
    )
}