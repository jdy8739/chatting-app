import axios from "axios";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { IRoom } from "../../types/types";
import { modalBgVariant, toastConfig } from "../../utils/utils";
import Room from "../list/Room";

const zIndex = { zIndex: 100 };

let prevPathName = '';

function SearchModal({ hideSearchModal }: { hideSearchModal: () => void }) {
    const router = useRouter();
    const [searchedRooms, setSearchedRooms] = useState<IRoom[]>([]); 
    const inputRef = useRef<HTMLInputElement>(null);
    const stopProppagation = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();
    const startSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = inputRef.current?.value;
        if (value !== '') {
            const { data: searchedRooms }: { data: IRoom[] } = 
                await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/room/search?keyword=${value}`);
            if (searchedRooms.length === 0) {
                toast.error('No rooms have been found. :(', toastConfig);
                setSearchedRooms([]);
            }
            else setSearchedRooms(searchedRooms);
        }
    }
    useEffect(() => { 
        inputRef.current?.focus();
        prevPathName = router.pathname;
        return () => {
            prevPathName = '';
        }
    }, []);
    useEffect(() => {
        if (prevPathName !== router.pathname) hideSearchModal();
        prevPathName = router.pathname;
    }, [router.pathname]);
    return (
        <>
            <motion.div
                className="modal-bg"
                variants={modalBgVariant}
                initial="initial"
                animate="animate"
                exit="exit"
                style={zIndex}
                onClick={hideSearchModal}
            >
                <div
                    className="modal big-modal"
                    onClick={stopProppagation}
                >
                    <h3>search chat rooms</h3>
                    <form onSubmit={startSearch}>
                        <input ref={inputRef}/>
                        <button>search</button>
                    </form>
                    <br></br>
                    <DragDropContext onDragEnd={() => {}}>
                        <Droppable
                            droppableId="none"
                            key="none"
                        >
                            {(provided) => 
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {searchedRooms.map((room, index) => {
                                    return (
                                        <div
                                            key={room.roomId}
                                            onClick={!room.pwRequired ? hideSearchModal : undefined}
                                        >
                                            <Room
                                                index={index}
                                                room={room}
                                            />
                                        </div>
                                    )
                                })}
                            </div>}
                        </Droppable>
                    </DragDropContext>
                </div>
            </motion.div>
            <style jsx>{`
                .big-modal {
                    height: 500px;
                }
                input {
                    border: 1px solid green;
                    border-radius: 4px;
                    padding: 6px;
                }
                h3 {
                    color: orange;
                    font-weight: bold;
                }
            `}</style>
        </>
    )
}

export default SearchModal;