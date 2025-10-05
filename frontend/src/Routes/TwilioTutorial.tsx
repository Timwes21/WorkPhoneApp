import twilioImage from "../assets/twilio1.png";
import twilioImageTwo from "../assets/twilio2.png";
import twilioImageThree from "../assets/twilio3.png";
import twilioImageFour from "../assets/twilio4.png";
import twilioImageFive from "../assets/twilio5.png";
import { Link } from "react-router-dom";
import { authBase } from "../routes";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export default function TwilioTutorial(){
    const { getToken } = useAuth();
    const [ webhookToken, setWebhookToken ] = useState<string>("");

    const generateToken = async() => {
        const fetchedToken = await getToken() || "";
        const fetchedWebhookToken = await fetch(authBase + '/generate-new-webhook-token', {
            headers: {"token": fetchedToken},
        });

        setWebhookToken((await fetchedWebhookToken.text()).replaceAll("\"", ""));

    }

    useEffect(()=> {
        (async()=>{
            const fetchedToken = await getToken() || "";
            const fetchedWebhookToken = await fetch(authBase + '/get-webhook-token', {
                headers: {"token": fetchedToken},
            });
            setWebhookToken((await fetchedWebhookToken.text()).replaceAll("\"", ""));

            
        })()
    }, [])


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
                    <li>Change the url to:  <br /> 
                        <b>
                            https://backend-production-8368.up.railway.app/ai-assistant/incoming-call/{webhookToken}
                        </b>
                        </li>
                    <button onClick={generateToken}>Generate New Token</button>
                </ul>
                <img className="twilio-image" src={twilioImageFive} alt="" />
                <Link to="/" id="back-to-create-account">Back</Link>
            </div>
        </div>
    )
}