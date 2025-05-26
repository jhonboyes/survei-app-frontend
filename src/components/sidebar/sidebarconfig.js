import {faHome, faUser, faCog, faCircleUser, faFile, faPenNib, faGear, faPenToSquare} from "@fortawesome/free-solid-svg-icons"

export const navItems = [
 {name: "Home", path: "/dashboard", icon: faHome},
 {name: "Surveyor", path: "/dashboard/surveyor", icon: faUser},
 {name: "Respondent", path: "/dashboard/respondent", icon: faCircleUser},
 {name: "Question", path: "/dashboard/question", icon: faFile},
 {name: "Answer", path: "/dashboard/answer", icon: faPenNib},
 {name: "FullAnswer", path: "/dashboard/fullanswer", icon: faPenToSquare},
 {name: "Setting", path: "/dashboard/setting", icon: faGear}
]
