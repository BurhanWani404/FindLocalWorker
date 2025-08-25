const initialState = {
  loading: false,
  worker: null,
  error: null,
  success: false // Make sure this is here
};

const workerReducer = (state = initialState, action) => {
  switch (action.type) {
    case "WORKER_REGISTER_REQUEST":
      return { ...state, loading: true, error: null, success: false };
    case "WORKER_REGISTER_SUCCESS":
      return { 
        ...state, 
        loading: false, 
        worker: action.payload, 
        error: null,
        success: true // Set success to true on success
      };
    case "WORKER_REGISTER_FAIL":
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        success: false 
      };
    case "RESET_REGISTRATION":
      return initialState;
    default:
      return state;
  }
};

export default workerReducer;