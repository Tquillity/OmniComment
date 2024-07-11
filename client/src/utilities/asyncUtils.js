//asyncUtils.js
export const asyncHandler = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const handleAsyncAction = async (action) => {
  try {
    const message = await action();
    if (message) alert(message);
  } catch (error) {
    alert(error.message || JSON.stringify(error));
  }
};