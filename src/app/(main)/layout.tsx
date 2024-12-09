"use client";
import DesktopSidebar from "@/components/desktop/sidebar/desktop-sidebar";
import Header from "@/components/header";
import MobileTab from "@/components/mobile/mobile-tab";
import ModalContext from "@/lib/context/modal";
import React, { useContext } from "react";
import PostModal from "@/components/create-post-modal";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen, action, postId } = useContext(ModalContext);

  return (
    <div className="flex">
      <DesktopSidebar />

      <main className="mx-auto pb-16 md:pb-0">
        <Header />
        {children}
        <MobileTab />
        <PostModal
          open={open}
          closeModal={() => setOpen(false)}
          action={action ?? "create"}
          postId={postId}
        />
      </main>
    </div>
  );
};

export default Layout;
