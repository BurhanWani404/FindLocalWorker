import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getWhatsAppLink } from "../utils/phoneUtils";
import { db } from "../firebase";

import Select from "react-select";
import data from "./data.json";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ahmadimg from "../assests/images/ahmad.jpg";
import PropTypes from "prop-types";
import {
  faCheck,
  faComment,
  faCopy,
  faLocationDot,
  faPhone,
  faSpinner,
  faStar,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarEmpty } from "@fortawesome/free-regular-svg-icons";
import { updateWorkerProfile } from "../redux/actions/authActions";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Modal from "react-modal";

import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { fetchWorkerFeedbacks } from "../redux/actions/feedbackActions";

const PasswordChangeForm = ({ passwordChangeSuccess, dispatch, onCancel }) => {
  // eslint-disable-next-line
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  // eslint-disable-next-line
  const [newPasswordError, setNewPasswordError] = useState("");
  // eslint-disable-next-line
  const [passwordMatchError, setPasswordMatchError] = useState("");
  // eslint-disable-next-line
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  // eslint-disable-next-line
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setShowSuccessModal(false);
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setNewPasswordError("");
    setPasswordMatchError("");
    setCurrentPasswordError("");
  }, []);

  useEffect(() => {
    if (passwordChangeSuccess) {
      setShowSuccessModal(true);
      const newTimer = setTimeout(() => {
        setShowSuccessModal(false);
        onCancel();
      }, 4000);

      return () => {
        if (newTimer) {
          clearTimeout(newTimer);
        }
      };
    }
  }, [passwordChangeSuccess, onCancel]);
};

