import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";

export interface ResumeAnalysis {
  id?: string;
  userId: string;
  title: string;
  fileUrl: string;
  analysis: any; // Result from AI analysis
  createdAt: any;
}

export const uploadResumeAndSave = async (
  userId: string, 
  file: File, 
  analysisResult: any
): Promise<string> => {
  try {
    // 1. Upload file to Storage
    const storageRef = ref(storage, `resumes/${userId}/${Date.now()}_${file.name}`);
    const uploadTask = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadTask.ref);

    // 2. Save Analysis to Firestore
    const docRef = await addDoc(collection(db, "resumes"), {
      userId,
      title: file.name,
      fileUrl: downloadURL,
      analysis: analysisResult,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error saving resume analysis:", error);
    throw error;
  }
};

export const getUserResumes = async (userId: string): Promise<ResumeAnalysis[]> => {
  try {
    const q = query(collection(db, "resumes"), where("userId", "===", userId));
    const querySnapshot = await getDocs(q);
    const resumes: ResumeAnalysis[] = [];
    querySnapshot.forEach((doc) => {
      resumes.push({ id: doc.id, ...doc.data() } as ResumeAnalysis);
    });
    return resumes;
  } catch (error) {
    throw error;
  }
};
