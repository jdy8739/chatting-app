import Link from "next/link";
import { useRouter } from "next/router";

function NavBar() {
    return (
        <>
            <div className="bar-bg">
                <div className="bar-inner">
                    <h1>ChaTo</h1>
                    &emsp;
                    <Link href="/chat/list">
                        <button>chat</button>
                    </Link>
                    <Link href="/chat/create">
                        <button>make chat</button>
                    </Link>
                    <button>search chat</button>
                    <div style={{ flexGrow: '1' }}></div>
                    <Link href="/user/signup">
                        <button>sign up</button>
                    </Link>
                    <button>sign in</button>
                    <Link href="#">
                        <button>portfolio</button>
                    </Link>
                </div>
            </div>
            <style>{`
                .bar-bg {
                    width: 100vw;
                    height: 55px;
                    background-color: white;
                    box-shadow: 0px 5px 30px rgba(0, 0, 0, 0.15);
                    padding: 0px 25px;
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

                h1 {
                    color: orange;
                }
            `}</style>
        </>
    )
}

export default NavBar;