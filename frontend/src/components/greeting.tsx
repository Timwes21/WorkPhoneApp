import {UserDataContext} from '../hooks/useDataContext.tsx';
import EditTextBlock from '../hooks/useEditText.tsx';





export default function Greeting() {
    const { displayedButtons, textLine} = EditTextBlock(UserDataContext, "greeting_message")
    

    return (
    
        
        <div className="blocked-message-con" style={{width: "90%"}}>
            <h4>Greeting for your AI Assistant</h4>
            <div style={{display: "flex", justifyContent: "center"}} className="block-message">
                {textLine}
            </div>
            <div style={{display: "flex", justifyContent: "center", padding: "5px"}}>
                {displayedButtons}
            </div>
        </div>
  )
}

