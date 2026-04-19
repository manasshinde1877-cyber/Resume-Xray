import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "./config";

export const registerUser = async (email: string, pass: string) => {
  console.log("Mock Registration for:", email);
  return { email, uid: "dev-bypass-id", displayName: "Dev User" } as any;
};

export const loginUser = async (email: string, pass: string) => {
  console.log("Mock Login for:", email);
  return { email, uid: "dev-bypass-id", displayName: "Dev User" } as any;
};

export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};
