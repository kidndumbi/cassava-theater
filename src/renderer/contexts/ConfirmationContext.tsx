import { createContext, FC, useContext, useState } from "react";
import ConfirmationDialog from "../components/common/ConfirmationDialog";

type ConfirmationContextType = {
  openDialog: () => Promise<string>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
};

const ConfirmationContext = createContext<ConfirmationContextType | null>(null);

export const ConfirmationProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  return (
    <>
      <ConfirmationContext.Provider
        value={{ openDialog, setMessage }}
      >
        {children}
      </ConfirmationContext.Provider>
      <ConfirmationDialog
        open={isOpen}
        message={message}
        handleClose={closeDialog}
      />
    </>
  );
};

export const useConfirmation = () => {
  const contextValue = useContext(ConfirmationContext);

  return contextValue;
};
