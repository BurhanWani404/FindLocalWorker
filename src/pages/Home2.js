import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faShieldAlt,
  faClock,
  faMoneyBillWave,
  faMapMarkerAlt,
  faStar,
  faUserTie,
  faCheckCircle,
  faPhoneAlt,
  faComments,
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch } from "react-redux";
import { clearFinderState } from "../redux/actions/authActions";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import FeedbackFormSection from "../components/FeedbackFormSection";

const FinderHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authFlow, setAuthFlow] = useState("client");

  useEffect(() => {
    dispatch(clearFinderState());
  }, [dispatch]);

  const handleSearchClick = () => {
    navigate("/find-workers");
  };

  const handleRegisterClick = () => {
    setAuthFlow("worker");
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-indigo-700 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800"></div>
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
                Find <span className="text-white">Skilled Workers</span> Near
                You
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg mb-8 text-indigo-100 max-w-md"
              >
                Connect with verified professionals for all your home service
                needs - electricians, plumbers, carpenters and more.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={handleSearchClick}
                  className="bg-white hover:bg-indigo-800 text-indigo-700 hover:text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-300"
                >
                  Find Workers Now
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="bg-indigo-600 hover:bg-indigo-900 text-white font-semibold py-3 px-4 rounded-lg text-center transition duration-300"
                >
                  Register as Worker
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
                    <div className="bg-indigo-700 text-white p-6 rounded-full mb-6">
                      <FontAwesomeIcon icon={faSearch} className="text-5xl" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-black">
                      Finder Benefits
                    </h3>
                    <ul className="space-y-3 text-left text-gray-800 w-full">
                      <li className="flex items-start">
                        <FontAwesomeIcon
                          icon={faShieldAlt}
                          className="text-indigo-700 mt-1 mr-2"
                        />
                        <span>Verified worker profiles</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon
                          icon={faMoneyBillWave}
                          className="text-indigo-700 mt-1 mr-2"
                        />
                        <span>Transparent pricing</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-indigo-700 mt-1 mr-2"
                        />
                        <span>Local professionals near you</span>
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
              Why Use Our Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make finding reliable local workers simple and stress-free
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: faShieldAlt,
                title: "Verified Workers",
                description:
                  "All workers are verified with experience and skill validation",
                color: "text-indigo-600",
              },
              {
                icon: faClock,
                title: "Save Time",
                description:
                  "Find qualified workers in minutes instead of days",
                color: "text-green-600",
              },
              {
                icon: faMoneyBillWave,
                title: "Fair Pricing",
                description: "Compare rates and choose what fits your budget",
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
              How It Works For Customers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl -mt-4 mx-auto">
              Simple steps to find the right professional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Search",
                description: "Filter by profession, location and budget",
                icon: faSearch,
              },
              {
                step: "2",
                title: "Compare",
                description: "View profiles, ratings and pricing",
                icon: faUserTie,
              },
              {
                step: "3",
                title: "Contact",
                description: "Reach out directly via call or WhatsApp",
                icon: faPhoneAlt,
              },
              {
                step: "4",
                title: "Review",
                description: "Share your experience to help others",
                icon: faComments,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center"
              >
                <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4 mx-auto">
                  {item.step}
                </div>
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-indigo-600 text-3xl mb-4"
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

      {/* Popular Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Popular Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find skilled professionals for all your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                name: "Electricians",
                icon: faCheckCircle,
                color: "bg-blue-100 text-blue-600",
              },
              {
                name: "Plumbers",
                icon: faCheckCircle,
                color: "bg-green-100 text-green-600",
              },
              {
                name: "Carpenters",
                icon: faCheckCircle,
                color: "bg-yellow-100 text-yellow-600",
              },
              {
                name: "Mechanics",
                icon: faCheckCircle,
                color: "bg-red-100 text-red-600",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center cursor-pointer hover:shadow-md transition duration-300"
              >
                <div
                  className={`${service.color} w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto`}
                >
                  <FontAwesomeIcon icon={service.icon} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {service.name}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials from Customers */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl -mt-4 mx-auto">
              Hear from people who found great workers through our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Ali Khan",
                location: "Samar Bagh",
                quote:
                  "Found an excellent electrician within 10 minutes of searching",
                rating: 5,
                image: "https://randomuser.me/api/portraits/men/42.jpg",
              },
              {
                name: "Sara Ahmed",
                location: "Dir",
                quote:
                  "The plumber I hired was professional and reasonably priced",
                rating: 4,
                image: "https://randomuser.me/api/portraits/women/33.jpg",
              },
              {
                name: "Usman Malik",
                location: "Timergara",
                quote: "Saved me days of searching for a reliable carpenter",
                rating: 5,
                image: "https://randomuser.me/api/portraits/men/65.jpg",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
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
                      {testimonial.location}
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
        onFindWorkersClick={handleSearchClick}
        onRegisterWorkerClick={handleRegisterClick}
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

export default FinderHome;
