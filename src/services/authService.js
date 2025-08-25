import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export const requestPasswordReset = (email) => async (dispatch) => {
  dispatch({ type: FORGOT_PASSWORD_REQUEST });

  try {
    // Import these at top of file:
    // import { getFunctions, httpsCallable } from "firebase/functions";
    // import { app } from "../../firebase";

    const functions = getFunctions(app);
    const sendCode = httpsCallable(functions, "sendPasswordResetCode");

    const result = await sendCode({ email });
    console.log("Cloud Function result:", result); // Add this

    dispatch({
      type: FORGOT_PASSWORD_SUCCESS,
      payload: { email },
    });

    return result.data;
  } catch (error) {
    console.error("Full error details:", error); // Add this
    const errorMessage =
      error.details || error.message || "Failed to send reset code";
    dispatch({
      type: FORGOT_PASSWORD_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

export const confirmPasswordReset = (email, code, newPassword) => {
  const verifyCode = httpsCallable(
    functions,
    "verifyResetCodeAndUpdatePassword"
  );
  return verifyCode({ email, code, newPassword });
};
