//asyncUtils.js
export const asyncHandler = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    console.error(error);
    return { error };
  }
};