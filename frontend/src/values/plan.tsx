import { authBase } from "../routes";
import { useAuth } from "@clerk/clerk-react";

const { has } = useAuth();

const plan = () => has?.({ plan: "paid_tier"});
// const token = () => 