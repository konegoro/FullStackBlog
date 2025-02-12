const LogOut = ({setUser}) => {
    return (
    <div>
        <button onClick={() => {window.localStorage.removeItem("loggedNoteappUser")
                                setUser(null)}}>
            Logout
        </button>
    </div>
    )
} 

export default LogOut