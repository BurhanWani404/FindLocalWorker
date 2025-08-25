import {
  FEEDBACK_SUBMIT_REQUEST,
  FEEDBACK_SUBMIT_SUCCESS,
  FEEDBACK_SUBMIT_FAIL,
  FETCH_FEEDBACKS_REQUEST,
  FETCH_FEEDBACKS_SUCCESS,
  FETCH_FEEDBACKS_FAIL,
} from "../../constants/feedbackConstants";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

export const submitFeedback = (feedbackData) => async (dispatch) => {
  try {
    dispatch({ type: FEEDBACK_SUBMIT_REQUEST });

    const docRef = await addDoc(collection(db, "feedbacks"), {
      ...feedbackData,
      createdAt: serverTimestamp(),
    });

    dispatch({
      type: FEEDBACK_SUBMIT_SUCCESS,
      payload: {
        id: docRef.id,
        ...feedbackData,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    dispatch({
      type: FEEDBACK_SUBMIT_FAIL,
      payload: error.message || "Failed to submit feedback",
    });
  }
};

export const fetchWorkerFeedbacks = (workerId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_FEEDBACKS_REQUEST });

    const commentsRef = collection(db, "feedbacks");
    const q = query(commentsRef, where("workerId", "==", workerId));
    const querySnapshot = await getDocs(q);

    const feedbacks = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt:
          doc.data().createdAt?.toDate()?.toISOString() ||
          new Date().toISOString(),
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    dispatch({
      type: FETCH_FEEDBACKS_SUCCESS,
      payload: feedbacks || [], // Ensure we always return an array
    });
    
    return { payload: feedbacks || [] }; // Return the payload for component usage
  } catch (error) {
    dispatch({
      type: FETCH_FEEDBACKS_FAIL,
      payload: error.message || "Failed to fetch feedbacks",
    });
    throw error; // Re-throw the error for component error handling
  }
};
