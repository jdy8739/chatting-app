import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { checkIfIsPasswordCorrect } from "../../apis/roomApis";
import { classNames } from "../../constants/className";
import { modalBgVariant } from "../../constants/styles";
import { IModal } from "../../utils/interfaces";

let timeOut: NodeJS.Timeout;

function Modal({
  roomId,
  query,
  hideModal,
  pushToChatRoom,
  addSubjectTable,
}: IModal) {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) =>
    e.stopPropagation();
  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      if (roomId) submitPassword();
      else makeRoomSubjectTable();
    }
  };
  const submitPassword = async () => {
    const inputPassword = inputRef.current?.value;
    if (roomId && inputPassword) {
      const isPasswordCorrect = await checkIfIsPasswordCorrect(
        roomId,
        inputPassword
      );
      if (isPasswordCorrect && pushToChatRoom) {
        pushToChatRoom(inputRef.current?.value);
        hideModal();
      } else {
        const targetRef = modalRef.current;
        if (targetRef) {
          targetRef.classList.add(classNames.wrong_pw);
          timeOut = setTimeout(
            () => targetRef.classList.remove(classNames.wrong_pw),
            300
          );
        }
      }
    }
  };
  const makeRoomSubjectTable = () => {
    const newTableName = inputRef.current?.value;
    if (newTableName && addSubjectTable) addSubjectTable(newTableName);
  };
  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      clearTimeout(timeOut);
    };
  }, []);
  return (
    <motion.div
      className="modal-bg"
      onClick={hideModal}
      variants={modalBgVariant}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="modal" onClick={stopPropagation} ref={modalRef}>
        <p>{query}</p>
        <input
          className="modal-input"
          placeholder={
            roomId ? "Input room password." : "Input new subject name."
          }
          type={roomId ? "password" : "text"}
          onKeyUp={handlePressEnter}
          ref={inputRef}
        />
      </div>
    </motion.div>
  );
}

export default Modal;
