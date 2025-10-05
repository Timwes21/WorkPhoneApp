import NavBar from '../components/navbar.tsx';
import Files from "../components/files.tsx";
import Logs from "../components/logs.tsx";




export default function Assistant() {

  return (
    
      <div className='page'>
        <NavBar page={"ai"}/>
        <div className='content'>
        <h2 className='page-title'>AI Assistant</h2>
        <div className="page-content">
            <Files/>
            <Logs/>
        
        </div>
        </div>
      </div>
  )
}

