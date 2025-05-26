import "./header.css"
import logo from "/public/logo.png"
import UseIdenticon from "../identicon/identicon"
import {useState, useEffect} from "react"
import {useNavigate} from "react-router-dom"

const Header = () => {
 const [username, setUsername] = useState("")
 const navigate = useNavigate()

  useEffect(() => {
   const stored = localStorage.getItem("username")
   if (stored) setUsername(stored)
  }, [])

 const handleLogout = () => {
  localStorage.removeItem("username")
  localStorage.removeItem("role")
  navigate("/login")

 }

 return (
  <header className="header">
   <img src={logo} alt="logo" className="header-logo" />
   <h1>Dashboard Survei</h1>
   <div className="header-right">
    <div className="identicon-header" onClick={handleLogout}>
      <span className="header-username">{username} Logout</span>
      <div>
        {username ? <UseIdenticon username={username} size={40} /> : <span>Loading…</span>}
      </div>
      </div>
   </div>
  </header>
 )
}

//   return (
//     <header className="header">
//       <img src={logo} alt="logo" className="header-logo" />
//       <h1>Dashboard Survei</h1>
//       <div className="header-right">
//         {username ? (
//           <div className="identicon-header" onClick={handleLogout}>
//             <span className="header-username">{username} | Logout</span>
//             <UseIdenticon username={username} size={40} />
//           </div>
//         ) : (
//           <span>Loading…</span>
//         )}
//       </div>
//     </header>
//   )
// }
export default Header
