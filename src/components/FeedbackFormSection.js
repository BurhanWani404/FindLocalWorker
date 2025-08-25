import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSpinner,
  faCheckCircle,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import emailjs from "emailjs-com";

// Add this component just before your footer section
const FeedbackFormSection = () => {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
    type: "suggestion", // 'suggestion' or 'complaint'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.message) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      // Using EmailJS to send the email
      await emailjs.send(
        "YOUR_EMAILJS_SERVICE_ID", // Replace with your EmailJS service ID
        "YOUR_EMAILJS_TEMPLATE_ID", // Replace with your EmailJS template ID
        {
          to_email: "dinburhanud197@gmail.com",
          from_email: formData.email,
          message: formData.message,
          type: formData.type === "suggestion" ? "Suggestion" : "Complaint",
        },
        "YOUR_EMAILJS_USER_ID" // Replace with your EmailJS user ID
      );

      setIsSuccess(true);
      setFormData({ email: "", message: "", type: "suggestion" });
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <section className="pt-12 pb-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isSuccess ? "Thank You!" : "Send Us Your Feedback"}
          </h3>

          {isSuccess ? (
            <div className="text-center py-4">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-500 text-5xl mb-4"
              />
              <p className="text-gray-700">
                Your feedback has been sent successfully!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Your Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-gray-400"
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Feedback Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="suggestion"
                      checked={formData.type === "suggestion"}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2">Suggestion</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="complaint"
                      checked={formData.type === "complaint"}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2">Complaint</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Your Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.message
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                  placeholder={`Enter your ${formData.type} here...`}
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="animate-spin mr-2"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeedbackFormSection;
