import {
  FEEDBACK_SUBMIT_REQUEST,
  FEEDBACK_SUBMIT_SUCCESS,
  FEEDBACK_SUBMIT_FAIL,
  FETCH_FEEDBACKS_REQUEST,
  FETCH_FEEDBACKS_SUCCESS,
  FETCH_FEEDBACKS_FAIL
} from '../../constants/feedbackConstants';
const initialState = {
  feedbacks: [],
  fetchLoading: false,
  fetchError: null,
  submitLoading: false,
  submitError: null,
  submitSuccess: false
};

export const feedbackReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FEEDBACKS_REQUEST:
      return { ...state, fetchLoading: true, fetchError: null };

    case FETCH_FEEDBACKS_SUCCESS:
      return { 
        ...state, 
        fetchLoading: false, 
        feedbacks: action.payload || [], // Ensure feedbacks is always an array
        fetchError: null 
      };

    case FETCH_FEEDBACKS_FAIL:
      return { 
        ...state, 
        fetchLoading: false, 
        fetchError: action.payload,
        feedbacks: [] // Reset feedbacks on error
      };

    case FEEDBACK_SUBMIT_REQUEST:
      return { ...state, submitLoading: true, submitError: null, submitSuccess: false };

    case FEEDBACK_SUBMIT_SUCCESS:
      return { 
        ...state, 
        submitLoading: false,
        submitSuccess: true,
        feedbacks: [action.payload, ...(state.feedbacks || [])] // Ensure we're working with an array
      };

    case FEEDBACK_SUBMIT_FAIL:
      return { ...state, submitLoading: false, submitError: action.payload };

    default:
      return state;
  }
};

