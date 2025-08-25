import { useState } from "react";
import {
  requestPasswordReset,
  confirmPasswordReset,
} from "../services/authService";

const PasswordResetFlow = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1=email, 2=code, 3=success
  const [errors, setErrors] = useState({});

  const handleSendCode = async () => {
    try {
      await dispatch(requestPasswordReset(email));
      alert("Check console for verification code (DEV MODE)");
      setStep(2);
    } catch (error) {
      setErrors({ auth: error.message });
    }
  };

  const handleResetPassword = async () => {
    try {
      await dispatch(confirmPasswordReset(email, code, newPassword));
      setStep(3); // Show success
    } catch (error) {
      setErrors({ auth: error.message });
    }
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button onClick={handleSendCode}>Send Reset Code</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
          />
          <button onClick={handleResetPassword}>Reset Password</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Password reset successful!</h2>
          <p>You can now login with your new password.</p>
        </div>
      )}
    </div>
  );
};
