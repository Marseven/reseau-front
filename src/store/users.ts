import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type user = {
    id: number,
    username: string,
    email: string,
    full_name: string,
    role: string,
    is_active: number,
    two_factor_enabled: boolean
}

export interface UserState {
  isLogin: boolean | null,
  user: user | null,
  token: string | null
}

const initialState: UserState = {
  isLogin: false,
  user: null,
  token: null
}

export const UserSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: user; token: string }>) => {
        state.isLogin = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
    },
    logout: (state) => {
        state.isLogin = false;
        state.user = initialState.user;
        state.token = '';
    },
  },
})

export const { login, logout } = UserSlice.actions

export default UserSlice.reducer
