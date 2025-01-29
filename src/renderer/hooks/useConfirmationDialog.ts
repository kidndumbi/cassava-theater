import { useState } from "react";

export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("Are you sure");
  const [resolve, setResolve] =
    useState<(value: string | PromiseLike<string>) => void>();

  const openDialog = (): Promise<string> => {
    setIsOpen(true);
    return new Promise<string>((_resolve) => {
      setResolve(() => _resolve);
    });
  };

  const closeDialog = (choice: string) => {
    setIsOpen(false);
    if (resolve) {
      resolve(choice);
    }
  };

  return {
    isOpen,
    openDialog,
    closeDialog,
    message,
    setMessage,
  };
};
