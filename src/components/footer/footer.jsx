import React from "react"
import "./Footer.css"

const Footer = () => {
 return (
  <footer className="dashboard-footer">
   <p>© {new Date().getFullYear()} Surveyor App. All rights reserved.</p>
  </footer>
 )
}

export default Footer
