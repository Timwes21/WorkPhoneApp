import { useState, useEffect } from "react"
import { fileBase } from "../routes.ts";
import { useAuth } from "@clerk/clerk-react";


export default function Files(){
    const [ fileNames, setFileNames ] = useState<string[]>([]);
    const [ fileAdded, setFileAdded ] = useState<boolean>(false);
    const [ fileExists, setFileExists ] = useState<boolean>(false);
    const { has } = useAuth();
    // const hasPlan = has?.({ plan: "paid_tier"});
    // console.log(hasPlan);
    const { getToken } = useAuth();
    const [ token, setToken ] = useState<string>("");

    

    const deleteFile =(fileName: string) => {
        console.log("deleting ", fileName);
        
        fetch(fileBase+"/delete-file", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({filename: fileName})
        })
        .then(response=>response.json())
        .then(data=>{
            console.log(data);
            
            if (data.file_exists){
                setFileExists(true);
                return;
            }
            setFileExists(false);
            setFileAdded(!fileAdded)
            
        })
    }

    useEffect(()=> {
        (async()=> {
            const fetchedToken = await getToken() || "";
            setToken(fetchedToken);
            fetch(fileBase + "/get-files", {
            headers: {
                "Content-Type": "application/json",
                "token": fetchedToken
            },
        })
        .then(response => response.json())
        .then(data=>{
            console.log(data);
            data.files && setFileNames(data.files)
        })
        })();
    }, [fileAdded])

    const showFiles = () => {
        if (fileNames.length < 1) 
            return <p className="no-file-message">Add Files for your call assistant to reference if the caller has questions</p> 
        
        return (
            <div className="file-names">
            {fileNames.map((value, i)=>(
                <div key={`value${i}`} className="file-name-con">
                    <span style={{color: "black"}} className="file-name">{value}</span>
                    <button onClick={()=>deleteFile(value)} id="remove-file">Remove</button>
                </div>
            ))}
        </div>
        )
    }


    const filesContent = (
        <>
            <h2 className="sub-headings">Files</h2>
            {fileExists && <>File already exists</>}
            <hr />
                <label id="choose-file-label" htmlFor="choose-file">+Add File</label>
                <input id="choose-file" type="file" onChange={e=>{
                    let currentFile = e.target.files?.[0]
                    if (currentFile){
                        if (currentFile.name in fileNames){
                            return 
                        }
                        const formData = new FormData();
                        formData.append("file", currentFile);
                        formData.append("token", token);
                        
                        fetch(fileBase + "/save-files", {
                            method: "POST",
                            headers: {
                                "token": token
                            },
                            body: formData
                        })
                        .then(()=>setFileAdded(!fileAdded))
                        .catch(err=>console.log("Something went wrong", err))
                    }
                }}/>
                {showFiles()}
                </>

    )
        
    
    
    return(
        <div className="files">
            {filesContent}
        </div>
    )
}