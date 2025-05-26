import {Outlet} from "react-router-dom"
import {useState} from "react"
import {Container} from "react-bootstrap"
import Header from "../../components/header/header.jsx"
import Sidebar from "../../components/sidebar/sidebar.jsx"
import Footer from "../../components/footer/footer.jsx"
import "./dashboard.css"

const Dashboard = () => {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false)
 return (
  <>
   <div className="dashboard-wrapper">
    <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    <div className={`main-content-wrapper ${isSidebarOpen ? "with-sidebar" : "full-width"}`}>
     <Header />
     <main className="dashboard-content">
      <Outlet />
     </main>
     <Footer />
    </div>
   </div>
  </>
 )
}

export default Dashboard
