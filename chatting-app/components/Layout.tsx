import { ToastContainer } from "react-toastify";
import NavBar from "./commons/NavBar";
import "react-toastify/dist/ReactToastify.css";
import { PropsWithChildren } from "react";

function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <NavBar />
      <ToastContainer toastClassName="dark-toast" />
      <div>{children}</div>
    </>
  );
}

export default Layout;
