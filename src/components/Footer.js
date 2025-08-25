import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

const Footer = ({ onFindWorkersClick, onRegisterWorkerClick }) => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3">Find Local Worker</h3>
            <p className="text-gray-400">
              Connecting skilled workers with those who need their services.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 -ml-7">
              <li>
                <a
                  href="/"
                  className="text-gray-400 hover:text-white no-underline transition"
                >
                  Home
                </a>
              </li>
              <li>
                <button
                  onClick={onFindWorkersClick}
                  className="text-gray-400 hover:text-white transition text-left bg-transparent border-none p-0"
                >
                  Find Workers
                </button>
              </li>
              <li>
                <button
                  onClick={onRegisterWorkerClick}
                  className="text-gray-400 hover:text-white transition text-left bg-transparent border-none p-0"
                >
                  Register as Worker
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact Us</h4>
            <ul className="space-y-2 text-gray-400 -ml-7">
              <li className="flex items-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                <span>Samar Bagh, Dir Lower, KPK</span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                <span>info@findlocalworker.com</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Follow Us</h4>
            <div className="flex space-x-4">
              <button 
                className="text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebook} className="text-xl" />
              </button>
              <button 
                className="text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer"
                aria-label="Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} className="text-xl" />
              </button>
              <button 
                className="text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} className="text-xl" />
              </button>
              <button 
                className="text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} className="text-xl" />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Find Local Worker. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;