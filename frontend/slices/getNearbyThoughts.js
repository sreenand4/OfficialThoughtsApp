import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { listNearbyThoughtsWithAuthor } from "../utils/customQueries";
import { generateClient } from "aws-amplify/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getNearbyThoughts = createAsyncThunk(
    "data/nearby", async (hash) => {
        const slicedHash = hash.slice(0, 5)
        const client = generateClient();
        try {
            const response = await client.graphql({
                query: listNearbyThoughtsWithAuthor,
                variables: {
                    filter: {
                        geohash: {
                            beginsWith: slicedHash
                        }, and: {
                            active: {
                                eq: true
                            }
                        }
                    }
                }
            });
            const nearbyThoughtList = response.data.listThoughts.items;
            const sortedThoughts = nearbyThoughtList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            await AsyncStorage.setItem('@nearbyThoughts', JSON.stringify(sortedThoughts));
            return sortedThoughts
        } catch (error) {
            console.log(error);
            return rejectWithValue(error);
        }
    }
);

const initialState = {
    nearbyThoughts: [],
    loading: "idle",
    error: null
}

const getNearbyThoughtsSlice = createSlice({
    name: "getNearbyThoughts",
    initialState,
    reducers: {
        resetNearbyThoughts: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getNearbyThoughts.pending, (state) => {
                state.loading = "loading"
            })
            .addCase(getNearbyThoughts.fulfilled, (state, action) => {
                state.loading = "succeeded",
                    state.nearbyThoughts = action.payload
            })
            .addCase(getNearbyThoughts.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload;
            });
    }
})

export const gettingNearbyThoughts = getNearbyThoughtsSlice.actions;
export const { resetNearbyThoughts } = getNearbyThoughtsSlice.actions;

export default getNearbyThoughtsSlice.reducer;