import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image";

function RoomException() {
  const router = useRouter();
  useEffect(() => {
    const timeOut = setTimeout(() => {
      router.push("/chat/list");
    }, 3000);
    return () => {
      clearTimeout(timeOut);
    };
  }, []);
  return (
    <>
      <div className="icon">
        <Image width="150px" height="150px" src="/out.png" alt="out-icon" />
      </div>
      <div className="alert">
        <h4>
          The participants exceeds room limit now, or the password is not
          correct.
        </h4>
        <h4>Otherwise maybe You might be on the ban list of this room!</h4>
        <p>This page will redirect to chat list page soon.</p>
      </div>
      <style jsx>{`
        .alert {
          margin-top: 30px;
          text-align: center;
          color: orange;
        }
        .icon {
          margin: 300px auto 0 auto;
          width: 150px;
          height: 150px;
        }
      `}</style>
    </>
  );
}

export default RoomException;
