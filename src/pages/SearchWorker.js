import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faCopy,
  faCheck,
  faPhone,
  faExclamationCircle,
  faStar,
  faComment,
  faPen,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import ahmadimg from "../assests/images/ahmad.jpg";
import { getWorkers } from "../redux/actions/SearchWorkerAction";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import data from "./data.json";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "react-modal";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  UserIcon,
  BriefcaseIcon,
  MapIcon,
  GlobeAltIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

import {
  submitFeedback,
  fetchWorkerFeedbacks,
} from "../redux/actions/feedbackActions";
import { FaTimes } from "react-icons/fa";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const filterVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

Modal.setAppElement("#root");
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStar}
          className="text-yellow-400 text-sm mx-0.5"
        />
      ))}

      {hasHalfStar && (
        <div className="relative">
          <FontAwesomeIcon
            icon={faStar}
            className="text-gray-300 text-sm mx-0.5"
          />
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: "50%" }}
          >
            <FontAwesomeIcon
              icon={faStar}
              className="text-yellow-400 text-sm mx-0.5"
            />
          </div>
        </div>
      )}

      {[...Array(emptyStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={faStar}
          className="text-gray-300 text-sm mx-0.5"
        />
      ))}
    </div>
  );
};

function SearchWorker() {
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [professions, setProfessions] = useState([]);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [tehsils, setTehsils] = useState([]);
  const [filters, setFilters] = useState({
    province: "",
    district: "",
    tehsil: "",
  });
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [viewComments, setViewComments] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loadingDots, setLoadingDots] = useState(".");
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1130);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dispatch = useDispatch();

  // Get data from Redux store
  const { workers, loading } = useSelector((state) => state.workersList);
  const finderState = useSelector((state) => state.auth.finder);
  const userInfo = finderState?.userInfo || {};
  const uid = userInfo?.uid || null;
  const {
    feedbacks,
    fetchLoading: feedbacksLoading,
    fetchError: feedbacksError,
    submitLoading,
    submitError,
  } = useSelector((state) => state.feedbackReducer);

  useEffect(() => {
    dispatch(getWorkers());
    fetchProfessions();

    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Add this useEffect hook after your existing useEffect hooks
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        closeModal();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  // Add this useEffect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      const large = window.innerWidth > 1130;
      setIsLargeScreen(large);

      // Auto-close sidebar when switching to large screen
      if (large && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => (prev.length >= 3 ? "." : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);

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

  // Filter handlers
  const handleProfessionChange = (selectedOption) => {
    setSelectedProfession(selectedOption);
    setSearchAttempted(true);
  };

  const handleProvinceChange = (selectedOption) => {
    const province = selectedOption ? selectedOption.value : "";
    setFilters({ province, district: "", tehsil: "" });
    setSearchAttempted(true);
    const selectedProvinceData = data.Provinces.find(
      (p) => p.Province === province
    );
    const allDistricts = selectedProvinceData
      ? selectedProvinceData.Divisions.flatMap((division) => division.Districts)
      : [];
    setDistricts(allDistricts);
    setTehsils([]);
  };

  const handleDistrictChange = (selectedOption) => {
    const district = selectedOption ? selectedOption.value : "";
    setFilters({ ...filters, district, tehsil: "" });
    setSearchAttempted(true);
    const selectedDistrictData = districts.find((d) => d.District === district);
    setTehsils(selectedDistrictData ? selectedDistrictData.Tehsils : []);
  };

  const handleTehsilChange = (selectedOption) => {
    const tehsil = selectedOption ? selectedOption.value : "";
    setFilters({ ...filters, tehsil });
    setSearchAttempted(true);
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesProfession = selectedProfession
      ? worker.profession
          ?.toLowerCase()
          .includes(selectedProfession.value.toLowerCase())
      : true;

    const matchesProvince = filters.province
      ? worker.province.split(" - ")[0].trim().toLowerCase() ===
        filters.province.split(" - ")[0].trim().toLowerCase()
      : true;

    const matchesDistrict = filters.district
      ? worker.district.split(" - ")[0].trim().toLowerCase() ===
        filters.district.split(" - ")[0].trim().toLowerCase()
      : true;

    const matchesTehsil = filters.tehsil
      ? worker.tehsil.split(" - ")[0].trim().toLowerCase() ===
        filters.tehsil.split(" - ")[0].trim().toLowerCase()
      : true;

    const matchesName = searchName
      ? worker.name.toLowerCase().includes(searchName.toLowerCase())
      : true;

    return (
      matchesProfession &&
      matchesProvince &&
      matchesDistrict &&
      matchesTehsil &&
      matchesName
    );
  });

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;

    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className="bg-yellow-300 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const copyPhoneNumber = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 3000);
  };

  const openCommentsModal = (worker) => {
    setSelectedWorker(worker);
    setModalIsOpen(true);
    setViewComments(false);
    setRating(0);
    setNewComment("");
    setSubmitSuccess(false);
  };

  const openViewComments = (worker) => {
    setSelectedWorker(worker);
    setModalIsOpen(true);
    setViewComments(true);
    dispatch(fetchWorkerFeedbacks(worker.id));
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setNewComment("");
    setRating(0);
    setViewComments(false);
    setSubmitSuccess(false);
  };

  const handleRatingChange = (star) => {
    setRating(star);
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (rating === 0 || !newComment.trim()) return;

    const feedbackData = {
      workerId: selectedWorker.id,
      workerName: selectedWorker.name,
      workerProfession: selectedWorker.profession,
      finderId: uid,
      finderName: userInfo.fullName,
      finderProfileImage: userInfo.profileImage || "",
      finderEmail: userInfo.email,
      rating,
      comment: newComment.trim(),
    };

    dispatch(submitFeedback(feedbackData));

    // Refresh the feedbacks immediately after submission
    dispatch(fetchWorkerFeedbacks(selectedWorker.id));

    // Re-fetch workers to update average ratings
    dispatch(getWorkers());

    setSubmitSuccess(true);
  };

  // Custom styles for react-select components
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      height: "40px",
      borderColor: state.isFocused || state.hasValue ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#e0e7ff"
        : "white",
      color: state.isSelected ? "white" : "black",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  // Modal styles
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

  // Determine if we should show no results message
  const showNoResults =
    searchAttempted &&
    !loading &&
    filteredWorkers.length === 0 &&
    (selectedProfession ||
      filters.province ||
      filters.district ||
      filters.tehsil);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 relative"
    >
      {/* Toggle Button for Small Screens */}
      {!isLargeScreen && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={toggleSidebar}
          className="fixed right-4 top-20 z-40 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <FontAwesomeIcon
            icon={sidebarOpen ? faTimes : faBars}
            className="mr-2"
          />
          {sidebarOpen ? "Close" : "Filters"}
        </motion.button>
      )}
      <div className="container mx-auto px-2 pt-20">
        <div className="flex">
          {/* Worker Profiles Section (Left Side) */}
          <div className={`${isLargeScreen ? "w-3/4 pr-4" : "w-full"}`}>
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center h-[100vh] mt-4"
              >
                <div className="text-center ">
                  <p className="text-3xl text-blue-500 font-bold">
                    Loading{loadingDots}
                  </p>
                  <p className="text-gray-500 mt-2">
                    Searching for workers in your area
                  </p>
                </div>
              </motion.div>
            ) : showNoResults ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow border border-gray-200"
              >
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="text-blue-500 text-4xl mb-2"
                />
                <p className="text-black text-lg font-semibold text-center">
                  {selectedProfession &&
                    `No worker profiles available for "${selectedProfession.label}"`}
                  {filters.province &&
                    ` in ${filters.province.split(" - ")[0]}`}
                  {filters.district && `, ${filters.district.split(" - ")[0]}`}
                  {filters.tehsil && `, ${filters.tehsil.split(" - ")[0]}`}
                </p>
                <p className="text-gray-600 mt-1">
                  Try broadening your search criteria
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={pageLoaded ? "show" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
              >
                {filteredWorkers.map((worker, index) => (
                  <motion.div
                    key={worker.id}
                    variants={itemVariants}
                    className="bg-white p-4 pt-2 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                    whileHover={{ y: -5 }}
                  >
                    {/* Worker Rating */}
                    <div className="flex justify-center items-center mb-3">
                      <StarRating rating={worker.averageRating || 0} />
                      {worker.feedbackCount > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({worker.feedbackCount})
                        </span>
                      )}
                    </div>

                    {/* Worker Image and Name */}
                    <div className="flex items-center -mt-2">
                      <div className="relative group">
                        <motion.img
                          src={worker.url || ahmadimg}
                          alt={worker.name}
                          className="w-16 h-16 rounded-full border-2 border-blue-100 object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = ahmadimg;
                          }}
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                        />
                      </div>
                      <div className="ml-4">
                        <h2 className="text-black font-bold">
                          {highlightText(worker.name, searchName)}
                        </h2>{" "}
                        <p className="text-gray-600 text-sm mb-1 -mt-1">
                          {worker.email}
                        </p>
                        <p className="text-blue-600 font-semibold mt-0 text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                          {worker.profession.split(" - ")[0]}
                        </p>
                      </div>
                    </div>

                    {/* Worker Details */}
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center">
                        <span className="font-medium text-black">Wage:</span>
                        <span className="ml-2 font-bold text-blue-600">
                          {worker.perDayWage} PKR/day
                        </span>
                      </div>

                      <div className="flex items-center">
                        <span className="font-medium text-black">
                          Experience:
                        </span>
                        <span className="ml-2 text-gray-700">
                          {worker.experience}
                        </span>
                      </div>

                      <div className="flex items-start">
                        <FontAwesomeIcon
                          icon={faLocationDot}
                          className="text-blue-500 mt-1 mr-2"
                        />
                        <span className="text-gray-700">
                          {`${worker.province.split(" - ")[0]}, ${
                            worker.district.split(" - ")[0]
                          }, ${worker.tehsil.split(" - ")[0]}`}
                        </span>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <a
                            href={`tel:${worker.contactNumber}`}
                            className="flex items-center no-underline text-black hover:text-blue-600"
                          >
                            <FontAwesomeIcon
                              icon={faPhone}
                              className="text-blue-500 mr-2"
                            />
                            <span>{worker.contactNumber}</span>
                          </a>
                          <button
                            onClick={() =>
                              copyPhoneNumber(worker.contactNumber)
                            }
                            className="ml-2 text-gray-500 hover:text-blue-600"
                            title="Copy number"
                          >
                            <FontAwesomeIcon
                              icon={
                                copiedPhone === worker.contactNumber
                                  ? faCheck
                                  : faCopy
                              }
                              className={
                                copiedPhone === worker.contactNumber
                                  ? "text-green-500"
                                  : ""
                              }
                            />
                          </button>
                        </div>

                        <a
                          href={`https://wa.me/${worker.whatsappNumber.replace(
                            /\s+/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center no-underline bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          <FontAwesomeIcon icon={faWhatsapp} className="mr-1" />
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Comments Buttons */}
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                      <button
                        onClick={() => openViewComments(worker)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
                      >
                        <FontAwesomeIcon icon={faComment} className="mr-1" />
                        View Reviews
                      </button>
                      <button
                        onClick={() => openCommentsModal(worker)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
                      >
                        <FontAwesomeIcon icon={faPen} className="mr-1" />
                        Add Review
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Filters Section (Right Side) */}
          {isLargeScreen ? (
            // Desktop Sidebar (always visible on large screens)
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={pageLoaded ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="fixed top-16 right-0 w-1/4 h-screen bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-lg"
            >
              <h2 className="text-xl font-bold text-black mt-3 mb-4">
                Search by Filters:
              </h2>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={pageLoaded ? "show" : "hidden"}
                className="space-y-4"
              >
                {/* Name Search Field */}
                <motion.div variants={filterVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search by Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Worker name..."
                    />
                  </div>
                </motion.div>

                {/* Profession Dropdown */}
                <motion.div variants={filterVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profession
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
                      <BriefcaseIcon className="h-5 w-5" />
                    </div>
                    <Select
                      options={professions}
                      onChange={handleProfessionChange}
                      value={selectedProfession}
                      placeholder="Select profession..."
                      isClearable
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          paddingLeft: "40px",
                          height: "40px",
                          borderColor:
                            state.isFocused || state.hasValue
                              ? "#3b82f6"
                              : "#d1d5db",
                          backgroundColor: "#f9fafb",
                          boxShadow: state.isFocused
                            ? "0 0 0 1px #3b82f6"
                            : "none",
                          "&:hover": {
                            borderColor: "#3b82f6",
                          },
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? "#3b82f6"
                            : state.isFocused
                            ? "#e0e7ff"
                            : "white",
                          color: state.isSelected ? "white" : "black",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                      classNamePrefix="react-select"
                    />
                  </div>
                </motion.div>

                {/* Location Dropdowns */}
                <motion.div variants={containerVariants} className="space-y-3">
                  {/* Province */}
                  <motion.div variants={filterVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province
                    </label>
                    <div className="relative">
                      {/* Icon stays visible */}
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
                        <MapIcon className="h-5 w-5" />
                      </div>

                      <Select
                        options={data.Provinces.map((p) => ({
                          value: p.Province,
                          label: p.Province,
                        }))}
                        value={
                          filters.province
                            ? {
                                value: filters.province,
                                label: filters.province,
                              }
                            : null
                        }
                        onChange={handleProvinceChange}
                        isClearable
                        placeholder="Select province..."
                        menuPortalTarget={document.body}
                        menuPlacement="auto"
                        menuPosition="fixed"
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            paddingLeft: "40px",
                            height: "40px",
                            borderColor:
                              state.isFocused || state.hasValue
                                ? "#3b82f6"
                                : "#d1d5db",
                            backgroundColor: "#f9fafb",
                            boxShadow: state.isFocused
                              ? "0 0 0 1px #3b82f6"
                              : "none",
                            "&:hover": { borderColor: "#3b82f6" },
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                              ? "#3b82f6"
                              : state.isFocused
                              ? "#e0e7ff"
                              : "white",
                            color: state.isSelected ? "white" : "black",
                          }),
                          menu: (base) => ({ ...base, zIndex: 9999 }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        classNamePrefix="react-select"
                      />
                    </div>
                  </motion.div>

                  {/* District */}
                  <motion.div variants={filterVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <div className="relative">
                      {/* Icon stays visible */}
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
                        <MapPinIcon className="h-6 w-6" />
                      </div>

                      <Select
                        options={districts.map((d) => ({
                          value: d.District,
                          label: d.District,
                        }))}
                        value={
                          filters.district
                            ? {
                                value: filters.district,
                                label: filters.district,
                              }
                            : null
                        }
                        onChange={handleDistrictChange}
                        isClearable
                        placeholder="Select district..."
                        isDisabled={!filters.province}
                        menuPortalTarget={document.body}
                        menuPlacement="auto"
                        menuPosition="fixed"
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            paddingLeft: "40px",
                            height: "40px",
                            borderColor:
                              state.isFocused || state.hasValue
                                ? "#3b82f6"
                                : "#d1d5db",
                            backgroundColor: "#f9fafb",
                            boxShadow: state.isFocused
                              ? "0 0 0 1px #3b82f6"
                              : "none",
                            "&:hover": { borderColor: "#3b82f6" },
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                              ? "#3b82f6"
                              : state.isFocused
                              ? "#e0e7ff"
                              : "white",
                            color: state.isSelected ? "white" : "black",
                          }),
                          menu: (base) => ({ ...base, zIndex: 9999 }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        classNamePrefix="react-select"
                      />
                    </div>
                  </motion.div>

                  {/* Tehsil */}
                  <motion.div variants={filterVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tehsil
                    </label>
                    <div className="relative">
                      {/* Icon stays visible */}
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
                        <GlobeAltIcon className="h-5 w-5" />
                      </div>

                      <Select
                        options={tehsils.map((tehsil) => ({
                          value: tehsil,
                          label: tehsil,
                        }))}
                        value={
                          filters.tehsil
                            ? { value: filters.tehsil, label: filters.tehsil }
                            : null
                        }
                        onChange={handleTehsilChange}
                        isClearable
                        placeholder="Select tehsil..."
                        isDisabled={!filters.district}
                        menuPortalTarget={document.body}
                        menuPlacement="auto"
                        menuPosition="fixed"
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            paddingLeft: "40px",
                            height: "40px",
                            borderColor:
                              state.isFocused || state.hasValue
                                ? "#3b82f6"
                                : "#d1d5db",
                            backgroundColor: "#f9fafb",
                            boxShadow: state.isFocused
                              ? "0 0 0 1px #3b82f6"
                              : "none",
                            "&:hover": { borderColor: "#3b82f6" },
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                              ? "#3b82f6"
                              : state.isFocused
                              ? "#e0e7ff"
                              : "white",
                            color: state.isSelected ? "white" : "black",
                          }),
                          menu: (base) => ({ ...base, zIndex: 9999 }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        classNamePrefix="react-select"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            // Mobile Sidebar (overlay on small screens)
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  {/* Backdrop with blur effect */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30"
                  />

                  {/* Sidebar */}
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", ease: "easeInOut" }}
                    className="fixed top-0 right-0 w-4/5 max-w-md h-full bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-lg z-40"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-black">
                        Search Filters
                      </h2>
                      <button
                        onClick={toggleSidebar}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Name Search Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Search by Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <UserIcon className="h-5 w-5" />
                          </div>
                          <input
                            type="text"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Worker name..."
                          />
                        </div>
                      </div>

                      {/* Profession Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Profession
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
                            <BriefcaseIcon className="h-5 w-5" />
                          </div>
                          <Select
                            options={professions}
                            onChange={handleProfessionChange}
                            value={selectedProfession}
                            placeholder="Select profession..."
                            isClearable
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                paddingLeft: "40px",
                                height: "40px",
                                borderColor:
                                  state.isFocused || state.hasValue
                                    ? "#3b82f6"
                                    : "#d1d5db",
                                backgroundColor: "#f9fafb",
                                boxShadow: state.isFocused
                                  ? "0 0 0 1px #3b82f6"
                                  : "none",
                                "&:hover": {
                                  borderColor: "#3b82f6",
                                },
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected
                                  ? "#3b82f6"
                                  : state.isFocused
                                  ? "#e0e7ff"
                                  : "white",
                                color: state.isSelected ? "white" : "black",
                              }),
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                            }}
                            classNamePrefix="react-select"
                          />
                        </div>
                      </div>

                      {/* Location Dropdowns */}
                      <div className="space-y-3">
                        {/* Province */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Province
                          </label>
                          <div className="relative">
                            {/* Icon stays visible */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
                              <MapIcon className="h-5 w-5" />
                            </div>

                            <Select
                              options={data.Provinces.map((p) => ({
                                value: p.Province,
                                label: p.Province,
                              }))}
                              value={
                                filters.province
                                  ? {
                                      value: filters.province,
                                      label: filters.province,
                                    }
                                  : null
                              }
                              onChange={handleProvinceChange}
                              isClearable
                              placeholder="Select province..."
                              menuPortalTarget={document.body}
                              menuPlacement="auto"
                              menuPosition="fixed"
                              styles={{
                                control: (provided, state) => ({
                                  ...provided,
                                  paddingLeft: "40px",
                                  height: "40px",
                                  borderColor:
                                    state.isFocused || state.hasValue
                                      ? "#3b82f6"
                                      : "#d1d5db",
                                  backgroundColor: "#f9fafb",
                                  boxShadow: state.isFocused
                                    ? "0 0 0 1px #3b82f6"
                                    : "none",
                                  "&:hover": { borderColor: "#3b82f6" },
                                }),
                                option: (provided, state) => ({
                                  ...provided,
                                  backgroundColor: state.isSelected
                                    ? "#3b82f6"
                                    : state.isFocused
                                    ? "#e0e7ff"
                                    : "white",
                                  color: state.isSelected ? "white" : "black",
                                }),
                                menu: (base) => ({ ...base, zIndex: 9999 }),
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                              }}
                              classNamePrefix="react-select"
                            />
                          </div>
                        </div>

                        {/* District */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            District
                          </label>
                          <div className="relative">
                            {/* Icon stays visible */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
                              <MapPinIcon className="h-6 w-6" />
                            </div>

                            <Select
                              options={districts.map((d) => ({
                                value: d.District,
                                label: d.District,
                              }))}
                              value={
                                filters.district
                                  ? {
                                      value: filters.district,
                                      label: filters.district,
                                    }
                                  : null
                              }
                              onChange={handleDistrictChange}
                              isClearable
                              placeholder="Select district..."
                              isDisabled={!filters.province}
                              menuPortalTarget={document.body}
                              menuPlacement="auto"
                              menuPosition="fixed"
                              styles={{
                                control: (provided, state) => ({
                                  ...provided,
                                  paddingLeft: "40px",
                                  height: "40px",
                                  borderColor:
                                    state.isFocused || state.hasValue
                                      ? "#3b82f6"
                                      : "#d1d5db",
                                  backgroundColor: "#f9fafb",
                                  boxShadow: state.isFocused
                                    ? "0 0 0 1px #3b82f6"
                                    : "none",
                                  "&:hover": { borderColor: "#3b82f6" },
                                }),
                                option: (provided, state) => ({
                                  ...provided,
                                  backgroundColor: state.isSelected
                                    ? "#3b82f6"
                                    : state.isFocused
                                    ? "#e0e7ff"
                                    : "white",
                                  color: state.isSelected ? "white" : "black",
                                }),
                                menu: (base) => ({ ...base, zIndex: 9999 }),
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                              }}
                              classNamePrefix="react-select"
                            />
                          </div>
                        </div>

                        {/* Tehsil */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tehsil
                          </label>
                          <div className="relative">
                            {/* Icon stays visible */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
                              <GlobeAltIcon className="h-5 w-5" />
                            </div>

                            <Select
                              options={tehsils.map((tehsil) => ({
                                value: tehsil,
                                label: tehsil,
                              }))}
                              value={
                                filters.tehsil
                                  ? {
                                      value: filters.tehsil,
                                      label: filters.tehsil,
                                    }
                                  : null
                              }
                              onChange={handleTehsilChange}
                              isClearable
                              placeholder="Select tehsil..."
                              isDisabled={!filters.district}
                              menuPortalTarget={document.body}
                              menuPlacement="auto"
                              menuPosition="fixed"
                              styles={{
                                control: (provided, state) => ({
                                  ...provided,
                                  paddingLeft: "40px",
                                  height: "40px",
                                  borderColor:
                                    state.isFocused || state.hasValue
                                      ? "#3b82f6"
                                      : "#d1d5db",
                                  backgroundColor: "#f9fafb",
                                  boxShadow: state.isFocused
                                    ? "0 0 0 1px #3b82f6"
                                    : "none",
                                  "&:hover": { borderColor: "#3b82f6" },
                                }),
                                option: (provided, state) => ({
                                  ...provided,
                                  backgroundColor: state.isSelected
                                    ? "#3b82f6"
                                    : state.isFocused
                                    ? "#e0e7ff"
                                    : "white",
                                  color: state.isSelected ? "white" : "black",
                                }),
                                menu: (base) => ({ ...base, zIndex: 9999 }),
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                              }}
                              classNamePrefix="react-select"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-gray-200">
                      <motion.button
                        onClick={toggleSidebar}
                        className="w-full flex items-center justify-center py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="mr-2">Close</span>
                        <FontAwesomeIcon
                          icon={faTimes}
                          className="text-gray-600"
                        />
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Comments Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Comments Modal"
      >
        {selectedWorker && (
          <div>
            <div className="flex justify-between items-center mb-2 border-b">
              <h2 className="text-xl font-bold text-black">
                {viewComments ? "Reviews for " : "Add Review for "}
                {selectedWorker.name}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 text-4xl pb-1 mb-2 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            {viewComments ? (
              <div className="mb-6 max-h-64 overflow-y-auto">
                {feedbacksLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading Reviews...</span>
                  </div>
                ) : feedbacksError ? (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                    {feedbacksError}
                  </div>
                ) : feedbacks.length > 0 ? (
                  feedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="mb-4 pb-4 border-b border-gray-100"
                    >
                      <div className="flex items-start">
                        <img
                          src={feedback.finderProfileImage || ahmadimg}
                          alt={feedback.finderName}
                          className="w-10 h-10 rounded-full mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = ahmadimg;
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex flex-col">
                            <p className="font-medium text-black">
                              {feedback.finderName}
                            </p>
                            <p className="text-gray-500 text-xs -mt-4">
                              {feedback.finderEmail}
                            </p>
                          </div>
                          <p className="text-gray-700 mt-0">
                            {feedback.comment}
                          </p>
                          <div className="flex items-center -mt-2 gap-x-4">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FontAwesomeIcon
                                  key={star}
                                  icon={faStar}
                                  className={`text-${
                                    star <= feedback.rating
                                      ? "yellow-400"
                                      : "gray-300"
                                  } text-xs mx-0.5`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-500 text-xs">
                              {new Date(
                                feedback.createdAt
                              ).toLocaleDateString()}
                            </span>
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
                    <p className="text-gray-500">No Reviews yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Be the first to review this worker
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {submitSuccess ? (
                  <div className="text-center py-4">
                    <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                    <p className="text-lg font-medium text-gray-800 mt-2">
                      Review submitted successfully!
                    </p>
                    <p className="text-gray-600 mt-1">
                      This window will close automatically
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitComment}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            className="focus:outline-none"
                            onClick={() => handleRatingChange(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            disabled={submitLoading}
                          >
                            <FontAwesomeIcon
                              icon={faStar}
                              className={`text-${
                                star <= (hoverRating || rating)
                                  ? "yellow-400"
                                  : "gray-300"
                              } text-xl mx-1 ${
                                submitLoading ? "opacity-50" : ""
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Comment
                      </label>
                      <textarea
                        value={newComment}
                        onChange={handleCommentChange}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          submitLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        rows="3"
                        placeholder="Write your review here..."
                        disabled={submitLoading}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={
                        submitLoading || rating === 0 || !newComment.trim()
                      }
                      className={`w-full flex justify-center items-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors ${
                        submitLoading || rating === 0 || !newComment.trim()
                          ? "opacity-70 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {submitLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white mr-2"
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
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </button>

                    {submitError && (
                      <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
                        <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                        {submitError}
                      </div>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

export default SearchWorker;
