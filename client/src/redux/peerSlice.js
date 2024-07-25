import { createSlice } from '@reduxjs/toolkit';
import { act } from 'react';

const peerSlice = createSlice({
    name: 'peer',
    initialState: {
        peer: '',
        peerId: null
    },
    reducers: {
        populatePeer: (state, action) => {
            state.peer = action.payload;
        },
        populatePeerId: (state, action) => {
            state.peerId = action.payload;
        }
    }
})

export default peerSlice.reducer;
export const { populatePeer, populatePeerId } = peerSlice.actions;