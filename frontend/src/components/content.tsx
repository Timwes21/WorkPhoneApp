import Files from "./files.tsx"
import BlockedList from "./blocked.tsx"
import Logs from "./logs.tsx"
import { SignIn, useUser } from "@clerk/clerk-react";


export default function Content(){
    const { isSignedIn } = useUser();

    const notLoggedInDiv = (
        <div className='not-logged-in'>
        <p>Log in to access Features</p>
        </div>
    )
    return (
        <>
        <div className="page-content">
            {isSignedIn ?<>
            <Files/>
            <BlockedList/>
            <Logs/>
            </>
            : notLoggedInDiv
        }
        </div>
        </>
    )
}