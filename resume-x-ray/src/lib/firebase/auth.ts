import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider
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

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const loginWithApple = async () => {
  try {
    const provider = new OAuthProvider('apple.com');
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw error;
  }
};
