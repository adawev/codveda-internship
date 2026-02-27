import { useToast as useToastContext } from "../toast/ToastContext";

export const useToast = () => {
  const { toast, dismiss } = useToastContext();
  return { toast, dismiss };
};
