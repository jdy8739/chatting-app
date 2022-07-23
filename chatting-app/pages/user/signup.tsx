import { useEffect, useState } from "react";
import Seo from "../../components/commons/Seo";
import { clearPreviousRoomId } from "../../utils/utils";

function SingUp() {
    const [isRendered, setIsRendered] = useState(false);
    useEffect(() => {
        setIsRendered(true);
        clearPreviousRoomId();
    }, [])
    return (
        <div className="all">
            <Seo title="Chato SignUp"></Seo>
            <form
                className="submit-form"
                style={{ height: '340px' }}
            >
                <h4 className="title">Welcome to Chato :)</h4>
                <div className="form-body">
                    <label htmlFor="id">
                        <span className="item">input your id</span>
                        <input
                            className="input-box"
                            id="id"
                            placeholder="id"
                        />
                    </label>
                    <label htmlFor="nick-name">
                        <span className="item">nick-name</span>
                        <input
                            className="input-box"
                            id="nick-name"
                            placeholder="user nick-name"
                        />
                    </label>
                    <label htmlFor="password">
                        <span className="item">password</span>
                        <input
                            className="input-box"
                            id="password"
                            placeholder="password"
                        />
                    </label>
                    <label htmlFor="password-check">
                        <span className="item">password check</span>
                        <input
                            className="input-box"
                            id="password-check"
                            placeholder="password-check"
                        />
                    </label>
                </div>
            </form>
            <button 
                className="submit-btn"
            >submit</button>
            <style>{`
                input {
                    width: 250px;
                }
                .all {
                    transition: all 1s;
                    opacity: ${ isRendered ? '1' : '0' };
                    transform: translateY(${ isRendered ? '0px' : '80px' });
                }
            `}</style>
        </div>
    );
}

export default SingUp;