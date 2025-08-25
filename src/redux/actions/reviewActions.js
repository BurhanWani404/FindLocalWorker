// reviewActions.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const submitReview = (reviewData) => async (dispatch) => {
  try {
    dispatch({ type: "REVIEW_SUBMIT_REQUEST" });
    
    const reviewWithTimestamp = {
      ...reviewData,
      timestamp: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "feedbacks"), reviewWithTimestamp);
    
    dispatch({
      type: "REVIEW_SUBMIT_SUCCESS",
      payload: { id: docRef.id, ...reviewData }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Review submission error:", error);
    dispatch({
      type: "REVIEW_SUBMIT_FAILURE",
      payload: error.message
    });
    throw error;
  }
};