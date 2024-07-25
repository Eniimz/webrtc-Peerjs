import { configureStore } from '@reduxjs/toolkit';
import socketReducer from "./socketSlice"
import peerReducer from "./peerSlice"

const store = configureStore({
    reducer: {
        socket: socketReducer,
        peer: peerReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
})

export default store;