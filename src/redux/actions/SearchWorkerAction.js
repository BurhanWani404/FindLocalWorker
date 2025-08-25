import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

export const getWorkers = () => async (dispatch) => {
  try {
    dispatch({ type: "WORKERS_LIST_REQUEST" });

    // 1. First fetch all worker documents
    const workersSnapshot = await getDocs(collection(db, "workers"));

    // 2. Process each worker to calculate average ratings
    const workersWithRatings = await Promise.all(
      workersSnapshot.docs.map(async (workerDoc) => {
        // Get the auto-generated document ID as workerId
        const workerId = workerDoc.id;

        // 3. Query feedbacks collection for this worker
        const feedbacksQuery = query(
          collection(db, "feedbacks"),
          where("workerId", "==", workerId)
        );
        const feedbacksSnapshot = await getDocs(feedbacksQuery);

        // 4. Calculate average rating
        let totalRating = 0;
        let feedbackCount = 0;

        feedbacksSnapshot.forEach((feedbackDoc) => {
          const feedbackData = feedbackDoc.data();
          totalRating += feedbackData.rating;
          feedbackCount++;
        });

        const averageRating =
          feedbackCount > 0 ? totalRating / feedbackCount : 0; // Default to 0 if no feedbacks

        // 5. Return enhanced worker data with rating info
        return {
          id: workerId,
          ...workerDoc.data(),
          averageRating,
          feedbackCount,
        };
      })
    );

    // 6. Dispatch success with workers including their ratings
    dispatch({
      type: "WORKERS_LIST_SUCCESS",
      payload: workersWithRatings,
    });
  } catch (error) {
    dispatch({
      type: "WORKERS_LIST_FAIL",
      payload: error.message,
    });
  }
};
