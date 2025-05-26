import {Link, useLocation} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faBars, faXmark} from "@fortawesome/free-solid-svg-icons"
import logo from "/public/logo.png"
import "./sidebar.css"
import {navItems} from "./sidebarconfig"

const Sidebar = ({isOpen, setIsOpen}) => {
 const location = useLocation()

 return (
  <div className={`sidebar ${isOpen ? "show" : "hide"}`}>
   <div className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
    <FontAwesomeIcon icon={isOpen ? faXmark : faBars} />
   </div>
   <div className="sidebar-header">
    <img src={logo} alt="logo" className="sidebar-logo" />
    <div className="sidebar-brand">Admin Panel</div>
   </div>
   <ul className="sidebar-list">
    {navItems.map((item) => (
     <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
      <Link to={item.path}>
       <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />
       <span>{item.name}</span>
      </Link>
     </li>
    ))}
   </ul>
  </div>
 )
}

export default Sidebar
