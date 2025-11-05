import { configureStore } from '@reduxjs/toolkit';
import { userApi } from './features/user/user-api';
import layoutSlice from './features/layout/layout-slice';

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    layout: layoutSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(userApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
