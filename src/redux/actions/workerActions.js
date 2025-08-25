import { collection, doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

// ✅ Helper function to format WhatsApp number
const formatWhatsappNumber = (number) => {
  const cleanNumber = number.replace(/[\s-]/g, ""); // Remove spaces or dashes
  if (cleanNumber.startsWith("0")) {
    return "+92" + cleanNumber.slice(1);
  }
  if (cleanNumber.startsWith("+92")) {
    return cleanNumber;
  }
  return "+92" + cleanNumber;
};

// ✅ Register Worker Action
export const registerWorker = (workerData) => async (dispatch) => {
  dispatch({ type: "WORKER_REGISTER_REQUEST" }); // Start loader

  try {
    // 1. Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      workerData.email,
      workerData.password
    );
    const user = userCredential.user;

    // 2. Format WhatsApp number
    const formattedWhatsapp = formatWhatsappNumber(workerData.whatsappNumber);

    // 3. Prepare final worker info with formatted number
    const workerInfo = {
      ...workerData,
      whatsappNumber: formattedWhatsapp,
    };

    // 4. Save worker info to Firestore
    await setDoc(doc(collection(db, "workers"), user.uid), workerInfo);

    // 5. Dispatch success
    dispatch({
      type: "WORKER_REGISTER_SUCCESS",
      payload: { id: user.uid, name: workerData.name },
    });
  } catch (error) {
    console.error("Error registering worker:", error);
    let errorMessage = error.message;

    // Handle specific email already exists error
    if (error.code === "auth/email-already-in-use") {
      errorMessage = `Email ${workerData.email} is already registered. Please use a different email.`;
    }

    dispatch({
      type: "WORKER_REGISTER_FAIL",
      payload: errorMessage,
    });
  }
};

// ✅ Reset Action
export const resetRegistration = () => ({
  type: "RESET_REGISTRATION",
});
