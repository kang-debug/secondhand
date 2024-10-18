    import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
    import axios from '../../api/axios';


    // 전체 사용자 목록 가져오기
    export const fetchUsers = createAsyncThunk('user/fetchUsers', async () => {
        const response = await axios.get('/users');
        return response.data;
    });

    // 사용자 프로필 정보 가져오기
    export const fetchUserProfile = createAsyncThunk('user/fetchUserProfile', async (_, { getState }) => {
        const { token } = getState().user;
        const response = await axios.get('/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    });

    const initialState = {
        isLoggedIn: false,
        token: null,
        profile: null,
    };

    const userSlice = createSlice({
        name: 'user',
        initialState,
        reducers: {
            login: (state, action) => {
                state.isLoggedIn = true;
                state.token = action.payload;
                localStorage.setItem('token', action.payload); // 로컬 스토리지에 토큰 저장
            },
            logout: (state) => {
                state.isLoggedIn = false;
                state.token = null;
                state.profile = null;
                localStorage.removeItem('token'); // 로그아웃 시 로컬 스토리지에서 토큰 제거
            },
            initializeUser: (state) => {
                const token = localStorage.getItem('token');
                if (token) {
                    state.isLoggedIn = true;
                    state.token = token;
                }
            },
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchUserProfile.fulfilled, (state, action) => {
                    state.profile = action.payload;
                });
        },
    });

    export const { login, logout, initializeUser } = userSlice.actions;
    export const selectIsLoggedIn = (state) => state.user.isLoggedIn;
    export const selectUserProfile = (state) => state.user.profile;

    export default userSlice.reducer;
