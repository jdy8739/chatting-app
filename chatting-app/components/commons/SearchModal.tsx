import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { fetchRoomsByKeyword } from "../../apis/roomApis";
import { modalBgVariant, zIndex100 } from "../../constants/styles";
import { IRoom } from "../../types/types";
import Room from "../list/Room";

let prevPathName = "";

function SearchModal({ hideSearchModal }: { hideSearchModal: () => void }) {
  const router = useRouter();
  const [searchedRooms, setSearchedRooms] = useState<IRoom[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const stopProppagation = (e: React.MouseEvent<HTMLDivElement>) =>
    e.stopPropagation();
  const startSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const keyword = inputRef.current?.value;
    if (keyword) {
      const searchedRooms = await fetchRoomsByKeyword(keyword);
      if (!searchedRooms || searchedRooms.length === 0) setSearchedRooms([]);
      else setSearchedRooms(searchedRooms);
    }
  };
  useEffect(() => {
    inputRef.current?.focus();
    prevPathName = router.pathname;
    return () => {
      prevPathName = "";
    };
  }, []);
  useEffect(() => {
    if (prevPathName !== router.pathname) hideSearchModal();
    prevPathName = router.pathname;
  }, [router.pathname]);
  return (
    <div>
      <motion.div
        className="modal-bg"
        variants={modalBgVariant}
        initial="initial"
        animate="animate"
        exit="exit"
        style={zIndex100}
        onClick={hideSearchModal}
      >
        <div className="modal big-modal" onClick={stopProppagation}>
          <h3>search chat rooms</h3>
          <form onSubmit={startSearch}>
            <input ref={inputRef} className="input-box" />
            &nbsp;
            <button className="outlined-btn">search</button>
          </form>
          <br></br>
          <DragDropContext>
            <Droppable droppableId="none" key="none">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {searchedRooms.map((room, index) => {
                    return (
                      <div
                        key={room.roomId}
                        onClick={!room.pwRequired ? hideSearchModal : undefined}
                      >
                        <Room index={index} room={room} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </motion.div>
      <style jsx>{`
        .big-modal {
          height: 500px;
          width: 300px;
          z-index: 1000;
          overflow-y: scroll;
        }
        h3 {
          color: orange;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

export default SearchModal;
