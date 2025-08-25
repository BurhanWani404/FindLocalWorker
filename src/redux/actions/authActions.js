// authActions.js
// Use relative paths through Firebase Hosting

import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";

import {
  collection,
  deleteDoc,
  getDocs,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth } from "../../firebase";
import {
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  VERIFY_RESET_CODE_REQUEST,
  VERIFY_RESET_CODE_SUCCESS,
  VERIFY_RESET_CODE_FAILURE,
} from "../../constants/authConstants";
import {
  WORKER_LOGIN_REQUEST,
  WORKER_LOGIN_SUCCESS,
  WORKER_LOGIN_FAILURE,
} from "../../constants/authConstants";

import { doc, getDoc, setDoc, query } from "firebase/firestore";
import { db } from "../../firebase";
import {
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
} from "../../constants/authConstants";
import { httpsCallable } from "firebase/functions";
import { getFunctions } from "firebase/functions";
import { app } from "../../firebase"; // Import your initialized app
import { sendPasswordResetEmail as firebaseSendPasswordResetEmail } from "firebase/auth";

const functions = getFunctions(app); // Use the initialized app

// authActions.js
export const requestPasswordReset = (email) => async (dispatch) => {
  dispatch({ type: FORGOT_PASSWORD_REQUEST });

  try {
    // Only use Firebase's built-in reset
    await firebaseSendPasswordResetEmail(auth, email);

    dispatch({
      type: FORGOT_PASSWORD_SUCCESS,
      payload: {
        email,
        message: `Password reset link sent to ${email}. Please check your inbox.`,
      },
    });

    return { success: true };
  } catch (error) {
    const message =
      error.code === "auth/user-not-found"
        ? "No account exists with this email. Please enter the email you used to create your account."
        : "Failed to send reset instructions. Please try again.";

    dispatch({
      type: FORGOT_PASSWORD_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Verify Code + Reset Password
export const confirmPasswordReset =
  (email, code, newPassword) => async (dispatch) => {
    dispatch({ type: RESET_PASSWORD_REQUEST });

    try {
      // 1. Verify code from Firestore
      const resetRef = doc(db, "passwordResets", email);
      const snapshot = await getDoc(resetRef);

      if (!snapshot.exists()) throw new Error("No reset request found");

      const { code: storedCode, expiresAt } = snapshot.data();
      if (storedCode !== code) throw new Error("Invalid verification code");

      // 2. Check expiry with 1 minute buffer
      if (new Date() > new Date(expiresAt.toMillis() + 60000)) {
        await deleteDoc(resetRef);
        throw new Error("Reset code has expired");
      }

      // 3. Call Cloud Function
      const resetPassword = httpsCallable(functions, "resetPassword");
      await resetPassword({ email, newPassword });

      // 4. Clean up
      await deleteDoc(resetRef);

      dispatch({ type: RESET_PASSWORD_SUCCESS });
      return { success: true };
    } catch (error) {
      console.error("Reset error:", error);
      throw error; // Error will be caught in component
    }
  };

export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch({ type: "FINDER_LOGIN_REQUEST" });

    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const { uid } = userCredential.user;

    const userDoc = await getDoc(doc(db, "finders", uid));
    if (!userDoc.exists()) throw new Error("User profile not found");

    const userData = userDoc.data();

    dispatch({
      type: "FINDER_LOGIN_SUCCESS",
      payload: {
        uid, // Keep uid at top level
        userInfo: {
          uid, // Also include uid in userInfo for convenience
          ...userData,
        },
      },
    });

    return userData;
  } catch (error) {
    let errorMessage = "Login failed";
    if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "Email not found";
    }

    dispatch({
      type: "FINDER_LOGIN_FAILURE",
      payload: errorMessage,
    });
    throw error;
  }
};

export const CHANGE_PASSWORD_REQUEST = "CHANGE_PASSWORD_REQUEST";
export const CHANGE_PASSWORD_SUCCESS = "CHANGE_PASSWORD_SUCCESS";
export const CHANGE_PASSWORD_FAILURE = "CHANGE_PASSWORD_FAILURE";

export const changePasswordRequest = () => ({
  type: CHANGE_PASSWORD_REQUEST,
});

export const changePasswordSuccess = (message) => ({
  type: CHANGE_PASSWORD_SUCCESS,
  payload: message,
});

export const changePasswordFailure = (error) => ({
  type: CHANGE_PASSWORD_FAILURE,
  payload: error,
});

export const changePassword = (currentPassword, newPassword) => {
  return async (dispatch, getState) => {
    dispatch(changePasswordRequest());

    try {
      const user = auth.currentUser;

      // First verify the current password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      // Reauthenticate will throw error if password is wrong
      await reauthenticateWithCredential(user, credential);

      // If we get here, password was correct - now update
      await updatePassword(user, newPassword);

      dispatch(changePasswordSuccess("Password changed successfully!"));
      return { success: true };
    } catch (error) {
      let errorMessage = "Password change failed";

      // Handle specific Firebase errors
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log in again to change your password";
      }

      dispatch(changePasswordFailure(errorMessage));
      return { error: { message: errorMessage } };
    }
  };
};

