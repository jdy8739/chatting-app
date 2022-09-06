import React from "react";
import { IMessageBody } from "../../types/types";
import { MASTER_PROTOCOL } from "../../utils/enums";

interface IMessageComponent {
    msg: IMessageBody,
    index: number,
    prevWriter: string,
    prevTime?: string,
    checkIfIsMyChat: <T extends Object>(arg: T) => boolean | undefined,
    deleteChat: (id: number, msgNo: number) => Promise<void>,
    handleChatDblClick: (index: number, isNumberMatches: boolean) => void,
    userNo: number,
    roomOwner: (number | null),
    roomId: number,
    isNumberMatches: boolean,
    isDeleted: boolean,
}

const imageStyle = {
    maxWidth: '300px',
    height: 'auto',
    padding: '14px',
    borderRadius: 'inherit',
    backgroundColor: 'inherit',
}

function MessageComponent({ 
    msg,
    index,
    prevWriter,
    prevTime,
    checkIfIsMyChat,
    deleteChat,
    handleChatDblClick,
    userNo,
    roomOwner,
    roomId,
    isNumberMatches,
    isDeleted }: IMessageComponent) {
    /* console.log('A message component rendered.'); */
    const isMyMessage = (msg.writerNo === userNo);
    const isSameTimeMessage = (prevTime !== msg.time);
    const checkIsEligibleToDelete = () => {
        return (checkIfIsMyChat(msg.writer) || isMyMessage || (roomOwner === userNo));
    }
    return (
        <div
            className={`chat-box ${
                (checkIfIsMyChat(msg.writer) || isMyMessage)
                    ? 'my-chat-box' : 'others-chat-box'}`}
        >   
            {(index === 0) ? <ChatInfo writer={msg.writer} /> :
            (prevWriter !== msg.writer) && 
            <ChatInfo
                writer={msg.writer}
                isRoomOwner={(Boolean(roomOwner) && (msg.writerNo === roomOwner))}
            />}
            {(msg.writer === MASTER_PROTOCOL.MASTER) ?
            <span className="master-chat">{msg.message}</span> :
            <>
                {(index !== 0) && 
                isSameTimeMessage &&
                (((userNo < 0) && checkIfIsMyChat(msg.writer)) || isMyMessage) &&
                <ChatTimeComponent
                    time={(msg.time || '')}
                />}
                <span
                    onDoubleClick={() => 
                        checkIsEligibleToDelete() ? handleChatDblClick(index, isNumberMatches) : null}
                    className={`chat 
                        ${(checkIfIsMyChat(msg.writer) || isMyMessage)
                            ? 'my-chat' : 'others-chat'}
                        ${msg.isDeleted ? 'deleted-chat' : ''}
                    `}
                >
                    {!msg.isDeleted && isNumberMatches &&
                    <span
                        onClick={() => deleteChat(roomId, msg.msgNo)}
                        className="delete-btn"
                    >
                        <span>x</span>
                    </span>}
                    <ChatContent
                        isDeleted={msg.isDeleted}
                        isPicture={msg.isPicture}
                        content={msg.message}
                        msgNo={msg.msgNo}
                        roomId={roomId}
                    />
                </span>
                {(index !== 0) && 
                isSameTimeMessage && 
                (!checkIfIsMyChat(msg.writer) && !isMyMessage) &&
                <ChatTimeComponent 
                    time={msg.time || ''}
                />
                }
            </>}
        </div>
    )
}

function ChatInfo({ writer, isRoomOwner }: { writer: string, isRoomOwner?: boolean }) {
    return (
        <>
            {(writer !== MASTER_PROTOCOL.MASTER) &&
            <span>
                {isRoomOwner && 
                <img
                    src="/crown.png"
                    width="30px"
                    height="25px"
                />}
                <h5>{writer.slice(0, 9)}</h5>
            </span>}
        </>
    );
}

function ChatTimeComponent({ time }: { time: string}) {
    return (<>&emsp;<span className="time">{time}</span>&emsp;</>)
}

interface IMessageContent {
    content: string,
    roomId: number,
    msgNo: number,
    isDeleted?: boolean,
    isPicture?: boolean,
}

function ChatContent({ isDeleted, isPicture, content, roomId, msgNo }: IMessageContent) {
    return (
        <>
            {(isPicture && !isDeleted) ? 
            <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/room/content-pic/${roomId}/${msgNo}`}
                style={imageStyle}
            /> :
            <span>{isDeleted ? 'deleted message' : content}</span>}
        </>
    )
}

/*
true를 반환하는 것으로 React가 갱신 작업을 건너뛰게 만들 수 있다.
기존 class 컴포넌트의 shouldComponentUpdate 함수에서는 false를 반환할 때 re-render 작업을 건너뜀.
memo 함수의 두 번째 인자로 함수를 넣어주면 된다.
vue.js의 watch와 비슷함.
*/

const judgeEqual = ({ index: prevIndex }: IMessageComponent, { index }: IMessageComponent) => {
    return (prevIndex !== index);
}

export default React.memo(MessageComponent);