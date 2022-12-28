import type { NextPage } from "next";
import Link from "next/link";
import Seo from "../components/commons/Seo";

const Home: NextPage = () => {
  return (
    <div className="relative">
      <Seo title={"Hello Chato ;)"}></Seo>
      <div className="greetings">
        <h1 className="hello">Hello Chato ;)</h1>
        <Link href="/chat/list">
          <button className="start">start chatting &rarr;</button>
        </Link>
        <p className="made-by">made by Do Young Chung</p>
      </div>
      <div className="screen">
        <div className="background"></div>
        <div className="background"></div>
      </div>
      <style jsx>{`
        .hello {
          color: orange;
          font-size: 82px;
        }
        .start {
          width: 190px;
          height: 80px;
          font-size: 20px;
          background-color: rgb(0, 219, 146);
          color: white;
        }
        .start:hover {
          background-color: transparent;
          color: rgb(0, 219, 146);
          border: 1px solid rgb(0, 219, 146);
        }
        .relative {
          position: relative;
          z-index: 0;
        }
        .greetings {
          top: 200px;
          text-align: center;
          position: absolute;
          z-index: 100;
          width: 100%;
        }
        .made-by {
          margin-top: 45px;
          font-size: 12px;
          color: #686868;
          font-weight: bold;
        }
        .screen {
          top: 0;
          position: absolute;
          height: 100vh;
          overflow: hidden;
        }
        .background {
          width: 100vw;
          height: 100%;
          background-image: url("/unpinned.png");
          animation-duration: 8s;
          animation-name: goup;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        @keyframes goup {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-100vh);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
