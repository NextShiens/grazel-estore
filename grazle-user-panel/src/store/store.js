import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { featuresReducer } from "@/features/features";

const persistConfig = {
  key: 'root',
  storage,
  // Optionally, you can blacklist certain parts of the state from being persisted
  // blacklist: ['somePartOfState']
};

const persistedReducer = persistReducer(persistConfig, featuresReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export const persistor = persistStore(store);