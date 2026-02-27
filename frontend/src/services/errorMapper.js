export const mapBackendMessage = (message) => {
  if (!message) {
    return "Something went wrong. Please try again.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("password") && normalized.includes("between")) {
    return "Password must be between 8 and 200 characters.";
  }

  if (normalized.includes("email") && normalized.includes("already")) {
    return "Email already exists. Try logging in instead.";
  }

  return message;
};

export const getErrorMessage = (error) => {
  const backendMessage = error?.response?.data?.message;
  if (backendMessage) {
    return mapBackendMessage(backendMessage);
  }

  if (error?.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};
