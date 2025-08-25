import React, { useState, useRef, useEffect } from "react";
import {
  XMarkIcon,
  UserCircleIcon,
  CameraIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, signUpUser } from "../redux/actions/authActions";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ onClose, flowType = "worker" }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false); // New state for signup loading
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    profileImage: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const { loading, error: authError } = useSelector((state) => state.auth);
  const isLoading = loading || isSigningIn || isSigningUp; // Include isSigningUp in isLoading
  const navigate = useNavigate();

  // Replace the current useEffect with this:
  useEffect(() => {
    // Define validation functions inside the effect
    const validateName = () => {
      if (!formData.name.trim()) {
        setErrors((prev) => ({ ...prev, name: "Name is required" }));
        return false;
      } else if (formData.name.trim().length < 3) {
        setErrors((prev) => ({
          ...prev,
          name: "Name must be at least 3 characters",
        }));
        return false;
      }
      setErrors((prev) => ({ ...prev, name: "" }));
      return true;
    };

    const validateEmail = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) {
        setErrors((prev) => ({ ...prev, email: "Email is required" }));
        return false;
      } else if (!emailRegex.test(formData.email)) {
        setErrors((prev) => ({ ...prev, email: "Please enter a valid email" }));
        return false;
      }
      setErrors((prev) => ({ ...prev, email: "" }));
      return true;
    };

    const validatePassword = () => {
      if (!formData.password) {
        setErrors((prev) => ({ ...prev, password: "Password is required" }));
        return false;
      } else if (formData.password.length < 6) {
        setErrors((prev) => ({
          ...prev,
          password: "Password must be at least 6 characters",
        }));
        return false;
      }
      setErrors((prev) => ({ ...prev, password: "" }));
      return true;
    };

    // Run validations
    if (touched.name) validateName();
    if (touched.email) validateEmail();
    if (touched.password) validatePassword();
  }, [formData, touched]);

  useEffect(() => {
    if (flowType === "client") {
      setIsLogin(true);
    }
  }, [flowType]);

  useEffect(() => {
    if (authError) {
      let errorMessage = authError;
      if (authError.includes("email-already-in-use")) {
        errorMessage =
          "This email is already registered. Please use a different email.";
        setErrors((prev) => ({ ...prev, email: errorMessage }));
      } else if (authError.includes("weak-password")) {
        errorMessage = "Password should be at least 6 characters";
        setErrors((prev) => ({ ...prev, password: errorMessage }));
      } else if (
        authError.includes("wrong-password") ||
        authError.includes("user-not-found")
      ) {
        errorMessage = "Invalid email or password";
        setErrors((prev) => ({ ...prev, password: errorMessage }));
      } else if (authError.includes("profileImage")) {
        errorMessage = "Profile image upload failed. Please try again.";
        setErrors((prev) => ({ ...prev, profileImage: errorMessage }));
      }
    }
  }, [authError]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "Only JPG, PNG, GIF or WEBP allowed",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "File too large (max 5MB)",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, profileImage: "" }));
    setProfileImage(URL.createObjectURL(file));
    setProfileImageFile(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateName = () => {
    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
      return false;
    } else if (formData.name.trim().length < 3) {
      setErrors((prev) => ({
        ...prev,
        name: "Name must be at least 3 characters",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, name: "" }));
    return true;
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return false;
    } else if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  const validatePassword = () => {
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return false;
    } else if (formData.password.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 6 characters",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, password: "" }));
    return true;
  };

  const validateProfileImage = () => {
    if (!isLogin && !profileImage) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "Profile image is required",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, profileImage: "" }));
    return true;
  };

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      await dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
        })
      );

      navigate(flowType === "client" ? "/search-worker" : "/home");
      onClose();
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ ...errors, password: "Invalid email or password" });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isNameValid = isLogin || validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isImageValid = isLogin || validateProfileImage();

    if (isNameValid && isEmailValid && isPasswordValid && isImageValid) {
      if (isLogin) {
        await handleLogin();
      } else {
        setIsSigningUp(true); // Set signup loading state
        try {
          await dispatch(signUpUser(formData, profileImageFile, flowType));
          setSuccessMessage(
            "Registration successful! You can now access all features."
          );
          
          // After 2 seconds, switch back to login form
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMessage("");
            setIsSigningUp(false);
          }, 2000);
        } catch (error) {
          console.error("Signup failed:", error);
          setIsSigningUp(false);
        }
      }
    }
  };

  const getInputBorderColor = (fieldName) => {
    if (errors[fieldName]) return "border-red-500";
    if (formData[fieldName] && touched[fieldName] && !errors[fieldName])
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
      >
        {/* Backdrop with blur effect */}
        <motion.div
          initial={{ backdropFilter: "blur(0px)" }}
          animate={{ backdropFilter: "blur(2px)" }}
          exit={{ backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4 z-10"
        >
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center justify-center flex-1">
              <UserIcon className="h-6 w-6 text-blue-500 mr-2" />
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-gray-800"
              >
                {isLogin ? "Sign In" : "Sign Up"}
              </motion.h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`text-gray-500 ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:text-gray-700"
              }`}
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </motion.button>
          </div>

          <div className="pt-0">
            {/* Success message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth errors */}
            <AnimatePresence>
              {authError &&
                !successMessage &&
                !authError.includes("email-already-in-use") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center"
                  >
                    <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                    {authError}
                  </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Profile Image Upload (Sign Up Only) */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center mb-4"
                  >
                    <div className="relative group">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-md flex items-center justify-center"
                      >
                        {profileImage ? (
                          <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="w-full h-full text-gray-400" />
                        )}
                      </motion.div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={triggerFileInput}
                        disabled={isLoading}
                        className={`absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full transition-all shadow-md ${
                          isLoading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-blue-700"
                        }`}
                      >
                        <CameraIcon className="h-4 w-4" />
                      </motion.button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                        disabled={isLoading}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.profileImage && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-500 text-xs mt-1 flex items-center"
                        >
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {errors.profileImage}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field (Sign Up Only) */}
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-3"
                    >
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={() =>
                            setTouched((prev) => ({ ...prev, name: true }))
                          }
                          className={`block w-full pl-10 pr-3 py-3 border ${getInputBorderColor(
                            "name"
                          )} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                            isLoading ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                          placeholder="Full Name"
                          disabled={isLoading}
                        />
                      </div>
                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-red-500 text-xs mt-1 ml-3 flex items-start"
                          >
                            <ExclamationCircleIcon className="h-3 w-3 mt-0.5 mr-1" />
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: isLogin ? 0 : 0.3 }}
                    className="mb-3"
                  >
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <EnvelopeIcon className="h-5 w-5" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, email: true }))
                        }
                        className={`block w-full pl-10 pr-3 py-3 border ${getInputBorderColor(
                          "email"
                        )} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                          isLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                        placeholder="Email Address"
                        disabled={isLoading}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-500 text-xs mt-1 ml极3 flex items-start"
                        >
                          <ExclamationCircleIcon className="h-3 w-3 mt-0.5 mr-1" />
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: isLogin ? 0.1 : 0.4 }}
                    className="mb-3"
                  >
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <LockClosedIcon className="h-极5 w-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, password: true }))
                        }
                        className={`block w-full pl-10 pr-10 py-3 border ${getInputBorderColor(
                          "password"
                        )} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                          isLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                        placeholder="Password"
                        disabled={isLoading}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
                        className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {showPassword ? (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-500 text-xs mt-1 ml-3 flex items-start"
                        >
                          <ExclamationCircleIcon className="h-3 w-极3 mt-0.5 mr-1" />
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Remember Me & Forgot Password (Login Only) */}
                  {isLogin && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        {/* Remember me checkbox can be added here if needed */}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        type="button"
                        className={`text-sm font-medium text-blue-600 ${
                          isLoading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:text-blue-500"
                        }`}
                        disabled={isLoading}
                      >
                        Forgot password?
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isLogin ? 0.3 : 0.5 }}
                  >
                    <motion.button
                      whileHover={!isLoading ? { scale: 1.02 } : {}}
                      whileTap={!isLoading ? { scale: 0.98 } : {}}
                      type="submit"
                      disabled={isLoading}
                      className={`w-full flex items-center justify-center bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md ${
                        isLoading
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:bg-blue-700"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <span>
                            {isSigningUp ? "Creating Account..." : "Processing..."}
                          </span>
                          <svg
                            className="animate-spin h-5 w-5 text-white ml-2"
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
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H极0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </>
                      ) : (
                        <span>{isLogin ? "Sign In" : "Sign Up"}</span>
                      )}
                    </motion.button>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: isLogin ? 0.4 : 0.6 }}
                  className="relative my-4"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border极-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      {isLogin ? "New here?" : "Already have an account?"}
                    </span>
                  </div>
                </motion.div>

                {/* Toggle between Sign In/Sign Up */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: isLogin ? 0.5 : 0.7 }}
                  className="text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({
                        name: "",
                        email: "",
                        password: "",
                        profileImage: "",
                      });
                      setSuccessMessage("");
                    }}
                    className={`text-blue-600 font-medium transition-colors text-sm ${
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:text-blue-800 hover:underline"
                    }`}
                    disabled={isLoading}
                  >
                    {isLogin ? "Create an account" : "Sign in to Access Workers"}
                  </motion.button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;