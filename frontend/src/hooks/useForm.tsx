import { setToken } from "../token.ts";
import { useReducer } from "react";
import { authBase } from "../routes.ts";
import { useNavigate } from "react-router-dom";

type createAccountForm = {
    username: string,
    password: string,
    name: string
    twilioNumber: string,
    realNumber: string
}

type loginForm = {
    username: string,
    password: string,
}

export default function useForm(initialState: createAccountForm | loginForm){
    
    const [state, dispatch] = useReducer(formReducer, initialState);

    function formReducer(state: createAccountForm | loginForm, action) {
        switch (action.type) {
            case 'changed_username': 
            return {
                ...state,
                username: action.nextUsername,
            };
            case 'changed_password': 
            return {
                ...state,
                password: action.nextPassword,
            }
            case "changed_name":
                return {
                    ...state,
                name: action.name,    
                }
            case 'changed_twilio_number': 
            return {
                ...state,
                twilioNumber: action.nextNumber,
            }
            case 'changed_real_number': 
            return {
                ...state,
                realNumber: action.nextEmail,
            };
            default:
                return state;
        }
    }

    const nav = useNavigate();
    const createAccount = () => {
        fetch(authBase + "/create-account", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(state)
        })
        .then(async(response)=>{
            if (response.status === 200){
                console.log("routing to home page");
                const data = await response.json()
                const {token, message} = data;
                console.log(message);
                setToken(token);
                nav("/");
            }
            

        })
        .catch(err=>console.log(err))
        
    }

    const login =() => {
        fetch(authBase+ "/login",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(state)
        })
        .then(response=>response.json())
        .then(data=>{
            const { logged_in, message, token } = data;
            console.log(message);
            if (logged_in){
                setToken(token);
                nav("/");
            }
        })
        
    }


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: string)=> {
        const next = "next" + type.replace(type[0], type[0].toUpperCase());
        
        dispatch({
            type: `changed_${type}`,
            [next]: e.target.value
        }); 
    }

    return {handleInputChange, createAccount, login, state}
}