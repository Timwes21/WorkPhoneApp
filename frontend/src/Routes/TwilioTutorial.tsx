import twilioImage from "../assets/twilio1.png";
import twilioImageTwo from "../assets/twilio2.png";
import twilioImageThree from "../assets/twilio3.png";
import twilioImageFour from "../assets/twilio4.png";
import twilioImageFive from "../assets/twilio5.png";
import { Link } from "react-router-dom";
import { userSettingsBase } from "../routes";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState, useContext } from "react";
import {UserDataContext} from '../hooks/UserDataContext.tsx';

export default function TwilioTutorial(){
    const userDataContext = useContext(UserDataContext);
    const { getToken } = useAuth();
    const [ webhookToken, setWebhookToken ] = useState<string>("");
    const [ url , setUrl ] = useState<string>("https://workphoneapp-production.up.railway.app/ai-assistant/incoming-call/");

    const generateToken = async() => {
        const fetchedToken = await getToken() || "";
        const fetchedWebhookToken = await fetch(userSettingsBase + '/generate-new-webhook-token', {
            headers: {"token": fetchedToken},
        });

        setWebhookToken((await fetchedWebhookToken.text()).replaceAll("\"", ""));

    }

    useEffect(()=> {
        (async()=>{
            
            userDataContext.webhook_token
            setWebhookToken(userDataContext.webhook_token);

            
        })()
    }, [userDataContext?.webhook_token])


    const copyText = () => {
        navigator.clipboard.writeText(`${url}${webhookToken}`)
    }


    return (
        <div style={{width: "80%", justifySelf: "center"}} className="page">
            <div className="twilio-instructions">
                <Link to='/' id="back-to-create-account">Back</Link>
                <h1 className="twilio-tutorial-header">1. Create an account</h1>
                <ul>
                    <li>go to <a href="twilio.com">Twilio</a></li>
                    <li>Click on <i>Start for Free</i></li>
                </ul>
                <img className="twilio-image" src={twilioImage} alt="twilio-1" />
                <ul>
                    <li>Fill out the entire form</li>
                    <li>Check the box and hit continue</li>
                </ul>
                <img className="twilio-image" src={twilioImageTwo} alt="twilio-2" />
                <h1>2. Buy a Number</h1>
                <ul>
                    <li>On the left click on <b>Phone Numbers</b>&gt;<b>Manage</b>&gt;<b>Buy a number</b></li>
                </ul>
                <img className="twilio-image" src={twilioImageThree} alt="twilio-3" />
                <ul>
                    <li>Buy a number</li>
                </ul>
                <img className="twilio-image" src={twilioImageFour} alt="" />
                <h1>3. Set up the Webhook</h1>
                <ul>
                    <li>Once the number is bought head to your active numbers and click on your number</li>
                    <li>Head to the section where a url comes in through a webhook</li>
                    <li>The Webhook url is <b> {url}&lt;token&gt;</b></li>
                    <li>Your webhook is:  <br /> 
                        <div className="webhook-url-header">
                            <button onClick={copyText}>Copy</button>
                            <button onClick={generateToken}>Generate New Token</button>
                            
                        </div>
                        <div className="webhook-url">

                            {url}{webhookToken}
                        </div>
                        </li>
                    <span>Note: The url in twilio should match what is printed here</span>

                </ul>
                <img className="twilio-image" src={twilioImageFive} alt="" />
                <Link to="/" id="back-to-create-account">Back</Link>
            </div>
        </div>
    )
}