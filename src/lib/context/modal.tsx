"use client";
import CreateModal from "@/components/create-post-modal";
import { createContext, useState, useMemo } from "react";

type ModalContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ModalContext = createContext<ModalContextType>({
  open: false,
  setOpen: (_: boolean) => void 0,
});

export default ModalContext;

type Props = {
  children: React.ReactNode;
};

export const ModalProvider = ({ children }: Props) => {
  const [open, setOpen] = useState(false);

  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};
