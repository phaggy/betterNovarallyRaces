let state: { autorace: string | undefined } = {
  autorace: undefined,
};

export const autoraceaction = (
  action: string,
  data?: string | undefined
): string | undefined => {
  switch (action) {
    case "update":
      state = { ...state, autorace: data };
      return state.autorace;
    default:
      return state.autorace;
  }
};

export default state;
