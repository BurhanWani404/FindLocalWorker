import React, { useEffect, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  faPhone,
  faUser,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { FaCheckCircle, FaMapMarkerAlt, FaSmile } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import data from "./data.json";
import {
  registerWorker,
  resetRegistration,
} from "../redux/actions/workerActions";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const WorkerRegistration = () => {
  const { loading, worker, success, error } = useSelector(
    (state) => state.worker
  );
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pageLoaded, setPageLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const [professions, setProfessions] = useState([]);
  const [loadingProfessions, setLoadingProfessions] = useState(true);
  // eslint-disable-next-line
  const [url, setUrl] = useState();
  // eslint-disable-next-line
  const [image, setImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previousImageUrl, setPreviousImageUrl] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showChangeButton, setShowChangeButton] = useState(false);
  const [showSelectButton, setShowSelectButton] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);
  const [errors, setErrors] = useState({});

  // Properly memoized initial form state
  const initialFormState = useMemo(
    () => ({
      name: "",
      email: "",
      profession: "",
      experience: "",
      province: "",
      district: "",
      tehsil: "",
      perDayWage: "",
      perHourWage: "",
      whatsappNumber: "",
      contactNumber: "",
      password: "",
      confirmPassword: "",
      url: "",
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormState);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const formSectionVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  // Set page loaded after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch professions
  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        setLoadingProfessions(true);
        const querySnapshot = await getDocs(collection(db, "professions"));
        const professionsList = querySnapshot.docs.map((doc) => ({
          value: doc.data().professionName,
          label: doc.data().professionName,
        }));
        setProfessions(professionsList);
      } catch (error) {
        console.error("Error fetching professions:", error);
        setProfessions([]);
      } finally {
        setLoadingProfessions(false);
      }
    };

    fetchProfessions();
  }, []);

  // Handle successful registration
  useEffect(() => {
    if (success) {
      setFormData(initialFormState);
      setProfileImage(null);
      setUrl(null);
      setPreviousImageUrl(null);
      setShowChangeButton(false);
      setShowSelectButton(true);
      setShowModal(true);
    }
  }, [success, initialFormState]);

  // Handle errors
  useEffect(() => {
    if (error) {
      if (error.includes("email") || error.includes("Email")) {
        setErrors((e) => ({
          ...e,
          email:
            "This email is already registered. Please use a different email.",
        }));

        const emailField = document.querySelector('[name="email"]');
        if (emailField) {
          emailField.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        setErrorMessage(error);
        setErrorModal(true);
      }
    }
  }, [error]);

  const handleProfessionChange = (selectedOption) => {
    setFormData({ ...formData, profession: selectedOption?.value || "" });
    if (selectedOption?.value) setErrors({ ...errors, profession: "" });
  };
  // Convert provinces to react-select format
  const getProvinceOptions = () => {
    return data.Provinces.map((province) => ({
      value: province.Province,
      label: province.Province,
    }));
  };

  // Convert districts to react-select format
  const getDistrictOptions = () => {
    return districts.map((district) => ({
      value: district.District,
      label: district.District,
    }));
  };

  // Convert tehsils to react-select format
  const getTehsilOptions = () => {
    return tehsils.map((tehsil) => ({
      value: tehsil,
      label: tehsil,
    }));
  };

  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);

  // Update the change handlers for react-select
  const handleProvinceChange = (selectedOption) => {
    const province = selectedOption?.value || "";
    setFormData({ ...formData, province, district: "", tehsil: "" });

    const selectedProvinceData = data.Provinces.find(
      (p) => p.Province === province
    );
    const allDistricts = selectedProvinceData
      ? selectedProvinceData.Divisions.flatMap((division) => division.Districts)
      : [];
    setDistricts(allDistricts);
    setTehsils([]);

    if (province) setErrors({ ...errors, province: "" });
  };

  const handleDistrictChange = (selectedOption) => {
    const district = selectedOption?.value || "";
    setFormData({ ...formData, district, tehsil: "" });

    const selectedDistrictData = districts.find((d) => d.District === district);
    setTehsils(selectedDistrictData ? selectedDistrictData.Tehsils : []);

    if (district) setErrors({ ...errors, district: "" });
  };

  const handleTehsilChange = (selectedOption) => {
    const tehsil = selectedOption?.value || "";
    setFormData({ ...formData, tehsil });
    if (tehsil) setErrors({ ...errors, tehsil: "" });
  };

  const handleIconClick = () => fileInputRef.current.click();

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show loading spinner
    setUploadingImage(true);

    // Clear any existing image error
    if (errors.profileImage) {
      setErrors({ ...errors, profileImage: "" });
    }

    try {
      // If there was a previous image, delete it first
      if (previousImageUrl) {
        const publicId = previousImageUrl.split("/").pop().split(".")[0];
        await fetch(`https://api.cloudinary.com/v1_1/dbx6o86xj/image/destroy`, {
          method: "POST",
          body: JSON.stringify({
            public_id: publicId,
            api_key: "676385959482573",
            api_secret: "M5HAh6g7QWgHX3lCp3bM8NUhW2U",
            timestamp: Math.round(new Date().getTime() / 1000),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      // Upload new image
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", "upload_pictures");
      uploadData.append("cloud_name", "dbx6o86xj");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dbx6o86xj/image/upload`,
        { method: "POST", body: uploadData }
      );

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      setPreviousImageUrl(result.secure_url);
      setUrl(result.secure_url);
      setFormData((prev) => ({ ...prev, url: result.secure_url }));

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);
      setShowChangeButton(true);
      setShowSelectButton(false);
    } catch (error) {
      console.error("Upload error:", error);
      setErrors({ ...errors, profileImage: "Failed to upload image" });
    } finally {
      setUploadingImage(false);
    }
  };

  // Update validateForm function
  // Update validateForm function to accept form data parameter
  const validateForm = (formDataToValidate = formData) => {
    const newErrors = {};
    let firstErrorField = null;

    Object.keys(formDataToValidate).forEach((key) => {
      const error = validateField(key, formDataToValidate[key]);
      if (error) {
        newErrors[key] = error;
        if (!firstErrorField) {
          firstErrorField = key;
        }
      }
    });

    // Add profile image validation
    if (!profileImage) {
      newErrors.profileImage = "Profile image is required";
      if (!firstErrorField) {
        firstErrorField = "profileImage";
      }
    }

    return { errors: newErrors, firstErrorField };
  };
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        error =
          value && value.length >= 3
            ? ""
            : `${name} must be at least 3 characters`;
        break;
      case "email":
        if (!value) {
          error = "Email is required!";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          error = emailRegex.test(value) ? "" : "Invalid email address";
        }
        break;
      case "profession":
      case "experience":
      case "province":
      case "district":
      case "tehsil":
        error = value ? "" : `${name} is required`;
        break;
      case "perDayWage":
      case "perHourWage":
        error = value ? "" : `${name} is required`;
        break;
      case "contactNumber":
        error =
          value && value.length === 10
            ? ""
            : "Contact number must be exactly 10 digits";
        break;
      case "whatsappNumber":
        error =
          value && value.length === 10
            ? ""
            : "WhatsApp number must be exactly 10 digits";
        break;
      case "password":
        error =
          value && value.length >= 6
            ? ""
            : "Password must be at least 6 characters long";
        break;
      case "confirmPassword":
        error = value === formData.password ? "" : "Passwords do not match";
        break;
      default:
        break;
    }
    return error;
  };

  const handlePhoneInput = (e) => {
    const { name, value } = e.target;

    // Remove all non-digit characters
    let numericValue = value.replace(/\D/g, "");

    // Limit to 10 digits for both fields
    numericValue = numericValue.slice(0, 10);

    // For contactNumber only: if it's empty after backspace, keep it empty
    if (
      name === "contactNumber" &&
      e.nativeEvent.inputType === "deleteContentBackward"
    ) {
      numericValue = numericValue;
    }

    setFormData({ ...formData, [name]: numericValue });

    // Validate immediately
    const error = validateField(name, numericValue);
    setErrors({ ...errors, [name]: error });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Skip custom handling for phone inputs as we have a separate handler
    if (name === "whatsappNumber" || name === "contactNumber") {
      return;
    }

    setFormData({ ...formData, [name]: value });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validate with the original form data (10 digits)
    const { errors: validationErrors, firstErrorField } = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Scroll to the first error field
      if (firstErrorField) {
        let element;

        if (firstErrorField === "profileImage") {
          element = document.querySelector(".rounded-full.border-2");
        } else if (
          firstErrorField === "profession" ||
          firstErrorField === "province" ||
          firstErrorField === "district" ||
          firstErrorField === "tehsil"
        ) {
          // For react-select fields
          element = document.querySelector(
            `.react-select-container[name="${firstErrorField}"]`
          );
        } else {
          element = document.querySelector(`[name="${firstErrorField}"]`);
        }

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Add focus for input fields
          if (element.tagName === "INPUT" || element.tagName === "SELECT") {
            element.focus();
          }
        }
      }

      return;
    }

    // Process contact number AFTER validation (add 0 prefix)
    const processedFormData = {
      ...formData,
      contactNumber: formData.contactNumber ? "0" + formData.contactNumber : "",
    };

    // console.log("Form data with image URL:", processedFormData);
    dispatch(registerWorker({ ...processedFormData }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={pageLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mt-20 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join <span className="text-blue-600">Find Local Worker</span>
          </h1>
          <p className="text-lg font-medium text-gray-700">
            Register your profile to connect with potential employers in your
            area
          </p>
        </motion.div>

        {/* Profile Picture Upload with Animation */}
        <motion.div
          variants={formSectionVariants}
          initial="hidden"
          animate={pageLoaded ? "show" : {}}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8 border border-gray-200"
        >
          <div className="flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative rounded-full border-2 ${
                errors.profileImage ? "border-red-500" : "border-blue-500"
              } w-32 h-32 flex items-center justify-center overflow-hidden mb-4 cursor-pointer`}
              onClick={handleIconClick}
            >
              {uploadingImage ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
                ></motion.div>
              ) : profileImage ? (
                <motion.img
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-blue-500 text-4xl"
                />
              )}
            </motion.div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <motion.div className="flex gap-4">
              {showSelectButton && (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                  onClick={handleIconClick}
                >
                  Select Profile Picture
                </motion.button>
              )}
              {showChangeButton && (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors shadow-sm"
                  onClick={handleIconClick}
                >
                  Change Picture
                </motion.button>
              )}
            </motion.div>
            {errors.profileImage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-red-600"
              >
                {errors.profileImage}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Registration Form with Animation */}
        <motion.div
          variants={formSectionVariants}
          initial="hidden"
          animate={pageLoaded ? "show" : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
        >
          <div className="p-6 sm:p-8">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-semibold text-gray-800 mb-6"
            >
              Worker Information
            </motion.h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={pageLoaded ? "show" : {}}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2"
              >
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-md border ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : formData.name.length >= 3
                        ? "border-green-500 focus:ring-green-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } shadow-sm focus:outline-none focus:ring-2`}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-md border ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : formData.email
                        ? "border-green-500 focus:ring-green-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } shadow-sm focus:outline-none focus:ring-2`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </motion.div>
              </motion.div>

              {/* Profession and Experience */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={pageLoaded ? "show" : {}}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2"
              >
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="profession"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Profession
                  </label>
                  <Select
                    options={professions}
                    name="profession"
                    isLoading={loadingProfessions}
                    loadingMessage={() => "Loading professions..."}
                    onChange={handleProfessionChange}
                    value={
                      professions.find(
                        (option) => option.value === formData.profession
                      ) || null
                    }
                    placeholder="Select your profession"
                    className={`react-select-container ${
                      errors.profession ? "border-red-500" : ""
                    }`}
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: "44px",
                        borderColor: errors.profession
                          ? "#ef4444"
                          : formData.profession
                          ? "#10b981"
                          : "#d1d5db",
                        "&:hover": {
                          borderColor: errors.profession
                            ? "#ef4444"
                            : "#3b82f6",
                        },
                        boxShadow: state.isFocused
                          ? errors.profession
                            ? "0 0 0 2px rgba(239, 68, 68, 0.2)"
                            : "0 0 0 2px rgba(59, 130, 246, 0.2)"
                          : "none",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected
                          ? "#2563eb"
                          : state.isFocused
                          ? "#dbeafe"
                          : "white",
                      }),
                    }}
                  />
                  {errors.profession && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.profession}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="experience"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Years of Experience
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-md border ${
                      errors.experience
                        ? "border-red-500 focus:ring-red-500"
                        : formData.experience
                        ? "border-green-500 focus:ring-green-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } shadow-sm focus:outline-none focus:ring-2`}
                  >
                    <option value="">Select your experience</option>
                    <option value="1 Year Experience">1 Year Experience</option>
                    <option value="2 Years Experience">
                      2 Years Experience
                    </option>
                    <option value="3 Years Experience">
                      3 Years Experience
                    </option>
                    <option value="4 Years Experience">
                      4 Years Experience
                    </option>
                    <option value="5 Years Experience">
                      5 Years Experience
                    </option>
                    <option value="6 Years Experience">
                      6 Years Experience
                    </option>
                    <option value="7 Years Experience">
                      7 Years Experience
                    </option>
                    <option value="8 Years Experience">
                      8 Years Experience
                    </option>
                    <option value="9 Years Experience">
                      9 Years Experience
                    </option>
                    <option value="10+ Years Experience">
                      10+ Years Experience
                    </option>
                  </select>
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.experience}
                    </p>
                  )}
                </motion.div>
              </motion.div>

              {/* Location Fields */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={pageLoaded ? "show" : {}}
                className="grid grid-cols-1 gap-6 sm:grid-cols-3"
              >
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="province"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Province
                  </label>
                  <Select
                    options={getProvinceOptions()}
                    name="province"
                    onChange={handleProvinceChange}
                    value={getProvinceOptions().find(
                      (option) => option.value === formData.province
                    )}
                    placeholder="Select province"
                    className={`react-select-container ${
                      errors.province ? "border-red-500" : ""
                    }`}
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: "44px",
                        borderColor: errors.province
                          ? "#ef4444"
                          : formData.province
                          ? "#10b981"
                          : "#d1d5db",
                        "&:hover": {
                          borderColor: errors.province ? "#ef4444" : "#3b82f6",
                        },
                        boxShadow: state.isFocused
                          ? errors.province
                            ? "0 0 0 2px rgba(239, 68, 68, 0.2)"
                            : "0 0 0 2px rgba(59, 130, 246, 0.2)"
                          : "none",
                      }),
                    }}
                  />
                  {errors.province && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.province}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    District
                  </label>
                  <Select
                    options={getDistrictOptions()}
                    name="district"
                    onChange={handleDistrictChange}
                    value={getDistrictOptions().find(
                      (option) => option.value === formData.district
                    )}
                    placeholder="Select district"
                    isDisabled={!formData.province}
                    className={`react-select-container ${
                      errors.district ? "border-red-500" : ""
                    }`}
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: "44px",
                        borderColor: errors.district
                          ? "#ef4444"
                          : formData.district
                          ? "#10b981"
                          : "#d1d5db",
                        "&:hover": {
                          borderColor: errors.district ? "#ef4444" : "#3b82f6",
                        },
                        boxShadow: state.isFocused
                          ? errors.district
                            ? "0 0 0 2px rgba(239, 68, 68, 0.2)"
                            : "0 0 0 2px rgba(59, 130, 246, 0.2)"
                          : "none",
                      }),
                    }}
                  />
                  {errors.district && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.district}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="tehsil"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tehsil
                  </label>
                  <Select
                    options={getTehsilOptions()}
                    name="tehsil"
                    onChange={handleTehsilChange}
                    value={getTehsilOptions().find(
                      (option) => option.value === formData.tehsil
                    )}
                    placeholder="Select tehsil"
                    isDisabled={!formData.district}
                    className={`react-select-container ${
                      errors.tehsil ? "border-red-500" : ""
                    }`}
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: "44px",
                        borderColor: errors.tehsil
                          ? "#ef4444"
                          : formData.tehsil
                          ? "#10b981"
                          : "#d1d5db",
                        "&:hover": {
                          borderColor: errors.tehsil ? "#ef4444" : "#3b82f6",
                        },
                        boxShadow: state.isFocused
                          ? errors.tehsil
                            ? "0 0 0 2px rgba(239, 68, 68, 0.2)"
                            : "0 0 0 2px rgba(59, 130, 246, 0.2)"
                          : "none",
                      }),
                    }}
                  />
                  {errors.tehsil && (
                    <p className="mt-1 text-sm text-red-600">{errors.tehsil}</p>
                  )}
                </motion.div>
              </motion.div>

              {/* Wage Information */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={pageLoaded ? "show" : {}}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2"
              >
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="perDayWage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Per Day Wage (PKR)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₨</span>
                    </div>
                    <input
                      type="number"
                      id="perDayWage"
                      name="perDayWage"
                      value={formData.perDayWage}
                      onChange={handleInputChange}
                      className={`block w-full pl-8 pr-12 py-2 rounded-md border ${
                        errors.perDayWage
                          ? "border-red-500 focus:ring-red-500"
                          : formData.perDayWage
                          ? "border-green-500 focus:ring-green-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      } shadow-sm focus:outline-none focus:ring-2`}
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">PKR</span>
                    </div>
                  </div>
                  {errors.perDayWage && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.perDayWage}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="perHourWage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Per Hour Wage (PKR)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₨</span>
                    </div>
                    <input
                      type="number"
                      id="perHourWage"
                      name="perHourWage"
                      value={formData.perHourWage}
                      onChange={handleInputChange}
                      className={`block w-full pl-8 pr-12 py-2 rounded-md border ${
                        errors.perHourWage
                          ? "border-red-500 focus:ring-red-500"
                          : formData.perHourWage
                          ? "border-green-500 focus:ring-green-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      } shadow-sm focus:outline-none focus:ring-2`}
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">PKR</span>
                    </div>
                  </div>
                  {errors.perHourWage && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.perHourWage}
                    </p>
                  )}
                </motion.div>
              </motion.div>

              {/* Contact Information */}
              {/* WhatsApp Number Input */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="whatsappNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  WhatsApp Number
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">+92</span>
                  </div>
                  <input
                    type="tel"
                    id="whatsappNumber"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handlePhoneInput}
                    className={`block w-full pl-12 pr-10 py-2 rounded-md border ${
                      errors.whatsappNumber
                        ? "border-red-500 focus:ring-red-500"
                        : formData.whatsappNumber.length === 10
                        ? "border-green-500 focus:ring-green-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } shadow-sm focus:outline-none focus:ring-2`}
                    placeholder="3001234567"
                    maxLength="10"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <FontAwesomeIcon
                      icon={faWhatsapp}
                      className="h-5 w-5 text-green-500"
                    />
                  </div>
                </div>
                {errors.whatsappNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.whatsappNumber}
                  </p>
                )}
              </motion.div>

              {/* Contact Number Input */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="contactNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Number
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">+92</span>
                  </div>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handlePhoneInput}
                    className={`block w-full pl-12 pr-10 py-2 rounded-md border ${
                      errors.contactNumber
                        ? "border-red-500 focus:ring-red-500"
                        : formData.contactNumber.length === 10
                        ? "border-green-500 focus:ring-green-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } shadow-sm focus:outline-none focus:ring-2`}
                    placeholder="3001234567"
                    maxLength="10"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="h-5 w-5 text-blue-500"
                    />
                  </div>
                </div>
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contactNumber}
                  </p>
                )}
              </motion.div>

              {/* Password Fields */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={pageLoaded ? "show" : {}}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2"
              >
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2 rounded-md border ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500"
                          : formData.password && formData.password.length >= 6
                          ? "border-green-500 focus:ring-green-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      } shadow-sm focus:outline-none focus:ring-2`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={togglePasswordVisibility}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEye : faEyeSlash}
                        className="h-5 w-5 text-gray-500 hover:text-gray-700"
                      />
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2 rounded-md border ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-500"
                          : formData.confirmPassword &&
                            formData.confirmPassword === formData.password
                          ? "border-green-500 focus:ring-green-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      } shadow-sm focus:outline-none focus:ring-2`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEye : faEyeSlash}
                        className="h-5 w-5 text-gray-500 hover:text-gray-700"
                      />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </motion.div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                    loading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      Creating Account...
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
                    </>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal isOpen={showModal} toggle={() => setShowModal(false)} centered>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <ModalHeader
                toggle={() => setShowModal(false)}
                className="border-b-0 pb-0"
              >
                <div className="flex items-center justify-center w-full">
                  <FaCheckCircle className="text-green-500 mr-2 text-2xl" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Registration Successful!
                  </h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="text-center">
                  <FaSmile className="mx-auto h-16 w-16 text-yellow-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    Welcome, {worker?.name}!
                  </h3>
                  <div className="mt-4 text-gray-600">
                    <p className="mb-4">
                      Your account has been successfully created. You can now
                      start connecting with potential employers in your area.
                    </p>
                    <div className="flex items-start bg-blue-50 p-4 rounded-lg">
                      <FaMapMarkerAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <p>
                        <strong className="font-semibold text-blue-700">
                          Pro Tip:
                        </strong>{" "}
                        If you move to a new location for work, remember to
                        update your profile with your new location to help
                        employers find you more easily.
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t-0 pt-0 flex justify-center">
                <Button
                  color="primary"
                  onClick={() => {
                    setShowModal(false);
                    dispatch(resetRegistration());
                    navigate("/account");
                  }}
                  className="px-6 py-2"
                >
                  See Your Account!.
                </Button>
              </ModalFooter>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {errorModal && (
          <Modal
            isOpen={errorModal}
            toggle={() => setErrorModal(false)}
            centered
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <ModalHeader
                toggle={() => setErrorModal(false)}
                className="border-b-0 pb-0"
              >
                <div className="flex items-center justify-center w-full">
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="text-red-500 mr-2 text-2xl"
                  />
                  <h3 className="text-lg font-medium text-gray-900">
                    Registration Error
                  </h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="h-6 w-6 text-red-600"
                    />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-gray-900">
                    Oops! Something went wrong
                  </h3>
                  <div className="mt-2 text-gray-600">
                    <p>{errorMessage}</p>
                    <p className="mt-2">
                      Please check the information and try again.
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t-0 pt-0 flex justify-center">
                <Button
                  color="secondary"
                  onClick={() => {
                    setErrorModal(false);
                    dispatch(resetRegistration());
                  }}
                  className="px-6 py-2"
                >
                  Try Again
                </Button>
              </ModalFooter>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkerRegistration;