export const signUpUser =
  (userData, profileImage, userType = "worker") =>
  async (dispatch) => {
    dispatch({ type: SIGNUP_REQUEST });

    try {
      let imageUrl = "";

      // 1. Upload image to Cloudinary if exists
      if (profileImage) {
        try {
          const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dbx6o86xj/image/upload`;

          const formData = new FormData();
          formData.append("file", profileImage);
          formData.append("upload_preset", "upload_pictures");

          const response = await fetch(cloudinaryUrl, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Image upload failed");
          }

          const data = await response.json();
          imageUrl = data.secure_url;
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          throw new Error("Failed to upload profile image. Please try again.");
        }
      }

      // 2. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const user = userCredential.user;

      // 3. Store user data in Firestore
      const userDoc = {
        uid: user.uid,
        fullName: userData.name,
        email: user.email,
        profileImage: imageUrl || "", // Ensure it's always a string
        createdAt: new Date().toISOString(),
        userType: userType || "worker", // Default to worker if not specified
      };

      await setDoc(doc(db, "finders", user.uid), userDoc);

      // 4. Automatically log in the user
      await signInWithEmailAndPassword(auth, userData.email, userData.password);

      dispatch({
        type: SIGNUP_SUCCESS,
        payload: userDoc,
      });

      return userDoc;
    } catch (error) {
      let errorMessage = error.message;

      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please use a different email.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }

      dispatch({
        type: SIGNUP_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

export const fetchUserData = (uid) => async (dispatch) => {
  try {
    dispatch({ type: "FETCH_USER_REQUEST" });

    const userDoc = await getDoc(doc(db, "finders", uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      dispatch({
        type: "FETCH_USER_SUCCESS",
        payload: {
          uid,
          fullName: userData.fullName,
          email: userData.email,
          profileImage: userData.profileImage,
          // Add any other user data you need
        },
      });
    } else {
      throw new Error("User document not found");
    }
  } catch (error) {
    dispatch({
      type: "FETCH_USER_FAILURE",
      payload: error.message,
    });
    throw error;
  }
};
// In your authActions.js
// In loginWorker action
export const loginWorker = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: WORKER_LOGIN_REQUEST });

    // Authentication logic
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { uid } = userCredential.user;

    // Get worker document
    const workerDoc = await getDoc(doc(db, "workers", uid));
    if (!workerDoc.exists()) throw new Error("Worker profile not found");

    // Get worker's feedbacks to calculate average rating
    const feedbacksRef = collection(db, "feedbacks");
    const q = query(feedbacksRef, where("workerId", "==", uid));
    const querySnapshot = await getDocs(q);

    let averageRating = 0;
    let feedbackCount = 0;

    if (!querySnapshot.empty) {
      const ratings = querySnapshot.docs
        .map((doc) => doc.data().rating)
        .filter((r) => typeof r === "number");
      feedbackCount = ratings.length;
      averageRating =
        feedbackCount > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / feedbackCount
          : 0;
    }

    const workerData = {
      uid,
      ...workerDoc.data(),
      averageRating,
      feedbackCount,
    };

    dispatch({
      type: WORKER_LOGIN_SUCCESS,
      payload: workerData,
    });

    return { success: true, user: workerData };
  } catch (error) {
    let errorMessage = "Login failed";
    if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "Email not found";
    }

    dispatch({
      type: WORKER_LOGIN_FAILURE,
      payload: errorMessage,
    });

    throw new Error(errorMessage);
  }
};
// authActions.js
export const CLEAR_WORKER_STATE = "CLEAR_WORKER_STATE";

export const clearWorkerState = () => async (dispatch) => {
  try {
    // Sign out from Firebase if user is authenticated
    if (auth.currentUser) {
      await auth.signOut();
    }

    // Clear any stored authentication data
    localStorage.removeItem("persist:root"); // If using redux-persist
    sessionStorage.removeItem("persist:root");

    // Dispatch action to clear Redux state
    dispatch({ type: CLEAR_WORKER_STATE });
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
};

// authActions.js
export const CLEAR_FINDER_STATE = "CLEAR_FINDER_STATE";

export const clearFinderState = () => async (dispatch) => {
  try {
    // Sign out from Firebase if you're using it
    if (auth.currentUser) {
      await auth.signOut();
    }

    dispatch({ type: CLEAR_FINDER_STATE });
  } catch (error) {
    console.error("Error clearing finder state:", error);
    throw error;
  }
};

// Add this new action to handle verification and password update
export const verifyAndResetPassword =
  (email, code, newPassword) => async (dispatch) => {
    dispatch({ type: VERIFY_RESET_CODE_REQUEST });

    try {
      // First verify the code
      await dispatch(confirmPasswordReset(email, code, newPassword));

      dispatch({ type: VERIFY_RESET_CODE_SUCCESS });
      return { success: true };
    } catch (error) {
      dispatch({ type: VERIFY_RESET_CODE_FAILURE, payload: error.message });
      throw error;
    }
  };

export const UPDATE_WORKER_PROFILE_REQUEST = 'UPDATE_WORKER_PROFILE_REQUEST';
export const UPDATE_WORKER_PROFILE_SUCCESS = 'UPDATE_WORKER_PROFILE_SUCCESS';
export const UPDATE_WORKER_PROFILE_FAILURE = 'UPDATE_WORKER_PROFILE_FAILURE';
export const UPDATE_WORKER_LOCAL_PROFILE = 'UPDATE_WORKER_LOCAL_PROFILE';

// authActions.js
// Import required Firebase auth functions
// import { getAuth, updateProfile } from "firebase/auth";

export const updateWorkerProfile = (workerId, updates) => async (dispatch, getState) => {
  dispatch({ type: 'UPDATE_WORKER_PROFILE_REQUEST' });
  
  try {
    if (!workerId) {
      throw new Error('Worker ID is required');
    }

    const auth = getAuth();
    const user = auth.currentUser;

    // Clean updates object
    const cleanedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (Object.keys(cleanedUpdates).length === 0) {
      throw new Error('No valid updates provided');
    }

    // Handle email update
    if (cleanedUpdates.email && user && user.email !== cleanedUpdates.email) {
      try {
        // Update email in Firebase Authentication
        await updateEmail(user, cleanedUpdates.email);
        // Optional: Send email verification
        // await sendEmailVerification(user);
      } catch (error) {
        console.error('Email update error:', error);
        // Handle specific error cases
        if (error.code === 'auth/requires-recent-login') {
          throw new Error('Please reauthenticate to update your email.');
        }
        throw new Error('Failed to update email: ' + error.message);
      }
    }

    // Handle profile photo URL update
    if (cleanedUpdates.url) {
      try {
        // Update photoURL in Firebase Authentication
        await updateProfile(user, {
          photoURL: cleanedUpdates.url
        });
      } catch (error) {
        console.error('Profile photo update error:', error);
        // Continue with Firestore update even if auth profile update fails
      }
    }

    // Update Firestore document
    const workerRef = doc(db, 'workers', workerId);
    await updateDoc(workerRef, cleanedUpdates);
    
    dispatch({
      type: 'UPDATE_WORKER_PROFILE_SUCCESS',
      payload: cleanedUpdates
    });
    
    // Dispatch an action to update the local worker state
    dispatch({
      type: 'UPDATE_WORKER_LOCAL_PROFILE',
      payload: cleanedUpdates
    });

    return true;
  } catch (error) {
    console.error('Update worker profile error:', error);
    dispatch({
      type: 'UPDATE_WORKER_PROFILE_FAILURE',
      payload: error.message
    });
    return false;
  }
};

// authActions.js

export const changeUserEmail = (newEmail, currentPassword) => async (dispatch) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Reauthenticate user
    const credential = EmailAuthProvider.credential(
      user.email, 
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update email in Firebase Auth
    await updateEmail(user, newEmail);

    // Send verification email
    await sendEmailVerification(user);

    // Update Firestore if needed
    const userRef = doc(db, "workers", user.uid);
    await updateDoc(userRef, {
      email: newEmail,
      emailVerified: false
    });

    return true;
  } catch (error) {
    let errorMessage = 'Failed to change email';
    
    switch(error.code) {
      case 'auth/requires-recent-login':
        errorMessage = 'Session expired. Please sign in again.';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already in use by another account.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
};