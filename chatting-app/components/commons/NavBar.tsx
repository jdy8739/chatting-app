import Link from "next/link";
import { useRouter } from "next/router";

function NavBar() {
    const router = useRouter();
    return (
        <>
            <div className="bar-bg">
                <div className="bar-inner">
                    <h1>ChaTo</h1>
                    &emsp;
                    <Link href="/chat/list">
                        <button className={router.pathname === '/chat/list' ? 'clicked' : ''}>chat</button>
                    </Link>
                    <Link href="/chat/create">
                        <button className={router.pathname === '/chat/create' ? 'clicked' : ''}>make chat</button>
                    </Link>
                    <button>search chat</button>
                    <div style={{ flexGrow: '1' }}></div>
                    <Link href="/user/signup">
                        <button className={router.pathname === '/user/signup' ? 'clicked' : ''}>sign up</button>
                    </Link>
                    <button>sign in</button>
                    <Link href="#">
                        <button>portfolio</button>
                    </Link>
                </div>
            </div>
            <style>{`
                .bar-bg {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 65px;
                    background-color: white;
                    box-shadow: 0px 5px 30px rgba(0, 0, 0, 0.15);
                    padding: 0px 25px;
                    z-index: 100;
                }
                .bar-inner {
                    width: 100%;
                    max-width: 2000px;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: auto;
                }
                .clicked {
                    color: orange;
                }
                h1 {
                    color: orange;
                    font-weight: bold;
                }
            `}</style>
        </>
    )
}

export default NavBar;