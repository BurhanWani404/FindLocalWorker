import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTools,
  faHandshake,
  faSearch,
  faUserCheck,
  faComments,
   faStar,
  faLeaf,
  faPaintRoller,
  faHammer,
  faBroom,
  faFaucet,
  faBolt,
  } from "@fortawesome/free-solid-svg-icons";

import AuthModal from "../components/AuthModal";
import { clearWorkerState } from "../redux/actions/authActions";
import { useDispatch } from "react-redux";
import FeedbackFormSection from "../components/FeedbackFormSection";
import Footer from "../components/Footer";

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authFlow, setAuthFlow] = useState("worker");

  useEffect(() => {
    dispatch(clearWorkerState());
  }, [dispatch]);

  

 

  const handleGetStarted = async () => {
    try {
      await dispatch(clearWorkerState());
      window.location.href = "/worker-registration";
    } catch (error) {
      console.error("Error during cleanup:", error);
      navigate("/home");
    }
  };

  const professions = [
    {
      name: "Electricians",
      icon: faBolt, // Different icon for each
      description: "Wiring, repairs, installations",
      count: 245,
      colorClass: "bg-yellow-50",
      iconColor: "text-yellow-500",
    },
    {
      name: "Plumbers",
      icon: faFaucet,
      description: "Leaks, installations, repairs",
      count: 189,
      colorClass: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      name: "Cleaners",
      icon: faBroom,
      description: "Home & office cleaning",
      count: 312,
      colorClass: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      name: "Carpenters",
      icon: faHammer,
      description: "Furniture & fittings",
      count: 156,
      colorClass: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      name: "Painters",
      icon: faPaintRoller,
      description: "Interior & exterior",
      count: 201,
      colorClass: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      name: "Gardeners",
      icon: faLeaf,
      description: "Landscaping & maintenance",
      count: 178,
      colorClass: "bg-teal-50",
      iconColor: "text-teal-500",
    },
  ];

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          flowType={authFlow}
        />
      )}

      {/* Hero Section */}
      <section className="hero-section bg-blue-50 pt-10 pb-16 flex-grow">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            {/* Left Side - Text Content */}
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl sm:text-md font-bold text-gray-800 mb-6"
              >
                Find Skilled Workers{" "}
                <span className="text-blue-600">Near You</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-gray-600 mb-8"
              >
                Connecting you with trusted electricians, plumbers, carpenters
                and more. Our platform makes hiring local workers fast, easy,
                and reliable.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={() => {
                    setAuthFlow("client");
                    setShowAuthModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition duration-300"
                >
                  Find Workers Now
                </button>
                <button
                  onClick={handleGetStarted}
                  className="font-semibold py-3 px-6 rounded-lg text-center transition-all duration-300"
                  style={{
                    backgroundColor: "white",
                    color: "#2563eb",
                    border: "1px solid #2563eb",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.color = "#2563eb";
                  }}
                >
                  Register as Worker
                </button>
              </motion.div>
            </div>

            {/* Right Side - Icon Illustration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="md:w-1/2 flex justify-center"
            >
              <div className="relative w-full max-w-md">
                <div className="absolute -top-8 -left-8 bg-blue-100 rounded-full w-32 h-32 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faTools}
                    className="text-blue-600 text-4xl"
                  />
                </div>
                <div className="absolute top-16 -right-8 bg-orange-100 rounded-full w-32 h-32 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faHandshake}
                    className="text-orange-600 text-4xl"
                  />
                </div>
                <div className="absolute bottom-8 left-0 bg-green-100 rounded-full w-32 h-32 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-green-600 text-4xl"
                  />
                </div>
                <div className="relative bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      How It Works
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="text-blue-600"
                          />
                        </div>
                        <span className="text-gray-700">
                          1. Search for workers
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full mr-4">
                          <FontAwesomeIcon
                            icon={faUserCheck}
                            className="text-green-600"
                          />
                        </div>
                        <span className="text-gray-700">
                          2. View profiles & ratings
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-orange-100 p-3 rounded-full mr-4">
                          <FontAwesomeIcon
                            icon={faComments}
                            className="text-orange-600"
                          />
                        </div>
                        <span className="text-gray-700">
                          3. Contact directly
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="pb-16 pt-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Popular Services
            </h2>
            <p className="text-lg text-gray-600 -mt-4 max-w-2xl mx-auto">
              Find skilled professionals for all your home and business needs
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {professions.map((profession, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition duration-300 text-center cursor-pointer hover:border-blue-200"
              >
                <div
                  className={`${profession.colorClass} w-16 h-16 rounded-full flex items-center justify-center mb-3 mx-auto`}
                >
                  <FontAwesomeIcon
                    icon={profession.icon}
                    className={`${profession.iconColor} text-2xl`}
                  />
                </div>
                <h4 className="font-medium text-gray-800 mb-2">
                  {profession.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {profession.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="pt-10 pb-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 -mt-4 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Ahmed Khan"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">Ahmed Khan</h4>
                  <p className="text-gray-500 -mt-1 text-sm">Homeowner</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Found a great electrician within minutes. The worker was
                professional and did excellent work."
              </p>
              <div className="flex mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    className="text-yellow-400"
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Fatima Ali"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">Fatima Ali</h4>
                  <p className="text-gray-500 -mt-1 text-sm">Business Owner</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The laborers I hired through this platform were hardworking and
                reliable. Will use again!"
              </p>
              <div className="flex mt-3">
                {[1, 2, 3, 4].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    className="text-yellow-400"
                  />
                ))}
                <FontAwesomeIcon icon={faStar} className="text-gray-300" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <img
                  src="https://randomuser.me/api/portraits/men/75.jpg"
                  alt="Usman Malik"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">Usman Malik</h4>
                  <p className="text-gray-500 -mt-1 text-sm">Contractor</p>
                </div>
              </div>
              <p className="text-gray-700">
                "As a worker, this platform has helped me find consistent work
                in my area. Very satisfied!"
              </p>
              <div className="flex mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    className="text-yellow-400"
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <FeedbackFormSection />

      {/* Footer */}
      <Footer
        onFindWorkersClick={() => {
          setAuthFlow("client");
          setShowAuthModal(true);
        }}
        onRegisterWorkerClick={handleGetStarted}
      />
    </div>
  );
};

export default LandingPage;
