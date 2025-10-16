import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState, useRef } from "react"
import { base } from "../routes";
import { CallLog } from "../types/CallLogs";
import Log from "./log";



export default function Logs(){
    const scrollRef = useRef(null);
    const { getToken } = useAuth();
    const [ logs, setLogs ] = useState<CallLog[]>([]);
    const [ page, setPage ] = useState<number>(0);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ hasMore, setHasMore ] = useState<boolean>(false);

    
    useEffect(()=>{
        (async()=>{
            const fetchedToken = await getToken() || ""
            fetch(`${base}/ai-assistant/get-call-logs/${page}`, {
                headers: {
                    "token": fetchedToken
                }
            })
            .then(response=>response.json())
            .then(data=>{
                setHasMore(data.hasMore);
                console.log(data);
                
                
                setLogs(prev=>[...prev, ...data.CallLogList])
                setLoading(false);

            })
        })()    
    }, [page])

    // console.log(logs.length);
    

    // const el = scrollRef.current;
    
    
    
    const onscroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget
        const topOfScrollBarPos = el?.scrollTop;
        const divHeight = el?.scrollHeight;
        const scrollBarHeight = el?.clientHeight;
        const bottomOfScrollBarPos = topOfScrollBarPos + scrollBarHeight;
        
        // console.log("scrollbar", bottomOfScrollBarPos);
        // console.log("div", divHeight);
        const canLoadMoreLogs = bottomOfScrollBarPos >= divHeight -1 && !loading && hasMore;
        const loadMore = () => {
            console.log("getting more logs");
            setPage(prev=>prev+=1);
            setLoading(true);
            
        }
        
        if (canLoadMoreLogs){
            loadMore();
        }
    }

    

    console.log(logs.length);
    
    
    



    return (
        <div className="missed-calls">
            <h2 className="sub-headings">Missed Call Logs</h2>
            <hr />
            <div ref={scrollRef} onScroll={onscroll} style={{color: "black", overflowY: "auto", paddingBottom: "20px", borderBottomLeftRadius: "10px", borderBottomRightRadius: "10px"}}>

                {logs?.map((log, _)=>(
                    <Log callLog={log}/>
                ))}
            </div>
        </div>
    )
}