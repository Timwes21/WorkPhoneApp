import { userSettingsBase } from "../routes";
import { useAuth } from "@clerk/clerk-react";

export default function useUpdateSettings(){
    const { getToken } = useAuth();
    return async(update: object)=> {
        const fetchedToken = await getToken() || "";
        fetch(userSettingsBase + "/change-user-settings",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": fetchedToken
            },
            body: JSON.stringify({changed: update})
        })
        .then(response=>{
            if (response.status == 200){
                console.log("returning");
                
                return response.json()
            }
        })
        
    }
}