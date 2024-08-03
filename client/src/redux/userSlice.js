import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        name: null,
        roomId: ""
    },
    reducers: {
        populateUsername: (state, action) => {
            state.name = action.payload
        },
        populateRoomId: (state, action) => {
            state.roomId = action.payload
        }
    }
})

export default userSlice.reducer;
export const { populateUsername, populateRoomId } = userSlice.actions