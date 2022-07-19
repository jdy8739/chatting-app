import { useEffect } from "react";
import Seo from "../../components/Seo";
import { clearPreviousRoomId } from "../../utils/utils";

function SingUp() {
    useEffect(() => {
        clearPreviousRoomId();
    }, [])
    return (
        <>
            <Seo title="Chato SignUp"></Seo>
            <div>signup</div>
        </>
    );
}

export default SingUp;