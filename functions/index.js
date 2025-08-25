const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.resetPassword = functions.https.onCall(async (data, context) => {
  // Validate input
  if (!data.email || !data.newPassword) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email and new password are required"
    );
  }

  try {
    const user = await admin.auth().getUserByEmail(data.email);
    await admin.auth().updateUser(user.uid, {
      password: data.newPassword,
    });
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
