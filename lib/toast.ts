import { toast as sonnerToast, type ExternalToast } from "sonner";

type ToastOptions = ExternalToast;

/** Refined notifications with optional subtitle — labels styled via CSS */
export const notify = {
  success(message: string, options?: ToastOptions) {
    sonnerToast.success(message, options);
  },
  error(message: string, options?: ToastOptions) {
    sonnerToast.error(message, options);
  },
  info(message: string, options?: ToastOptions) {
    sonnerToast.info(message, options);
  },
  warning(message: string, options?: ToastOptions) {
    sonnerToast.warning(message, options);
  },
  loading(message: string, options?: ToastOptions) {
    return sonnerToast.loading(message, options);
  },
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) {
    return sonnerToast.promise(promise, messages);
  },
  dismiss(id?: string | number) {
    sonnerToast.dismiss(id);
  },
};

export { sonnerToast as toast };
