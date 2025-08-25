// authReducer.js
import {
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  CLEAR_WORKER_STATE,
  CLEAR_FINDER_STATE,
  UPDATE_WORKER_LOCAL_PROFILE,
  UPDATE_WORKER_PROFILE_REQUEST,
  UPDATE_WORKER_PROFILE_SUCCESS,
  UPDATE_WORKER_PROFILE_FAILURE,
} from "../actions/authActions";

import {
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  VERIFY_RESET_CODE_REQUEST,
  VERIFY_RESET_CODE_SUCCESS,
  VERIFY_RESET_CODE_FAILURE,
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
  WORKER_LOGIN_REQUEST,
  WORKER_LOGIN_SUCCESS,
  WORKER_LOGIN_FAILURE,
  WORKER_LOGOUT,
  FINDER_LOGIN_REQUEST,
  FINDER_LOGIN_SUCCESS,
  FINDER_LOGIN_FAILURE,
  FINDER_LOGOUT,
} from "../../constants/authConstants";

const initialState = {
 
  // Worker authentication state
  worker: {
    loading: false,
    isAuthenticated: false,
    userInfo: null,
    error: null,
    uid: null,
  },

  // Finder authentication state
  finder: {
    loading: false,
    isAuthenticated: false,
    userInfo: null,
    error: null,
    uid: null,
  },

  // Update profile state
  updateProfile: {
    loading: false,
    error: null,
    success: false,
  },

  // Password change state
  changingPassword: false,
  passwordChangeError: null,
  passwordChangeSuccess: null,

  // Password reset state
  passwordReset: {
    loading: false,
    error: null,
    email: null,
    step: "idle",
    verification: {
      loading: false,
      error: null,
    },
    reset: {
      loading: false,
      error: null,
    },
  },
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    // WORKER AUTHENTICATION CASES
    case WORKER_LOGIN_REQUEST:
      return {
        ...state,
        worker: {
          ...state.worker,
          loading: true,
          error: null,
        },
      };

    case WORKER_LOGIN_SUCCESS:
      return {
        ...state,
        worker: {
          ...state.worker,
          loading: false,
          isAuthenticated: true,
          userInfo: {
            ...action.payload,
            averageRating: action.payload.averageRating || 0,
            feedbackCount: action.payload.feedbackCount || 0,
          },
          uid: action.payload.uid,
          error: null,
        },
      };

    case WORKER_LOGIN_FAILURE:
      return {
        ...state,
        worker: {
          ...state.worker,
          loading: false,
          isAuthenticated: false,
          userInfo: null,
          error: action.payload,
        },
      };

    case WORKER_LOGOUT:
    case CLEAR_WORKER_STATE:
      return {
        ...state,
        worker: initialState.worker,
      };

    // FINDER AUTHENTICATION CASES
    case FINDER_LOGIN_REQUEST:
      return {
        ...state,
        finder: {
          ...state.finder,
          loading: true,
          error: null,
        },
      };

    case FINDER_LOGIN_SUCCESS:
      return {
        ...state,
        finder: {
          ...state.finder,
          loading: false,
          isAuthenticated: true,
          userInfo: action.payload.userInfo,
          uid: action.payload.uid,
          error: null,
        },
      };

    case FINDER_LOGIN_FAILURE:
      return {
        ...state,
        finder: {
          ...state.finder,
          loading: false,
          isAuthenticated: false,
          userInfo: null,
          error: action.payload,
        },
      };

    case FINDER_LOGOUT:
    case CLEAR_FINDER_STATE:
      return {
        ...state,
        finder: initialState.finder,
      };

    // SIGNUP CASES (for finders)
    case SIGNUP_REQUEST:
      return {
        ...state,
        finder: {
          ...state.finder,
          loading: true,
          error: null,
        },
      };

    case SIGNUP_SUCCESS:
      return {
        ...state,
        finder: {
          ...state.finder,
          loading: false,
          isAuthenticated: true,
          userInfo: action.payload,
          uid: action.payload.uid,
          error: null,
        },
      };

    case SIGNUP_FAILURE:
      return {
        ...state,
        finder: {
          ...state.finder,
          loading: false,
          error: action.payload,
        },
      };

    // PASSWORD CHANGE CASES
    case CHANGE_PASSWORD_REQUEST:
      return {
        ...state,
        changingPassword: true,
        passwordChangeError: null,
        passwordChangeSuccess: null,
      };

    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        changingPassword: false,
        passwordChangeError: null,
        passwordChangeSuccess: action.payload,
      };

    case CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        changingPassword: false,
        passwordChangeError: action.payload,
        passwordChangeSuccess: null,
      };

    // PROFILE UPDATE CASES
    case UPDATE_WORKER_PROFILE_REQUEST:
      return {
        ...state,
        updateProfile: {
          loading: true,
          error: null,
          success: false,
        },
      };

    case UPDATE_WORKER_PROFILE_SUCCESS:
      return {
        ...state,
        worker: {
          ...state.worker,
          userInfo: {
            ...state.worker.userInfo,
            ...action.payload,
          },
        },
        updateProfile: {
          loading: false,
          error: null,
          success: true,
        },
      };

    case UPDATE_WORKER_PROFILE_FAILURE:
      return {
        ...state,
        updateProfile: {
          loading: false,
          error: action.payload,
          success: false,
        },
      };

    case UPDATE_WORKER_LOCAL_PROFILE:
      return {
        ...state,
        worker: {
          ...state.worker,
          userInfo: {
            ...state.worker.userInfo,
            ...action.payload,
          },
        },
      };

    case "UPDATE_WORKER_RATINGS":
      return {
        ...state,
        worker: {
          ...state.worker,
          userInfo: {
            ...state.worker.userInfo,
            averageRating: action.payload.averageRating,
            feedbackCount: action.payload.feedbackCount,
          },
        },
      };

    // EMAIL CHANGE CASES
    case "CHANGE_EMAIL_SUCCESS":
      return {
        ...state,
        worker: {
          ...state.worker,
          userInfo: {
            ...state.worker.userInfo,
            email: action.payload,
            emailVerified: false,
          },
        },
      };

    case "CHANGE_EMAIL_FAILURE":
      return {
        ...state,
        worker: {
          ...state.worker,
          error: action.payload, // ← CORRECT: Set error in worker state
        },
      };

    // PASSWORD RESET CASES
    case FORGOT_PASSWORD_REQUEST:
      return {
        ...state,
        passwordReset: {
          ...state.passwordReset,
          loading: true,
          error: null,
          step: "idle",
        },
      };

    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        passwordReset: {
          ...state.passwordReset,
          loading: false,
          email: action.payload.email,
          error: null,
          step: "email_sent",
        },
      };

    case FORGOT_PASSWORD_FAILURE:
      return {
        ...state,
        passwordReset: {
          ...state.passwordReset,
          loading: false,
          error: action.payload,
          step: "idle",
        },
      };

    case VERIFY_RESET_CODE_REQUEST:
      return {
        ...state,
        passwordReset: {
          ...state.passwordReset,
          verification: {
            loading: true,
            error: null,
          },
        },
      };

    case VERIFY_RESET_CODE_SUCCESS:
      return {
        ...state,
        passwordReset: {
          ...state.passwordReset,
          verification: {
            loading: false,
            error: null,
          },
        },
      };

    case VERIFY_RESET_CODE_FAILURE:
      return {
        ...state,
        passwordReset: {
          ...state.passwordReset,
          verification: {
            loading: false,
            error: action.payload,
          },
        },
      };

    case RESET_PASSWORD_REQUEST:
      return {
        ...state,
        passwordReset: {
          ...state.passwordReset,
          reset: {
            loading: true,
            error: null,
          },
        },
      };

    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        passwordReset: {
          ...initialState.passwordReset,
          step: "reset_complete",
        },
      };

    case RESET_PASSWORD_FAILURE:
      return {
        ...state,
        passwordReset: {
          ...state.passwordReset,
          reset: {
            loading: false,
            error: action.payload,
          },
        },
      };

    default:
      return state;
  }
};

export default authReducer;
