import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(window?.localStorage.getItem("userInfo")) ?? {},
};

const userSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload.user;
      
    },
    logout(state) {
      state.user = null;
       localStorage?.removeItem("userInfo");
    },
  },
});

export default userSlice.reducer;

export function Login(user) {
  return (dispatch, getState) => {
    dispatch(userSlice.actions.login({user}));
    // dispatch(Login(user));
  };
}

export function Logout() {
  return (dispatch, getState) => {
    //localStorage.removeItem("userInfo");
    dispatch(userSlice.actions.logout());
    // dispatch(Logout());
  };
}


