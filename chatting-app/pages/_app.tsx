import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import PropTypes from "prop-types";
import wrapper from "../lib/store/configureStore";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          width: 100vw;
          min-height: 100vh;
          background-color: #ebfbf4;
          background-image: ${router.pathname === "/" ||
          router.pathname === "/chat/list"
            ? "none"
            : `linear-gradient(to top, transparent, #dadada),
            url("/unpinned.png")`};
        }
        a {
          color: inherit;
          text-decoration: none;
        }
        button {
          border: none;
          padding: 8px;
          margin: 4px;
          border-radius: 12px;
          cursor: pointer;
          color: rgb(0, 219, 146);
          background-color: transparent;
          transition: all 1s;
        }
        button:hover {
          background-color: rgb(0, 219, 146);
          color: white;
        }
        h5 {
          margin-top: 0;
          color: gray;
        }
        .chat {
          color: white;
          padding: 8px;
          border-radius: 8px;
          position: relative;
        }
        .my-chat {
          background-color: orange;
          transition: all 0.3s;
        }
        .my-chat:hover {
          background-color: rgb(255, 103, 129);
        }
        .others-chat {
          background-color: rgb(0, 219, 146);
        }
        .master-chat {
          text-align: center;
          color: grey;
          font-size: 12px;
          display: block;
        }
        .chat-box {
          padding: 20px 0px;
          word-wrap: break-word;
          position: relative;
        }
        .my-chat-box {
          text-align: right;
        }
        .others-chat-box {
          text-align: left;
        }
        .chat-time {
          font-size: 7px;
          color: #888888;
        }
        .picture-chat {
          width: 180px;
          padding: 8px;
          border-radius: 8px;
        }
        .my-picture {
          margin-left: auto;
          margin-right: 0;
        }
        .deleted-chat {
          color: white;
          padding: 8px;
          border-radius: 8px;
          position: relative;
          background-color: gray;
        }
        .container {
          width: 70%;
          max-width: 2250px;
          min-width: 500px;
          padding: 120px 62px;
          margin: 60px auto 0 auto;
        }
        .delete-btn {
          background-color: red;
          width: 25px;
          height: 25px;
          border-radius: 20px;
          position: absolute;
          top: -15px;
          right: -50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          cursor: pointer;
        }
        .user-container {
          width: 350px;
          height: 100vh;
          background-color: rgb(68, 68, 68, 0.7);
          position: fixed;
          top: 0px;
          left: -285px;
          transition: all 1s;
          opacity: 0.9;
          z-index: 10;
        }
        .user-container > h4 {
          position: absolute;
          color: white;
          cursor: pointer;
        }
        .user-container > .number-of-users {
          right: 18px;
          top: 65px;
        }
        @media and (max-width: 768px) {
          .user-container,
          .number-of-users,
          .user,
          .banned {
            padding-top: 65px;
          }
        }
        .user-container > .user {
          right: 10px;
          top: 135px;
        }
        .user-container > .banned {
          right: 18px;
          top: 205px;
        }
        .user-container:hover {
          transform: translateX(285px);
          opacity: 1;
        }
        .name-box {
          width: 285px;
          height: 100vh;
          padding-top: 65px;
        }
        .profile {
          background-color: rgb(255, 255, 250, 0.3);
          width: 100%;
          height: 55px;
          display: flex;
          align-items: center;
          padding-left: 25px;
          cursor: pointer;
          position: relative;
        }
        .profile-img {
          background-size: cover;
          background-position: center center;
          border-radius: 50%;
          border: 1px solid orange;
        }
        .profile:hover {
          background-color: orange;
        }
        .profile-img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #eee;
          margin: auto 10px;
          overflow: hidden;
          border: 2px solid orange;
        }
        .out-icon {
          position: absolute;
          right: 20px;
          top: 35%;
        }
        .submit-form {
          height: 100vh;
          padding: 1px;
        }
        .form-body {
          width: 80%;
          margin: auto;
          width: 500px;
          height: 420px;
          background-color: white;
          margin: 150px auto 20px auto;
          padding: 5px 20px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0px 5px 30px rgba(0, 0, 0, 0.05);
        }
        .submit-btn {
          width: 500px;
          height: 60px;
          font-size: 23px;
          display: block;
          margin: auto;
          background-color: rgb(0, 219, 146, 0.3);
          border: 1px solid rgb(0, 219, 146);
        }
        .outlined-btn {
          border: 1px solid rgb(0, 219, 146);
          background-color: rgb(0, 219, 146, 0.3);
        }
        .input-box {
          padding: 12px;
          border: 1px solid orange;
          border-radius: 20px;
          margin: 12px 0;
          outline: none;
        }
        input[type="checkbox"] {
          width: 20px;
          height: 20px;
          margin: 15px;
          padding-top: 15px;
          accent-color: orange;
        }
        input[type="file"] {
          font-size: 10px;
          text-align: right;
        }
        .item {
          color: gray;
          font-size: 13px;
        }
        .title {
          color: orange;
        }
        label {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .error-message {
          height: 18px;
          color: orange;
          font-size: 13px;
        }
        .modal-bg {
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.25);
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99;
        }
        .modal {
          width: 400px;
          height: 90px;
          background-color: #efefef;
          border-radius: 20px;
          text-align: center;
          box-shadow: 2px 2px 2px gray;
        }
        .modal-input {
          width: 200px;
        }
        .wrong-pw {
          animation-name: shake;
          animation-duration: 0.3s;
        }
        @keyframes shake {
          0% {
            transform: translateX(0px);
          }
          20% {
            transform: translateX(30px);
          }
          40% {
            transform: translateX(-30px);
          }
          60% {
            transform: translateX(30px);
          }
          80% {
            transform: translateX(-30px);
          }
          100% {
            transform: translateX(0px);
          }
        }
        input[type="range"] {
          -webkit-appearance: none;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          width: 300px;
          height: 5px;
          background: #ddd;
          border: none;
          border-radius: 3px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          border: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: goldenrod;
          margin-top: -5px;
        }
        input[type="range"]:focus {
          outline: none;
        }
        input[type="range"]:focus::-webkit-slider-runnable-track {
          background: #ccc;
        }
        input[type="file"]::file-selector-button {
          width: 75px;
          height: 30px;
          background: transparent;
          border: 1px solid orange;
          border-radius: 15px;
          cursor: pointer;
          transition: all 1s;
        }
        input[type="file"]::file-selector-button:hover {
          background-color: orange;
          color: white;
        }
      `}</style>
    </>
  );
}

MyApp.prototype = {
  Comment: PropTypes.elementType.isRequired,
};

export default wrapper.withRedux(MyApp);
