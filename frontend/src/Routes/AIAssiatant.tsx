import NavBar from '../components/navbar.tsx';
import Files from "../components/files.tsx";
import Logs from "../components/logs.tsx";
import Prompt from '../components/prompt.tsx';
import Greeting from '../components/greeting.tsx';




export default function Assistant() {

  return (
    
      <div className='page'>
        <NavBar page={"ai"}/>
        <div className='content'>
        <h2 className='page-title'>AI Assistant</h2>
        <div className="page-content">
            <Files/>
            <div style={{display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-around", alignItems: "center"}}>
                <Prompt/>
                <Greeting/>
            </div>
            <Logs/>
        
        </div>
        <div style={{display: "flex", justifyContent: "center"}}>Note: You can test the AI Assistant by calling your twilio number from your phone</div>
        </div>
      </div>
  )
}

