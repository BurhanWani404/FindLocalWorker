export const workersListReducer = (state = { workers: [] }, action) => {
  switch (action.type) {
    case "WORKERS_LIST_REQUEST":
      // Initial state when loading workers
      return {
        loading: true,
        workers: [],
      };

    case "WORKERS_LIST_SUCCESS":
      // Success state with workers data including calculated ratings
      return {
        loading: false,
        workers: action.payload, // Contains workers with averageRating and feedbackCount
        error: null,
      };

    case "WORKERS_LIST_FAIL":
      // Error state if fetching fails
      return {
        loading: false,
        error: action.payload,
        workers: [],
      };

    default:
      return state;
  }
};
