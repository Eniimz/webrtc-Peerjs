import { createSlice } from "@reduxjs/toolkit";

export const socketSlice = createSlice({
    name: 'socket',
    initialState: {
        socket: ""
    },
    reducers: {
        populateSocket: (state, action) => {
            state.socket = action.payload;
        }
    }
})          

export const { populateSocket } = socketSlice.actions;
export default socketSlice.reducer;
