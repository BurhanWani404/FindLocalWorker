import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";


const EmailChangeModal = ({ isOpen, onClose, onChangeEmail, currentEmail }) => {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!newEmail) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }

    try {
      setLoading(true);
      await onChangeEmail(newEmail, password);
      setSuccess(true);
    } catch (err) {
      setErrors({ auth: err.message || "Failed to update email" });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getInputBorderClass = (field) => {
    if (errors[field]) return "border-red-500";
    if (field === "email" && newEmail && !errors.email) return "border-green-500";
    if (field === "password" && password && !errors.password) return "border-green-500";
    return "border-gray-300";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleBackdropClick}
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
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </motion.button>

            {/* Modal Header - Reduced vertical height */}
            <motion.div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {success ? "Email Changed" : "Change Email Address"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {success
                  ? "Verification sent to your new email"
                  : "Enter your new email and password"}
              </p>
            </motion.div>

            {/* Success/Error Messages */}
            <AnimatePresence>
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
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="text-center"
                >
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="h-6 w-6 text-green-600"
                    />
                  </div>
                  <p className="text-gray-600 mb-6">
                    We've sent a verification link to <strong>{newEmail}</strong>.
                    Please check your inbox and click the link to confirm your new
                    email address.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* Current Email */}
                  <div className="mb-2">
                    <p className="text-sm flex gap-x-1 text-gray-600">
                      <p className="bg-blue-400 px-1 text-white rounded"> Current Email: </p> <strong className="">{currentEmail}</strong>
                    </p>
                  </div>

                  {/* New Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </div>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => {
                          setNewEmail(e.target.value);
                          setTouched({ ...touched, email: true });
                        }}
                        onBlur={() => setTouched({ ...touched, email: true })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${getInputBorderClass(
                          "email"
                        )} ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="new@example.com"
                        disabled={loading}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FontAwesomeIcon icon={faLock} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setTouched({ ...touched, password: true });
                        }}
                        onBlur={() => setTouched({ ...touched, password: true })}
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${getInputBorderClass(
                          "password"
                        )} ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => !loading && setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        disabled={loading}
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEye : faEyeSlash}
                        />
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
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
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                      loading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin"
                        />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      "Update Email"
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmailChangeModal;