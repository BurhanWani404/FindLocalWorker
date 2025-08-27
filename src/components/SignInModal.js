import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faArrowLeft,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginWorker,
  requestPasswordReset,
} from "../redux/actions/authActions";
import { motion, AnimatePresence } from "framer-motion";

const SignInModal = ({ onClose = () => {}, onRegisterClick = () => {} }) => {
  const [view, setView] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { worker, passwordReset } = useSelector((state) => state.auth);

  // Validate form whenever email/password changes
  useEffect(() => {
    if (hasSubmitted || errors.email || errors.password) {
      validateForm();
    }
  }, [email, password]);

  // Clear reset success message after 10 seconds
  useEffect(() => {
    if (resetSuccessMessage) {
      const timer = setTimeout(() => {
        setResetSuccessMessage("");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [resetSuccessMessage]);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password && view === "signin") {
      newErrors.password = "Password is required";
    } else if (password.length < 6 && view === "signin") {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = () => {
    setView("forgot");
    setErrors({});
    setHasSubmitted(false);
  };

  const handleBackToSignIn = () => {
    setView("signin");
    setErrors({});
    setHasSubmitted(false);
  };

  const handleSendResetLink = async () => {
    setHasSubmitted(true);
    const isValid = validateForm();

    if (!isValid) return;

    try {
      setIsProcessing(true);
      await dispatch(requestPasswordReset(email));
      setResetSuccessMessage(
        `Password reset link sent to ${email}. Check your inbox to set a new password.`
      );
      setView("signin");
      setErrors({});
    } catch (error) {
      setErrors({ auth: error.message || "Failed to send reset link" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    const isValid = validateForm();

    if (!isValid) return;

    try {
      setIsProcessing(true);
      const result = await dispatch(loginWorker(email, password));

      if (result.success) {
        setErrors({});
        onClose();
        // Use window.location to force full page reload and ensure state is loaded
        window.location.href = "/account";
      }
    } catch (error) {
      setErrors({ auth: "Email or password is incorrect" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterNowClick = () => {
    if (isProcessing) return;
    onRegisterClick();
    onClose();
  };

  const getInputBorderClass = (field) => {
    if (errors[field]) return "border-red-500";
    if (field === "email" && email && !errors.email) return "border-green-500";
    if (field === "password" && password && !errors.password)
      return "border-green-500";
    return "border-gray-300";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={(e) =>
          e.target === e.currentTarget && !isProcessing && onClose()
        }
      >
        <motion.div
          initial={{ backdropFilter: "blur(0px)" }}
          animate={{ backdropFilter: "blur(2px)" }}
          exit={{ backdropFilter: "blur(0px)" }}
          className="fixed inset-0 bg-black bg-opacity-50"
        />

        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4 z-10"
        >
          {/* Close Button */}
          <motion.button
            whileHover={!isProcessing ? { scale: 1.1 } : {}}
            whileTap={!isProcessing ? { scale: 0.9 } : {}}
            onClick={onClose}
            disabled={isProcessing}
            className={`absolute top-4 right-4 ${
              isProcessing
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </motion.button>

          {/* Back Button */}
          {view !== "signin" && (
            <motion.button
              whileHover={!isProcessing ? { scale: 1.1 } : {}}
              whileTap={!isProcessing ? { scale: 0.9 } : {}}
              onClick={handleBackToSignIn}
              disabled={isProcessing}
              className={`absolute top-4 left-4 ${
                isProcessing
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </motion.button>
          )}

          {/* Modal Header */}
          <motion.div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {view === "signin" ? "Welcome Back" : "Reset Password"}
            </h2>
            <p className="text-gray-600 mt-1">
              {view === "signin"
                ? "Sign in to your account"
                : "Enter your email that you created account to receive a password reset link"}
            </p>
          </motion.div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {resetSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  {resetSuccessMessage}
                </div>
              </motion.div>
            )}

            {errors.auth && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                  {errors.auth}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {view === "signin" ? (
              <motion.form
                key="signin"
                initial={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Email Field */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => hasSubmitted && validateForm()}
                      className={`block w-full pl-10 pr-10 py-3 border ${getInputBorderClass(
                        "email"
                      )} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        isProcessing ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      placeholder="your@email.com"
                      disabled={isProcessing}
                    />
                  </div>
                  <AnimatePresence>
                    {(hasSubmitted || errors.email) && errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-1 text-sm text-red-600 overflow-hidden"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Field */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FontAwesomeIcon icon={faLock} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => hasSubmitted && validateForm()}
                      className={`block w-full pl-10 pr-10 py-3 border ${getInputBorderClass(
                        "password"
                      )} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        isProcessing ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      placeholder="Password"
                      disabled={isProcessing}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        !isProcessing && setShowPassword(!showPassword)
                      }
                      className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                        isProcessing
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      disabled={isProcessing}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEye : faEyeSlash}
                      />
                    </button>
                  </div>
                  <AnimatePresence>
                    {(hasSubmitted || errors.password) && errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-1 text-sm text-red-600 overflow-hidden"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <div className="text-right mt-1">
                    <motion.button
                      whileHover={!isProcessing ? { scale: 1.03 } : {}}
                      whileTap={!isProcessing ? { scale: 0.98 } : {}}
                      type="button"
                      onClick={!isProcessing ? handleForgotPassword : undefined}
                      className={`text-sm font-medium text-blue-500 ${
                        isProcessing
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:text-blue-600"
                      }`}
                      disabled={isProcessing}
                    >
                      Forgot password?
                    </motion.button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={!isProcessing ? { scale: 1.02 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                    isProcessing
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      Signing in...
                      <svg
                        className="animate-spin ml-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </motion.form>
            ) : (
              // Forgot Password View
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="space-y-4"
              >
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => hasSubmitted && validateForm()}
                      className={`block w-full pl-10 pr-10 py-3 border ${getInputBorderClass(
                        "email"
                      )} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        isProcessing ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      placeholder="your@email.com"
                      disabled={isProcessing}
                    />
                  </div>
                  <AnimatePresence>
                    {(hasSubmitted || errors.email) && errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-1 text-sm text-red-600 overflow-hidden"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={!isProcessing ? { scale: 1.02 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                  type="button"
                  onClick={handleSendResetLink}
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                    isProcessing
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      Sending...
                      <svg
                        className="animate-spin ml-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          {view === "signin" && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <motion.button
                whileHover={!isProcessing ? { scale: 1.03 } : {}}
                whileTap={!isProcessing ? { scale: 0.98 } : {}}
                onClick={!isProcessing ? handleRegisterNowClick : undefined}
                className={`text-sm font-medium text-blue-500 ${
                  isProcessing
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-blue-600"
                }`}
                disabled={isProcessing}
              >
                Register Now!
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignInModal;
