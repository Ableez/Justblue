"use client";
import {
  createContext,
  useState,
  useMemo,
} from "react";

type ModalContextType = {
  open: boolean;
  action?: "create" | "comment";
  postId?: string;
  setOpen: (
    open: boolean,
    action?: "create" | "comment",
    postId?: string,
  ) => void;
};

const ModalContext = createContext<ModalContextType>({
  open: false,
  action: undefined,
  postId: undefined,
  setOpen: (_open: boolean, _action?: "create" | "comment", _postId?: string) =>
    void 0,
});

export default ModalContext;

type Props = {
  children: React.ReactNode;
};

export const ModalProvider = ({ children }: Props) => {
  const [state, setState] = useState<{
    open: boolean;
    action?: "create" | "comment";
    postId?: string;
  }>({
    open: false,
    action: undefined,
    postId: undefined,
  });

  const setOpen = (
    open: boolean,
    action?: "create" | "comment",
    postId?: string,
  ) => {
    setState({ open, action, postId });
  };

  const value = useMemo(
    () => ({
      open: state.open,
      action: state.action,
      postId: state.postId,
      setOpen,
    }),
    [state],
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
