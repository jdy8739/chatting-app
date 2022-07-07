import { ToastContainer } from "react-toastify";
import NavBar from "./NavBar";
import 'react-toastify/dist/ReactToastify.css';

function Layout({ children }: any) {
    return (
        <>
            <NavBar />
            <ToastContainer toastClassName="dark-toast"/>
            <div>{ children }</div>
        </>
    )
};

export default Layout;