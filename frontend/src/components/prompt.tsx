import { UserDataContext } from '../hooks/UserDataContext.tsx';
import EditTextBlock from '../hooks/useEditText.tsx';


export default function Prompt() {
    const { displayedButtons, textLine} = EditTextBlock(UserDataContext, "ai_prompt")

    return (
    
        
        <div className="blocked-message-con" style={{width: "90%"}}>
            <h4>Prompt for AI Assistant</h4>
            <div style={{display: "flex", justifyContent: "center"}} className="block-message">
                {textLine}
            </div>
            <div style={{display: "flex", justifyContent: "center", padding: "5px"}}>
                {displayedButtons}
            </div>
        </div>
  )
}