function SignInToAccount() {
  const dispatch = useDispatch();

  const { worker, updateProfile } = useSelector((state) => ({
    worker: state.auth.worker,
    updateProfile: state.auth.updateProfile,
  }));

  const userInfo = useMemo(() => worker?.userInfo || {}, [worker?.userInfo]);
  const [initialData, setInitialData] = useState({ ...userInfo });
  useEffect(() => {
    if (worker?.userInfo) {
      setInitialData({ ...worker.userInfo });
      setEditedData({ ...worker.userInfo });
    }
  }, [worker?.userInfo]);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [feedbacksError, setFeedbacksError] = useState(null);

  // State for tracking changes
  const [hasChanges, setHasChanges] = useState(false);
  const [changedFields, setChangedFields] = useState({});

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Inside your component, add this useEffect to fetch ratings if they're missing
  useEffect(() => {
    const fetchRatings = async () => {
      if (
        worker?.uid &&
        (!worker.userInfo?.averageRating || !worker.userInfo?.feedbackCount)
      ) {
        try {
          const feedbacksRef = collection(db, "feedbacks");
          const q = query(feedbacksRef, where("workerId", "==", worker.uid));
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
                ? ratings.reduce((sum, rating) => sum + rating, 0) /
                  feedbackCount
                : 0;
          }

          // Update the worker document with the calculated ratings
          const workerRef = doc(db, "workers", worker.uid);
          await updateDoc(workerRef, {
            averageRating,
            feedbackCount,
          });

          // Dispatch to update Redux state
          dispatch({
            type: "UPDATE_WORKER_RATINGS",
            payload: {
              averageRating,
              feedbackCount,
            },
          });
        } catch (error) {
          console.error("Error fetching ratings:", error);
        }
      }
    };

    fetchRatings();
  }, [
    worker?.uid,
    worker?.userInfo?.averageRating,
    worker?.userInfo?.feedbackCount,
    dispatch,
  ]);

  // Modal styles (same as in SearchWorker.js)
  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "600px",
      maxWidth: "90%",
      maxHeight: "80vh",
      overflow: "auto",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(3px)",
      zIndex: 1000,
    },
  };

  // Add this near other useEffect hooks
  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  const openViewComments = () => {
    setModalIsOpen(true);
    fetchWorkerReviews();
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const fetchWorkerReviews = async () => {
    setFeedbacksLoading(true);
    setFeedbacksError(null);
    try {
      const result = await dispatch(fetchWorkerFeedbacks(worker.uid));
      // Check if result.payload exists and is an array
      if (result?.payload && Array.isArray(result.payload)) {
        setFeedbacks(result.payload);
      } else {
        setFeedbacks([]); // Set to empty array if no valid data
        setFeedbacksError("No reviews found");
      }
    } catch (error) {
      setFeedbacks([]);
      setFeedbacksError(error.message || "Failed to fetch feedbacks");
    } finally {
      setFeedbacksLoading(false);
    }
  };

  const { changingPassword, passwordChangeError, passwordChangeSuccess } =
    useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    ...userInfo,
    contactNumber: userInfo.contactNumber || "",
    whatsappNumber: userInfo.whatsappNumber || "+92",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  // eslint-disable-next-line
  const [currentPassword, setCurrentPassword] = useState("");
  // eslint-disable-next-line
  const [newPassword, setNewPassword] = useState("");
  // eslint-disable-next-line
  const [confirmPassword, setConfirmPassword] = useState("");
  // eslint-disable-next-line
  const [passwordError, setPasswordError] = useState("");

  const [professions, setProfessions] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [allTehsils, setAllTehsils] = useState([]);
  const [showLocationReminder, setShowLocationReminder] = useState(false);
  const [contactError, setContactError] = useState("");
  const [whatsappError, setWhatsappError] = useState("");

  const fileInputRef = useRef(null);

  const [copiedPhone, setCopiedPhone] = useState(null);

  const copyPhoneNumber = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 3000);
  };

  // Add this useEffect to track changes
  useEffect(() => {
    const changes = {};
    let hasAnyChanges = false;

    Object.keys(editedData).forEach((key) => {
      const editedValue = editedData[key] || "";
      const initialValue = initialData[key] || "";

      if (JSON.stringify(editedValue) !== JSON.stringify(initialValue)) {
        changes[key] = true;
        hasAnyChanges = true;
      }
    });

    setChangedFields(changes);
    setHasChanges(hasAnyChanges);
  }, [editedData, initialData]);

  const StarRating = ({ rating, loading = false }) => {
    if (loading) {
      return (
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <FontAwesomeIcon
              key={`loading-${i}`}
              icon={faStarEmpty}
              className="text-gray-300"
            />
          ))}
        </div>
      );
    }

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FontAwesomeIcon
            key={`full-${i}`}
            icon={faStar}
            className="text-yellow-400"
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FontAwesomeIcon
            key={`half-${i}`}
            icon={faStarHalfAlt}
            className="text-yellow-400"
          />
        );
      } else {
        stars.push(
          <FontAwesomeIcon
            key={`empty-${i}`}
            icon={faStarEmpty}
            className="text-yellow-400"
          />
        );
      }
    }

    return <div className="flex">{stars}</div>;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  const experienceOptions = [
    { value: "1 Year Experience", label: "سال کا تجربه 1   Year Experience" },
    { value: "2 Years Experience", label: "سال کا تجربه 2  Years Experience" },
    { value: "3 Years Experience", label: "سال کا تجربه 3  Years Experience" },
    { value: "4 Years Experience", label: "سال کا تجربه 4  Years Experience" },
    { value: "5 Years Experience", label: "سال کا تجربه 5  Years Experience" },
    { value: "6 Years Experience", label: "سال کا تجربه 6  Years Experience" },
    { value: "7 Years Experience", label: "سال کا تجربه 7  Years Experience" },
    { value: "8 Years Experience", label: "سال کا تجربه 8  Years Experience" },
    { value: "9 Years Experience", label: "سال کا تجربه 9  Years Experience" },
    {
      value: "10+ Years Experience",
      label: "سال کا تجربه 10+ - 10+ Years Experience",
    },
  ];

  // Custom styles for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      height: "40px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      borderWidth: "1px",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      marginTop: 0,
      marginBottom: "10px",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  // Fetch professions when component mounts
  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "professions"));
        const professionsList = querySnapshot.docs.map((doc) => ({
          value: doc.data().professionName,
          label: doc.data().professionName,
        }));
        setProfessions(professionsList);
      } catch (error) {
        console.error("Error fetching professions:", error);
      }
    };

    fetchProfessions();
  }, []);

  // Initialize all districts and tehsils based on user's current location
  useEffect(() => {
    if (userInfo?.province) {
      const provinceData = data.Provinces.find(
        (p) => p.Province === userInfo.province
      );
      if (provinceData) {
        const districtsForProvince = provinceData.Divisions.flatMap(
          (div) => div.Districts
        );
        setAllDistricts(districtsForProvince);

        if (userInfo.district) {
          const districtData = districtsForProvince.find(
            (d) => d.District === userInfo.district
          );
          if (districtData) {
            setAllTehsils(districtData.Tehsils);
          }
        }
      }
    }
  }, [userInfo]);
  useEffect(() => {
    const changes = {};
    let hasAnyChanges = false;

    Object.keys(editedData).forEach((key) => {
      const editedValue = editedData[key] || "";
      const initialValue = initialData[key] || "";

      if (JSON.stringify(editedValue) !== JSON.stringify(initialValue)) {
        changes[key] = true;
        hasAnyChanges = true;
      }
    });

    setChangedFields(changes);
    setHasChanges(hasAnyChanges);
  }, [editedData, initialData]);

  // When editing starts, load all districts and tehsils for the current province and district
  useEffect(() => {
    if (isEditing && userInfo?.province) {
      const provinceData = data.Provinces.find(
        (p) => p.Province === userInfo.province
      );
      if (provinceData) {
        const districtsForProvince = provinceData.Divisions.flatMap(
          (div) => div.Districts
        );
        setAllDistricts(districtsForProvince);

        if (userInfo.district) {
          const districtData = districtsForProvince.find(
            (d) => d.District === userInfo.district
          );
          if (districtData) {
            setAllTehsils(districtData.Tehsils);
          }
        }
      }
    }
  }, [isEditing, userInfo]);
  // eslint-disable-next-line
  const [starsReady, setStarsReady] = useState(false);

  useEffect(() => {
    if (worker?.userInfo?.averageRating !== undefined) {
      setStarsReady(true);
    }
  }, [worker?.userInfo?.averageRating]);

  const handleEditClick = () => {
    setIsEditing(true);
    setShowLocationReminder(true);
    setEditedData({ ...userInfo });
  };

  // Handle profession change
  const handleProfessionChange = (selectedOption) => {
    setEditedData((prev) => ({
      ...prev,
      profession: selectedOption ? selectedOption.value : "",
    }));
  };

  // Handle experience change
  const handleExperienceChange = (selectedOption) => {
    setEditedData((prev) => ({
      ...prev,
      experience: selectedOption ? selectedOption.value : "",
    }));
  };

  // Handle province change
  const handleProvinceChange = (selectedOption) => {
    const province = selectedOption ? selectedOption.value : "";
    const updatedData = {
      ...editedData,
      province,
      district: "",
      tehsil: "",
    };
    setEditedData(updatedData);

    // Update all districts for the selected province
    if (province) {
      const provinceData = data.Provinces.find((p) => p.Province === province);
      const districtsForProvince = provinceData
        ? provinceData.Divisions.flatMap((div) => div.Districts)
        : [];
      setAllDistricts(districtsForProvince);
      setAllTehsils([]);
    } else {
      setAllDistricts([]);
      setAllTehsils([]);
    }
  };

  // Handle district change
  const handleDistrictChange = (selectedOption) => {
    const district = selectedOption ? selectedOption.value : "";
    const updatedData = {
      ...editedData,
      district,
      tehsil: "",
    };
    setEditedData(updatedData);

    // Update all tehsils for the selected district
    if (district && editedData.province) {
      const provinceData = data.Provinces.find(
        (p) => p.Province === editedData.province
      );
      if (provinceData) {
        const districtsForProvince = provinceData.Divisions.flatMap(
          (div) => div.Districts
        );
        const districtData = districtsForProvince.find(
          (d) => d.District === district
        );
        setAllTehsils(districtData ? districtData.Tehsils : []);
      }
    } else {
      setAllTehsils([]);
    }
  };

  // Handle tehsil change
  const handleTehsilChange = (selectedOption) => {
    setEditedData((prev) => ({
      ...prev,
      tehsil: selectedOption ? selectedOption.value : "",
    }));
  };

  // Get current value objects for Select components
  const getCurrentProvinceValue = () => {
    return editedData.province
      ? {
          value: editedData.province,
          label: editedData.province,
        }
      : null;
  };

  const getCurrentDistrictValue = () => {
    return editedData.district
      ? {
          value: editedData.district,
          label: editedData.district,
        }
      : null;
  };

  const getCurrentTehsilValue = () => {
    return editedData.tehsil
      ? {
          value: editedData.tehsil,
          label: editedData.tehsil,
        }
      : null;
  };

  const getCurrentExperienceValue = () => {
    return (
      experienceOptions.find((opt) => opt.value === editedData.experience) ||
      null
    );
  };

  // Get district options with current district at the top
  const getDistrictOptions = () => {
    if (!allDistricts.length) return [];

    const options = allDistricts.map((d) => ({
      value: d.District,
      label: d.District,
    }));

    if (editedData.district) {
      const currentIndex = options.findIndex(
        (opt) => opt.value === editedData.district
      );
      if (currentIndex > 0) {
        const currentDistrict = options[currentIndex];
        options.splice(currentIndex, 1);
        options.unshift(currentDistrict);
      }
    }

    return options;
  };

  // Get tehsil options with current tehsil at the top
  const getTehsilOptions = () => {
    if (!allTehsils.length) return [];

    const options = allTehsils.map((t) => ({
      value: t,
      label: t,
    }));

    if (editedData.tehsil) {
      const currentIndex = options.findIndex(
        (opt) => opt.value === editedData.tehsil
      );
      if (currentIndex > 0) {
        const currentTehsil = options[currentIndex];
        options.splice(currentIndex, 1);
        options.unshift(currentTehsil);
      }
    }

    return options;
  };

  // Handle number input validation
  const handleNumberInput = (
    e,
    fieldName,
    maxLength = null,
    isWhatsapp = false
  ) => {
    const value = e.target.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    // For whatsapp number, preserve country code
    if (isWhatsapp && value.length < 3) return;

    // Enforce max length if specified
    if (maxLength && value.length > maxLength) return;

    setEditedData((prev) => ({ ...prev, [fieldName]: value }));

    // Validate contact number length
    if (fieldName === "contactNumber") {
      if (value.length < 11) {
        setContactError("Contact number must be 11 digits");
      } else {
        setContactError("");
      }
    }

    // Validate whatsapp number length
    if (fieldName === "whatsappNumber") {
      if (value.length < 13) {
        setWhatsappError(
          "WhatsApp number must be 13 digits (including country code)"
        );
      } else {
        setWhatsappError("");
      }
    }
  };

  // Updated handleWhatsAppInput function
  const handleWhatsAppInput = (e) => {
    const input = e.target.value || "";
    // Only allow digits
    const numbersOnly = input.replace(/\D/g, "");

    // Limit to 10 digits (after +92)
    if (numbersOnly.length > 10) return;

    setEditedData((prev) => ({
      ...prev,
      whatsappNumber: `+92${numbersOnly}`,
    }));

    // Validation
    setWhatsappError(
      numbersOnly.length < 10 ? "Must be 10 digits after +92" : ""
    );
  };

  // Cloudinary image upload handler
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      // Upload to Cloudinary
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
      const imageUrl = result.secure_url;

      // Update with permanent URL from Cloudinary
      setEditedData((prev) => ({ ...prev, url: imageUrl }));

      // Mark the URL field as changed to enable Save button
      setChangedFields((prev) => ({ ...prev, url: true }));
      setHasChanges(true);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error updating profile image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save changes handler
  const handleEdit = async () => {
    // Validate required fields
    if (!editedData.province || !editedData.district || !editedData.tehsil) {
      alert("Please complete your location details");
      return;
    }

    if (!editedData.contactNumber || editedData.contactNumber.length !== 11) {
      setContactError("Contact number must be 11 digits");
      return;
    }

    if (!editedData.whatsappNumber || editedData.whatsappNumber.length !== 13) {
      setWhatsappError("Complete WhatsApp number required (+92XXXXXXXXXX)");
      return;
    }

    try {
      // Prepare updates with fallback values
      const updates = {};
      Object.keys(changedFields).forEach((key) => {
        updates[key] = editedData[key] !== undefined ? editedData[key] : "";
      });
      console.log("Dispatching updates:", updates);

      const success = await dispatch(
        updateWorkerProfile(userInfo.uid, updates)
      );

      if (success) {
        setInitialData({ ...userInfo, ...updates });
        setHasChanges(false);
        setChangedFields({});
        setSaveSuccess(true);

        setTimeout(() => {
          setSaveSuccess(false);
          setIsEditing(false);
          setShowLocationReminder(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Get input border class based on changes
  const getInputBorderClass = (fieldName) => {
    return changedFields[fieldName]
      ? "border-2 border-blue-500 ring-2 ring-blue-200"
      : "border border-gray-300";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen mt-14 bg-gray-100 pb-12 pt-4 px-2 sm:px-0 lg:px-8"
    >
      <div className="w-full md:container mx-auto">
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          {/* Header Section */}
          <motion.div
            className="bg-blue-800 p-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Profile Image */}
            {userInfo?.url && (
              <motion.div
                className="flex items-center justify-center mb-4"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <div className="relative">
                  <div className="h-36 w-36 rounded-full max-w-md mx-auto border-4 border-white shadow-lg overflow-hidden">
                    {uploadingImage ? (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin text-blue-500 text-2xl"
                        />
                      </div>
                    ) : (
                      <motion.img
                        src={editedData.url || userInfo.url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      />
                    )}
                  </div>

                  {isEditing && (
                    <motion.div className="mt-4 text-center">
                      <motion.button
                        onClick={() => fileInputRef.current.click()}
                        className={`bg-blue-600 text-white text-xs px-3 py-1 rounded-md ${
                          uploadingImage ? "bg-blue-400" : "hover:bg-blue-700"
                        }`}
                        variants={buttonVariants}
                        whileHover={uploadingImage ? {} : "hover"}
                        whileTap={uploadingImage ? {} : "tap"}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <>
                            <FontAwesomeIcon
                              icon={faSpinner}
                              className="animate-spin mr-1"
                            />
                            Uploading...
                          </>
                        ) : (
                          "Change Photo"
                        )}
                      </motion.button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </motion.div>
                  )}

                  <motion.h1
                    className="text-2xl font-bold mt-2 text-white mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {userInfo?.name}
                  </motion.h1>
                  <motion.p
                    className="text-blue-200 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Don't forget to update your location when you move to
                    another place for work!
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* Added explanatory text section */}
          </motion.div>

          <div className="p-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {/* Left Column */}
              <motion.div className="space-y-4" variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editedData.name || ""}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 ${getInputBorderClass(
                        "name"
                      )}`}
                    />
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {userInfo?.name}
                    </p>
                  )}
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700">
                    Profession
                  </label>
                  {isEditing ? (
                    <Select
                      options={professions}
                      onChange={handleProfessionChange}
                      value={professions.find(
                        (opt) => opt.value === editedData.profession
                      )}
                      placeholder="Select profession..."
                      isClearable
                      styles={customStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {userInfo?.profession}
                    </p>
                  )}
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700">
                    Experience
                  </label>
                  {isEditing ? (
                    <Select
                      options={experienceOptions}
                      onChange={handleExperienceChange}
                      value={getCurrentExperienceValue()}
                      placeholder="Select experience..."
                      isClearable
                      styles={customStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {userInfo?.experience}
                    </p>
                  )}
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {userInfo?.email}
                  </p>
                </motion.div>
              </motion.div>

              {/* Right Column */}
              <motion.div className="space-y-4" variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={editedData.contactNumber || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 11) {
                            setEditedData((prev) => ({
                              ...prev,
                              contactNumber: value,
                            }));
                            setContactError(
                              value.length < 11
                                ? "Contact number must be 11 digits"
                                : ""
                            );
                          }
                        }}
                        className={`mt-1 block w-full border ${
                          contactError ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500`}
                        placeholder="e.g. 03001234567"
                      />
                      {contactError && (
                        <p className="mt-1 text-sm text-red-600">
                          {contactError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {userInfo?.contactNumber}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700">
                    WhatsApp Number
                  </label>
                  {isEditing ? (
                    <div>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          +92
                        </span>
                        <input
                          type="tel"
                          name="whatsappNumber"
                          value={(editedData.whatsappNumber || "+92").replace(
                            "+92",
                            ""
                          )}
                          onChange={handleWhatsAppInput}
                          className={`mt-0 flex-1 block w-full rounded-none rounded-r-md border ${
                            whatsappError ? "border-red-500" : "border-gray-300"
                          } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500`}
                          placeholder="3001234567"
                          maxLength={10}
                        />
                      </div>
                      {whatsappError && (
                        <p className="mt-1 text-sm text-red-600">
                          {whatsappError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {userInfo.whatsappNumber || "Not provided"}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700">
                    Daily Wage (PKR)
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="perDayWage"
                      value={editedData.perDayWage || ""}
                      onChange={(e) => handleNumberInput(e, "perDayWage")}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      PKR {userInfo?.perDayWage}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700">
                    Hourly Wage (PKR)
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="perHourWage"
                      value={editedData.perHourWage || ""}
                      onChange={(e) => handleNumberInput(e, "perHourWage")}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      PKR {userInfo?.perHourWage}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Location Section */}
            <motion.div
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700">
                  Province
                </label>
                {isEditing ? (
                  <Select
                    options={data.Provinces.map((p) => ({
                      value: p.Province,
                      label: p.Province,
                    }))}
                    onChange={handleProvinceChange}
                    value={getCurrentProvinceValue()}
                    placeholder="Select province..."
                    isClearable
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{userInfo?.province}</p>
                )}
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700">
                  District
                </label>
                {isEditing ? (
                  <Select
                    options={getDistrictOptions()}
                    onChange={handleDistrictChange}
                    value={getCurrentDistrictValue()}
                    placeholder={
                      editedData.province
                        ? "Select district..."
                        : "Please select province first"
                    }
                    isClearable
                    isDisabled={!editedData.province}
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{userInfo?.district}</p>
                )}
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700">
                  Tehsil
                </label>
                {isEditing ? (
                  <Select
                    options={getTehsilOptions()}
                    onChange={handleTehsilChange}
                    value={getCurrentTehsilValue()}
                    placeholder={
                      editedData.district
                        ? "Select tehsil..."
                        : "Please select district first"
                    }
                    isClearable
                    isDisabled={!editedData.district}
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{userInfo?.tehsil}</p>
                )}
              </motion.div>
            </motion.div>

            {/* Location Reminder Alert */}
            <AnimatePresence>
              {showLocationReminder && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 p-4 pb-1 mt-2 bg-yellow-100 border-l-4 border-yellow-400 rounded overflow-hidden"
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm  text-yellow-700">
                        <strong>Important:</strong> If you want to change your
                        location/address, you must first select the province,
                        then district, and finally tehsil in that order.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Change Form */}
            <AnimatePresence>
              {showPasswordForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <PasswordChangeForm
                    changingPassword={changingPassword}
                    passwordChangeError={passwordChangeError}
                    passwordChangeSuccess={passwordChangeSuccess}
                    dispatch={dispatch}
                    onCancel={() => {
                      setShowPasswordForm(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
              className="mt-8 flex justify-between"
              variants={itemVariants}
            >
              <div className="flex">
                {isEditing ? (
                  <>
                    <motion.button
                      onClick={() => {
                        setIsEditing(false);
                        setShowLocationReminder(false);
                        // Reset to original data
                        setEditedData({ ...initialData });
                        setHasChanges(false);
                        setChangedFields({});
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleEdit}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        !hasChanges || updateProfile?.loading
                          ? "bg-gray-400 cursor-not-allowed"
                          : saveSuccess
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      variants={buttonVariants}
                      whileHover={
                        !updateProfile?.loading && hasChanges ? "hover" : {}
                      }
                      whileTap={
                        !updateProfile?.loading && hasChanges ? "tap" : {}
                      }
                      disabled={!hasChanges || updateProfile?.loading}
                    >
                      {updateProfile?.loading ? (
                        <>
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin mr-2"
                          />
                          Saving...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <FontAwesomeIcon icon={faCheck} className="mr-2" />
                          Saved!
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </motion.button>
                    {updateProfile?.error && (
                      <div className="mt-2 text-sm text-red-600">
                        {updateProfile.error}
                      </div>
                    )}
                  </>
                ) : (
                  <motion.button
                    onClick={handleEditClick}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Edit Profile
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <div className="w-full md:container flex flex-col md:flex-row mx-auto mt-4 bg-white py-4 px-2 sm:px-0 lg:px-8 rounded-lg gap-4 md:gap-6">
        {/* Worker Profile Card - This will come first on mobile */}
        <div className="bg-white p-3 pt-1 rounded-lg shadow-md border border-gray-200 md:flex-1">
          {/* Rating display */}
          <div className="mb-2">
            <div className="flex justify-center items-center">
              {worker?.userInfo?.averageRating !== undefined ? (
                <>
                  <div className="flex mr-2">
                    <StarRating rating={worker.userInfo.averageRating} />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {worker.userInfo.averageRating.toFixed(1)} (
                    {worker.userInfo.feedbackCount} reviews)
                  </span>
                </>
              ) : (
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FontAwesomeIcon
                        key={`loading-${i}`}
                        icon={faStarEmpty}
                        className="text-gray-300"
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">
                    Loading ratings...
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {/* Only changed this image part - kept all classes same */}
            {userInfo?.url ? (
              <img
                src={userInfo?.url || "/default-user-icon.png"}
                alt="Profile"
                className="h-20 w-20 rounded-full max-w-md object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-user-icon.png";
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-blue-100 bg-gray-200 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}

            {/* Everything below remains EXACTLY the same as your original code */}
            <div className="ml-3 -mt-2 text-left">
              <h2 className="text-black font-bold -mb-0">{userInfo.name}</h2>
              <p className="text-gray-600 text-sm -mb-0">{userInfo.email}</p>
              <p className="text-blue-600 font-semibold text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                {userInfo.profession?.split(" - ")[0]}
              </p>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex ">
              <span>Wage: &nbsp; </span>
              <span className="font-bold text-blue-600">
                {userInfo.perDayWage} PKR/day
              </span>
            </div>
            <div className="flex ">
              <span>Experience: &nbsp;</span>
              <span>{userInfo.experience}</span>
            </div>
            <div className="flex items-start">
              <FontAwesomeIcon
                icon={faLocationDot}
                className="mt-1 mr-2 text-blue-500"
              />
              <span>
                {userInfo?.province?.split(" - ")[0] || "Not specified"}, &nbsp;
                {userInfo?.district?.split(" - ")[0] || ""}, &nbsp;
                {userInfo?.tehsil?.split(" - ")[0] || ""}
              </span>
            </div>
          </div>
          {/* Contact Information */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faPhone} className="text-blue-500 mr-2" />
              <span>{userInfo.contactNumber}</span>
              <button
                onClick={() => copyPhoneNumber(userInfo.contactNumber)}
                className="ml-2 text-gray-500 hover:text-blue-600"
              >
                <FontAwesomeIcon
                  icon={
                    copiedPhone === userInfo.contactNumber ? faCheck : faCopy
                  }
                  className={
                    copiedPhone === userInfo.contactNumber
                      ? "text-green-500"
                      : ""
                  }
                />
              </button>
            </div>
            <a
              href={
                userInfo.whatsappNumber
                  ? getWhatsAppLink(userInfo.whatsappNumber)
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center ${
                userInfo.whatsappNumber
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white px-3 py-1 rounded text-sm no-underline`}
            >
              <FontAwesomeIcon icon={faWhatsapp} className="mr-1" />
              WhatsApp
            </a>
          </div>
          {/* View Reviews Button */}
          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-center">
            <button
              onClick={openViewComments}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              <FontAwesomeIcon icon={faComment} className="mr-1" />
              View Reviews
            </button>
          </div>
        </div>

        {/* Information Card - This will come second on mobile */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto md:flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Your Profile Visibility to Employers
          </h3>
          <p className="text-gray-600 mb-3">
            This is how your profile appears to potential employers searching
            for skilled workers. Make sure all your information is up-to-date to
            increase your chances of being hired.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            View Your Reviews
          </h3>
          <p className="text-gray-600 mb-3">
            The "View Reviews" button allows employers to see feedback from your
            previous jobs. Positive reviews help build your reputation and can
            lead to more job opportunities.
          </p>

          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
            <p className="text-blue-700 font-medium">
              Remember: A complete and well-maintained profile gets 3x more
              views!
            </p>
          </div>
        </div>
      </div>
      {/* Reviews Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Reviews Modal"
      >
        <div className="flex justify-between items-center mb-2 border-b">
          <h2 className="text-xl font-bold text-black">
            Reviews for {userInfo.name}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 text-4xl pb-1 mb-2 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <div className="mb-6 max-h-64 overflow-y-auto">
          {feedbacksLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading reviews...</span>
            </div>
          ) : feedbacksError ? (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 mr-2" />
              {feedbacksError}
            </div>
          ) : feedbacks && feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <div
                key={feedback.id || Math.random()} // Add fallback key if id doesn't exist
                className="mb-4 pb-4 border-b border-gray-100"
              >
                <div className="flex items-start">
                  <img
                    src={feedback.finderProfileImage || ahmadimg}
                    alt={feedback.finderName || "Reviewer"}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = ahmadimg;
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex flex-col">
                      <p className="font-medium text-black">
                        {feedback.finderName || "Anonymous"}
                      </p>
                      {feedback.finderEmail && (
                        <p className="text-gray-500 text-xs -mt-4">
                          {feedback.finderEmail}
                        </p>
                      )}
                    </div>
                    {feedback.comment && (
                      <p className="text-gray-700 mt-0">{feedback.comment}</p>
                    )}
                    <div className="flex items-center -mt-2 gap-x-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesomeIcon
                            key={star}
                            icon={faStar}
                            className={`text-${
                              star <= (feedback.rating || 0)
                                ? "yellow-400"
                                : "gray-300"
                            } text-xs mx-0.5`}
                          />
                        ))}
                      </div>
                      {feedback.createdAt && (
                        <span className="text-gray-500 text-xs">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <FontAwesomeIcon
                icon={faComment}
                className="text-gray-400 text-2xl mb-2"
              />
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-gray-400 text-sm mt-1">
                You haven't received any reviews yet
              </p>
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}

// Add PropTypes at the bottom of the file
SignInToAccount.propTypes = {
  worker: PropTypes.shape({
    userInfo: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      email: PropTypes.string,
      profession: PropTypes.string,
      experience: PropTypes.string,
      contactNumber: PropTypes.string,
      whatsappNumber: PropTypes.string,
      perDayWage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      perHourWage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      province: PropTypes.string,
      district: PropTypes.string,
      tehsil: PropTypes.string,
      url: PropTypes.string,
      averageRating: PropTypes.number,
      feedbackCount: PropTypes.number,
    }),
    uid: PropTypes.string,
  }),
  updateProfile: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.string,
    success: PropTypes.bool,
  }),
  changingPassword: PropTypes.bool,
  passwordChangeError: PropTypes.string,
  passwordChangeSuccess: PropTypes.bool,
};

SignInToAccount.defaultProps = {
  worker: {
    userInfo: {
      whatsappNumber: "+92",
    },
  },
  updateProfile: {},
  changingPassword: false,
  passwordChangeError: null,
  passwordChangeSuccess: false,
};

export default SignInToAccount;
