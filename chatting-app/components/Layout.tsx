import NavBar from "./NavBar";

function Layout({ children }: any) {
    return (
        <>
            <NavBar />
            <div>{ children }</div>
        </>
    )
};

export default Layout;