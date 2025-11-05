import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HeaderState {
  title?: string;
  subTitle?: string;
}

interface LayoutState {
  header: HeaderState;
}

const initialState: LayoutState = {
  header: {
    title: '',
    subTitle: '',
  },
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setHeader: (state, action: PayloadAction<HeaderState>) => {
      state.header = action.payload;
    },
  },
});

export const { setHeader } = layoutSlice.actions;

export default layoutSlice.reducer;
