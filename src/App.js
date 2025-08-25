import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import ProtectedHeader from "./components/ProtectedHeader";
import Home from "./pages/Home";
import WorkerRegistration from "./pages/WorkerRegistratoin";
import Home2 from "./pages/Home2";
import SearchWorker from "./pages/SearchWorker";
import SignInToAccount from "./pages/SignInToAccount";
import LandingPage from "./pages/LandingPage";
import { auth, db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";

// Updated PublicLayout to conditionally show header
const PublicLayout = () => {
  const location = useLocation();
  const showHeader = location.pathname !== "/";

  return (
    <>
      {showHeader && <Header showWorkerLinks={true} />}
      <Outlet />
    </>
  );
};

const ClientLayout = () => (
  <>
    <ProtectedHeader />
    <Outlet />
  </>
);

const WorkerLayout = () => (
  <>
    <Header showWorkerLinks={false} />
    <Outlet />
  </>
);

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is a finder (client)
          const finderDoc = await getDoc(doc(db, "finders", user.uid));
          if (finderDoc.exists()) {
            const userData = finderDoc.data();
            dispatch({
              type: "LOGIN_SUCCESS",
              payload: {
                uid: user.uid,
                userType: "finder",
                userInfo: {
                  uid: user.uid,
                  ...userData,
                },
              },
            });
          } else {
            // Check if user is a worker
            const workerDoc = await getDoc(doc(db, "workers", user.uid));
            if (workerDoc.exists()) {
              const workerData = workerDoc.data();

              // Calculate average rating
              const feedbacksRef = collection(db, "feedbacks");
              const q = query(feedbacksRef, where("workerId", "==", user.uid));
              const querySnapshot = await getDocs(q);

              let averageRating = 0;
              let feedbackCount = 0;

              if (!querySnapshot.empty) {
                const ratings = querySnapshot.docs
                  .map((doc) => doc.data().rating)
                  .filter((r) => typeof r === "number");
                feedbackCount = ratings.length;
                averageRating =
                  feedbackCount > 0
                    ? ratings.reduce((sum, rating) => sum + rating, 0) /
                      feedbackCount
                    : 0;
              }

              dispatch({
                type: "WORKER_LOGIN_SUCCESS",
                payload: {
                  uid: user.uid,
                  ...workerData,
                  averageRating,
                  feedbackCount,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        dispatch({ type: "LOGOUT" });
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/worker-registration" element={<WorkerRegistration />} />
        </Route>

        {/* Client/Finder Routes */}
        <Route element={<ClientLayout />}>
      
          <Route path="/search-worker" element={<SearchWorker />} />
        </Route>

        {/* Worker Routes */}
        <Route element={<WorkerLayout />}>
          <Route path="/account" element={<SignInToAccount />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
