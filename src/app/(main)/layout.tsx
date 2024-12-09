"use client";
import CreateModal from "@/components/create-post-modal";
import DesktopSidebar from "@/components/desktop/sidebar/desktop-sidebar";
import Header from "@/components/header";
import MobileTab from "@/components/mobile/mobile-tab";
import ModalContext from "@/lib/context/modal";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import React, { useContext } from "react";
import { editorConfig } from "../../lib/editor-config";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen } = useContext(ModalContext);
  const onError = (error: Error) => {
    console.error(error);
  };

  return (
    <div className="flex">
      <DesktopSidebar />

      <main className="mx-auto pb-16 md:pb-0">
        <Header />
        {children}
        <MobileTab />
        <CreateModal open={open} onOpenChange={setOpen} />
      </main>
    </div>
  );
};

export default Layout;
