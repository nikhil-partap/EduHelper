// Utility functions will go here
// Example: validation helpers, data formatters, etc.

export const formatResponse = (
  success,
  data = null,
  message = "",
  error = null
) => {
  return {
    success,
    ...(data && { data }),
    ...(message && { message }),
    ...(error && { error }),
  };
};

export const generateClassCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
