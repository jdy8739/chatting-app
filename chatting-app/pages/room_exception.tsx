import { useRouter } from "next/router";
import { useEffect } from "react";

function RoomException() {
    const router = useRouter();
    useEffect(() => {
        const timeOut = setTimeout(() => {
            router.push('/chat/list');
        }, 3000)
        return () => {
            clearTimeout(timeOut);
        }
    }, [])
    return (
        <>
            <div className="alert">
                <h4>The participants exceeds room limit now, or the password is not correct.</h4>
                <h4>Otherwise maybe You might be on the ban list of this room!</h4>
                <p>This page will redirect to chat list page soon.</p>
            </div>
            <style>{`
                .alert {
                    margin-top: 300px;
                    text-align: center;
                    color: orange;
                }
            `}</style>
        </>
    )
}

export default RoomException;