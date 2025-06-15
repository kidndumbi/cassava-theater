import { createContext, FC, useContext, useState } from "react";
import ConfirmationDialog from "../components/common/ConfirmationDialog";

type ConfirmationContextType = {
  openDialog: (
    procedButtonText?: string,
    hideOkButton?: boolean,
    message?: string,
  ) => Promise<string>;
  setMessage: React.Dispatch<React.SetStateAction<React.ReactNode>>;
};

const ConfirmationContext = createContext<ConfirmationContextType | null>(null);

export const ConfirmationProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("Are you sure");
  const [procedButtonText, setProcedButtonText] = useState("");
  const [hideOkButton, setHideOkButton] = useState(false);
  const [resolve, setResolve] =
    useState<(value: string | PromiseLike<string>) => void>();

  const openDialog = (
    procedButtonText?: string,
    hideOkButton?: boolean,
    message?: string,
  ): Promise<string> => {
    setProcedButtonText("Ok");

    if (message) {
      setMessage(message);
    }
    if (procedButtonText) {
      setProcedButtonText(procedButtonText);
    }
    setHideOkButton(!!hideOkButton);
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
      <ConfirmationContext.Provider value={{ openDialog, setMessage }}>
        {children}
      </ConfirmationContext.Provider>
      <ConfirmationDialog
        open={isOpen}
        message={message}
        handleClose={closeDialog}
        procedButtonText={procedButtonText}
        hideOkButton={hideOkButton}
      />
    </>
  );
};

export const useConfirmation = (defaultMessage?: string) => {
  const contextValue = useContext(ConfirmationContext);

  if (!contextValue) return null;

  // Wrap openDialog to inject the default message if not provided
  const openDialogWithDefault = (
    procedButtonText?: string,
    hideOkButton?: boolean,
    message?: string,
  ) =>
    contextValue.openDialog(
      procedButtonText,
      hideOkButton,
      message ?? defaultMessage,
    );

  return {
    ...contextValue,
    openDialog: openDialogWithDefault,
  };
};
