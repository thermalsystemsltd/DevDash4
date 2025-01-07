import { createSlice } from '@reduxjs/toolkit';

const THEME_KEY = 'user_theme_preference';

interface ThemeState {
  isDark: boolean;
}

const initialState: ThemeState = {
  isDark: localStorage.getItem(THEME_KEY) === 'dark',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      localStorage.setItem(THEME_KEY, state.isDark ? 'dark' : 'light');
      if (state.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;