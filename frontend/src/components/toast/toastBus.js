export const TOAST_EVENT_NAME = "app:toast";

export const emitToast = ({ title, description, variant = "info", duration = 4000 }) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT_NAME, {
      detail: {
        title,
        description,
        variant,
        duration,
      },
    })
  );
};
