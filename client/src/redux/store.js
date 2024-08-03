import { configureStore } from '@reduxjs/toolkit';
import socketReducer from "./socketSlice"
import peerReducer from "./peerSlice"
import userReducer from "./userSlice"

const store = configureStore({
    reducer: {
        socket: socketReducer,
        peer: peerReducer,
        user: userReducer

    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
})

export default store;