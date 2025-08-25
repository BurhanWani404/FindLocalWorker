import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import SignInModal from "./SignInModal";
import { clearFinderState } from "../redux/actions/authActions";

const ProtectedHeader = () => {
  const isAuthenticated = useSelector(
    (state) => state.auth.finder.isAuthenticated
  );
  const userInfo = useSelector((state) => state.auth.finder.userInfo);

  const [showSignInModal, setShowSignInModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const handleBackButton = (e) => {
      if (!isAuthenticated) {
        e.preventDefault();
        setShowSignInModal(true);
        navigate("/", { replace: true });
      }
    };
    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await dispatch(clearFinderState());
      localStorage.removeItem("persist:root");
      sessionStorage.removeItem("persist:root");
      navigate("/", { replace: true });
      window.history.pushState(null, "", "/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="fixed top-0 left-0 w-full z-50 bg-white shadow-md border-b border-gray-200"
      >
        <div className="container mx-auto flex justify-between items-center p-3">
          {/* Logo - always visible */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/search-worker"
              className="text-2xl font-bold text-blue-600 no-underline hover:text-blue-700 transition-colors duration-300"
            >
              FindLocalWorker
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="hidden md:flex space-x-8 items-center"
          >
            <motion.div variants={itemVariants}>
              <NavLink
                to="/search-worker"
                className={({ isActive }) =>
                  `text-lg font-semibold no-underline transition-all duration-300 ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-gray-800 hover:text-blue-600"
                  }`
                }
              >
                Find Workers
              </NavLink>
            </motion.div>

            {userInfo && (
              <motion.div variants={itemVariants} className="relative ml-4">
                <div className="flex items-center space-x-4">
                  {/* Profile Picture + Tooltip */}
                  <div className="relative group">
                    {userInfo.profileImage ? (
                      <img
                        src={userInfo.profileImage}
                        alt={userInfo.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 cursor-pointer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer">
                        <span className="text-blue-600 font-medium">
                          {userInfo.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Tooltip */}
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <p className="font-medium mb-1">{userInfo.fullName}</p>
                      <p className="text-xs text-gray-300 mb-0">
                        {userInfo.email}
                      </p>
                    </div>
                  </div>

                  {/* Name and Email - Right side of image (vertical layout) */}
                  <div className="hidden md:flex flex-col items-start">
                    <p className="text-sm -ml-1 font-medium mb-1 text-gray-800 leading-tight">
                      {userInfo.fullName}
                    </p>
                    <p className="text-xs -ml-1 text-gray-500 mb-0 truncate max-w-[160px]">
                      {userInfo.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-800 transition-colors duration-200"
                  >
                    <span className="text-md font-medium">Sign out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          {userInfo && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-gray-700 focus:outline-none"
            >
              {mobileOpen ? (
                <XMarkIcon className="h-8 w-8" />
              ) : (
                <Bars3Icon className="h-8 w-8" />
              )}
            </button>
          )}
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && userInfo && (
            <motion.div
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -200, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="md:hidden bg-white shadow-md border-t border-gray-200 p-6 flex flex-col items-center space-y-5"
            >
              {/* Find Workers link FIRST */}
              <NavLink
                to="/search-worker"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-lg font-semibold no-underline transition-all duration-300 ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-gray-800 hover:text-blue-600"
                  }`
                }
              >
                Find Workers
              </NavLink>

              {/* Profile Section */}
              <div className="flex items-center space-x-4">
                {userInfo.profileImage ? (
                  <img
                    src={userInfo.profileImage}
                    alt={userInfo.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-xl">
                      {userInfo.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <p className="text-base font-medium mb-1 text-gray-800">
                    {userInfo.fullName}
                  </p>
                  <p className="text-sm mb-0 text-gray-500">{userInfo.email}</p>
                </div>
              </div>

              {/* Sign out button (auto width) */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 transition-colors duration-200"
              >
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Sign-in modal */}
      <AnimatePresence>
        {showSignInModal && (
          <SignInModal
            onClose={() => {
              setShowSignInModal(false);
              navigate("/");
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProtectedHeader;
