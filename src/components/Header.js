import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import SignInModal from "./SignInModal";
import { useDispatch, useSelector } from "react-redux";
import { clearWorkerState } from "../redux/actions/authActions";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Header = () => {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // FIXED: Properly memoized selectors
  const isAuthenticated = useSelector(
    (state) => state.auth.worker.isAuthenticated
  );
  const userInfo = useSelector((state) => state.auth.worker.userInfo);

  // Debug: Log authentication state
  // useEffect(() => {
  //   console.log("Auth state:", { isAuthenticated, userInfo });
  // }, [isAuthenticated, userInfo, location.pathname]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignInClick = () => {
    setShowSignInModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleCloseModal = () => {
    setShowSignInModal(false);
  };

  const handleRegisterClick = () => {
    setShowSignInModal(false);
    navigate("/worker-registration");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await dispatch(clearWorkerState());
    navigate("/home");
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking on links or outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const mobileMenu = document.querySelector(".mobile-menu-container");
      const menuButton = document.querySelector(".mobile-menu-button");

      if (
        isMobileMenuOpen &&
        mobileMenu &&
        menuButton &&
        !mobileMenu.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Don't render header on landing page (if that's what you want)
  if (location.pathname === "/") {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center p-3">
          <div className="flex items-center">
            <Link
              to={isAuthenticated ? "/account" : "/home"}
              className="text-2xl font-bold text-blue-600 no-underline hover:text-blue-700 transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FindLocalWorker
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `text-lg font-semibold no-underline transition-colors duration-300 ${
                  isActive ? "text-blue-600 font-bold" : "text-gray-800"
                } hover:text-blue-600`
              }
            >
              Home
            </NavLink>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-4">
                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-1 rounded-md transition-colors duration-200 no-underline ${
                      isActive ? "bg-blue-200" : "hover:bg-blue-200"
                    }`
                  }
                >
                  <div className="relative">
                    {userInfo?.url ? (
                      <img
                        src={userInfo.url}
                        alt={userInfo.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {userInfo?.name?.charAt(0).toUpperCase() || "W"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium mb-0 text-gray-800">
                      {userInfo?.name || "Worker"}
                    </p>
                    <p className="text-xs mb-0 text-gray-600">
                      {userInfo?.email || ""}
                    </p>
                  </div>
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-800 transition-colors duration-200"
                >
                  <span className="text-md font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <NavLink
                  to="/worker-registration"
                  className={({ isActive }) =>
                    `text-lg font-semibold no-underline transition-colors duration-300 ${
                      isActive ? "text-blue-600 font-bold" : "text-gray-800"
                    } hover:text-blue-600`
                  }
                >
                  Register as Worker
                </NavLink>

                <button
                  onClick={handleSignInClick}
                  className="text-lg font-semibold text-gray-800 no-underline hover:text-blue-600 transition-colors duration-300 cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button md:hidden text-gray-800 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon
              icon={isMobileMenuOpen ? faTimes : faBars}
              className="text-2xl"
            />
          </button>
        </div>

        {/* Mobile Menu - Full Screen */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-container fixed inset-0 bg-white z-40 mt-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col h-full px-6">
              {/* Home Link - Centered */}
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  `text-xl font-semibold no-underline py-4 text-center transition-colors duration-300 ${
                    isActive ? "text-blue-600 font-bold" : "text-gray-800"
                  } hover:text-blue-600 border-b border-gray-200`
                }
                onClick={toggleMobileMenu}
              >
                Home
              </NavLink>

              {isAuthenticated ? (
                <>
                  {/* Account Link - Centered */}
                  <div className="flex justify-center border-b border-gray-200">
                    <NavLink
                      to="/account"
                      className={({ isActive }) =>
                        `flex items-center space-x-4 py-4 transition-colors duration-200 no-underline ${
                          isActive ? "bg-blue-100" : "hover:bg-blue-100"
                        }`
                      }
                      onClick={toggleMobileMenu}
                    >
                      <div className="relative">
                        {userInfo?.url ? (
                          <img
                            src={userInfo.url}
                            alt={userInfo.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-lg font-medium">
                              {userInfo?.name?.charAt(0).toUpperCase() || "W"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-medium mb-0 text-gray-800">
                          {userInfo?.name || "Worker"}
                        </p>
                        <p className="text-sm mb-0 text-gray-600">
                          {userInfo?.email || ""}
                        </p>
                      </div>
                    </NavLink>
                  </div>

                  {/* Sign Out Button - Now properly centered */}
                  <div className="border-b border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full py-4 text-center text-gray-800 hover:text-blue-600 transition-colors duration-200 text-lg font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Register Link - Centered */}
                  <NavLink
                    to="/worker-registration"
                    className={({ isActive }) =>
                      `text-xl font-semibold no-underline py-4 text-center transition-colors duration-300 ${
                        isActive ? "text-blue-600 font-bold" : "text-gray-800"
                      } hover:text-blue-600 border-b border-gray-200`
                    }
                    onClick={toggleMobileMenu}
                  >
                    Register as Worker
                  </NavLink>

                  {/* Sign In Button - Centered */}
                  <button
                    onClick={handleSignInClick}
                    className="w-full py-4 text-center text-gray-800 hover:text-blue-600 transition-colors duration-300 text-xl font-semibold border-b border-gray-200"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {showSignInModal && (
        <SignInModal
          onClose={handleCloseModal}
          onRegisterClick={handleRegisterClick}
        />
      )}
    </>
  );
};

export default Header;
