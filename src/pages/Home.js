import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTools,
  faUserShield,
  faChartLine,
  faMoneyBillWave,

  faMapMarkerAlt,

  faStar,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from "react-redux";
import { clearWorkerState } from "../redux/actions/authActions";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import FeedbackFormSection from "../components/FeedbackFormSection";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { worker } = useSelector(state => state.auth);
  
  // This ensures the auth state is available
  console.log('Worker auth state:', worker);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authFlow, setAuthFlow] = useState("worker");

  // useEffect(() => {
  //   dispatch(clearWorkerState());
  // }, [dispatch]);

  const handleRegisterClick = () => {
    navigate("/worker-registration");
  };

  const handleSearchClick = () => {
    setAuthFlow("client");
    setShowAuthModal(true);
  };
  const handleGetStarted = async () => {
    try {
      await dispatch(clearWorkerState());
      window.location.href = "/worker-registration";
    } catch (error) {
      console.error("Error during cleanup:", error);
      navigate("/home");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-blue-700 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Text Content - Left Side */}
            <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-10 z-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl font-bold mb-6 leading-snug"
              >
                Find Trusted <span className="text-white">Local Workers</span>{" "}
                in Your Area
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg mb-8 text-blue-100 max-w-md"
              >
                Connect directly with verified professionals or showcase your
                skills to potential clients.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={handleRegisterClick}
                  className="bg-white hover:bg-blue-700 text-blue-700 font-bold py-3 px-4 rounded-lg text-lg transition duration-300"
                >
                  Register as Worker
                </button>
                <button
                  onClick={handleSearchClick} // This will now show the modal
                  className="bg-blue-600 hover:bg-blue-900 text-white font-semibold py-3 px-4 rounded-lg text-center transition duration-300"
                >
                  Find Workers Now
                </button>
              </motion.div>
            </div>

            {/* Right Side Card - Your Design */}
            <div className="lg:w-1/2 flex justify-center z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative"
              >
                <div className="bg-white text-black p-8 rounded-2xl shadow-xl w-full max-w-md">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-700 text-white p-6 rounded-full mb-6">
                      <FontAwesomeIcon icon={faTools} className="text-5xl" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-black">
                      Worker Benefits
                    </h3>
                    <ul className="space-y-3 text-left text-gray-800 w-full">
                      <li className="flex items-start">
                        <FontAwesomeIcon
                          icon={faStar}
                          className="text-blue-700 mt-1 mr-2"
                        />
                        <span>Get rated by clients</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon
                          icon={faMoneyBillWave}
                          className="text-blue-700 mt-1 mr-2"
                        />
                        <span>Set your own rates</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-blue-700 mt-1 mr-2"
                        />
                        <span>Work in your local area</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white transform skew-y-1 -mb-6 z-0"></div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Register With Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're dedicated to helping skilled workers like you succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: faUserShield,
                title: "Verified Profile",
                description:
                  "Build trust with clients through our verification system",
                color: "text-blue-600",
              },
              {
                icon: faChartLine,
                title: "More Opportunities",
                description:
                  "Get discovered by clients actively searching for your skills",
                color: "text-green-600",
              },
              {
                icon: faMoneyBillWave,
                title: "Better Earnings",
                description:
                  "Set competitive rates and get paid fairly for your work",
                color: "text-yellow-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 p-8 text-center rounded-xl border border-gray-200 hover:shadow-lg transition duration-300"
              >
                <div className={`${feature.color} text-4xl mb-4`}>
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              How It Works For Workers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl -mt-4 mx-auto">
              Simple steps to start getting more clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Create Profile",
                description: "Showcase your skills, experience and services",
                icon: faUserShield,
              },
              {
                step: "2",
                title: "Get Discovered",
                description: "Clients in your area find and contact you",
                icon: faSearch,
              },
              {
                step: "3",
                title: "Do Great Work",
                description: "Complete jobs to satisfaction",
                icon: faTools,
              },
              {
                step: "4",
                title: "Build Reputation",
                description: "Gather reviews and ratings",
                icon: faStar,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center"
              >
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4 mx-auto">
                  {item.step}
                </div>
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-blue-600 text-3xl mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials from Workers */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl -mt-4 mx-auto">
              Hear from workers who've grown their business with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Ahmed Khan",
                profession: "Electrician",
                quote: "My client base doubled within 2 months of joining",
                rating: 5,
                image: "https://randomuser.me/api/portraits/men/32.jpg",
              },
              {
                name: "Fatima Ali",
                profession: "Plumber",
                quote: "I can now set my own rates and work on my terms",
                rating: 4,
                image: "https://randomuser.me/api/portraits/women/44.jpg",
              },
              {
                name: "Usman Malik",
                profession: "Carpenter",
                quote: "The platform helped me establish my reputation",
                rating: 5,
                image: "https://randomuser.me/api/portraits/men/75.jpg",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div className="">
                    <h4 className="font-semibold text-gray-800">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {testimonial.profession}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={
                        i < testimonial.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FeedbackFormSection />

      {/* Footer */}
      <Footer
        onFindWorkersClick={() => {
          setAuthFlow("client");
          setShowAuthModal(true);
        }}
        onRegisterWorkerClick={handleGetStarted}
      />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          flowType={authFlow}
        />
      )}
    </div>
  );
};

export default Home;
