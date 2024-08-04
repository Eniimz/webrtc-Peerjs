import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        name: null,
        roomId: "",
        remoteUsername: ""
    },
    reducers: {
        populateUsername: (state, action) => {
            state.name = action.payload
        },
        populateRoomId: (state, action) => {
            state.roomId = action.payload
        },
        populateRemoteUsername: (state, action) => {
            state.remoteUsername = action.payload
        }
    }
})

export default userSlice.reducer;
export const { populateUsername, populateRoomId, populateRemoteUsername } = userSlice.actions