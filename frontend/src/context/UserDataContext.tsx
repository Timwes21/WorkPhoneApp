import { useState, createContext} from "react";
import { UserData, dataSkeleton } from "../types/UserData";


export const UserDataContext = createContext<UserData>(dataSkeleton);

