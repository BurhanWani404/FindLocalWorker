import { createStore, combineReducers, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { thunk } from "redux-thunk";
import workerReducer from "../reducers/workerReducer";
import { workersListReducer } from "../reducers/SearchWorkerReducer";
import authReducer from "../reducers/authReducer";
import { feedbackReducer } from "../reducers/feedbackReducer";

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist the auth reducer
};

// Combine all reducers
const rootReducer = combineReducers({
  worker: workerReducer,
  workersList: workersListReducer,
  auth: authReducer,
  feedbackReducer: feedbackReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with redux-thunk middleware
const store = createStore(persistedReducer, applyMiddleware(thunk));

// Create persistor
export const persistor = persistStore(store);

export default store;
