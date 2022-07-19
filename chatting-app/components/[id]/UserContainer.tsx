
function UserContainer() {
    const showNowUsers = () => {
        console.log('show!');
    }
    return (
        <>
            <div
                className="user-container"
                onMouseOver={showNowUsers}
            >
                <h4>users</h4>
            </div>
        </>
    )
}

export default UserContainer;