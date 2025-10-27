import { UserDataContext } from '../hooks/useDataContext.tsx';
import EditTextBlock from '../hooks/useEditText.tsx';




export default function BlockedMessage() {
    const { displayedButtons, textLine} = EditTextBlock(UserDataContext, "blocked_message")

    return (
    
        
    <div className="blocked-message-con">
        <h4>Message to Blocked Caller</h4>
        <div style={{display: "flex", justifyContent: "center"}} className="block-message">
            {textLine}
        </div>
        <div style={{display: "flex", justifyContent: "center", padding: "5px"}}>
            {displayedButtons}
        </div>
    </div>
  )
}

