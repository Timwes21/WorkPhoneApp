import { verifyWebhook } from '@clerk/express/webhooks';
import express from 'express';
// import ngrok from "@ngrok/ngrok"
import dotenv from "dotenv";
import { MongoClient } from 'mongodb';


dotenv.config()
const env = (e) => process.env[e];
const client = new MongoClient(env("MONGO_URL"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = client.db("WorkPhone");
const callLogsCollection = db.collection("call_logs");
const documentCollection = db.collection("docs");
const userInfoCollection = db.collection("user_info");


// ngrok.authtoken(process.env.NGROK_TOKEN);

const app = express();

app.post('/api/webhooks/user-created', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const evt = await verifyWebhook(req);
    
    
    const { id, first_name, last_name } = evt.data;

    callLogsCollection.insertOne({clerk_sub: id});
    documentCollection.insertOne({clerk_sub: id});
    userInfoCollection.insertOne({clerk_sub: id, 
                                  name: `${first_name?`${first_name}${last_name? " " + last_name: ""}`: ""}`, 
                                  real_number: "",
                                  twilio_number: "",
                                  plan: "free",
                                  blocked_numbers: [], 
                                  blocked_message: "You have been restricted from contacting this number",
                                  greeting_message: message = `Hello! I'm sorry ${first_name? first_name: "your party"} didn't pick up, I can answer any questions you may have.`,
                                  ai_prompt: "You are an ai assistant that answers the phone when the user does not pick up. You are to get their name and number, as this conversation will be logged and looked at later to call them back"});

    return res.send('Webhook received');
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).send('Error verifying webhook');
  }
})

app.post('/api/webhooks/user-deleted', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const evt = await verifyWebhook(req);
    
    
    const { id } = evt.data;

    callLogsCollection.deleteOne({clerk_sub: id});
    documentCollection.deleteOne({clerk_sub: id});
    userInfoCollection.deleteOne({clerk_sub: id});

    return res.send('Webhook received');
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).send('Error verifying webhook');
  }
})


app.post('/api/webhooks/subscription-created', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const evt = await verifyWebhook(req);
    const { id } = evt.data;

    userInfoCollection.updateOne({clerk_sub: id}, {$set: {plan: "paid"}});

    return res.send('Webhook received');
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).send('Error verifying webhook');
  }
})
const PORT = 1234;
app.listen(PORT, async() =>{
    console.log("Comic Log Server running on port 3000");
    // const url = await ngrok.connect(PORT);
    // console.log(url.url());
    


})