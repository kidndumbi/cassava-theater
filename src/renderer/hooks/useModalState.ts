import { useState } from "react";

export function useModalState(initial = false) {
  const [open, setOpen] = useState(initial);
  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);
  return { open, openModal, closeModal, setOpen };
}
