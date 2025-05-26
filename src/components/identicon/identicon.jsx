import * as jdenticon from "jdenticon" // FIXED
import {useEffect, useState} from "react"
import "./identicon.css"

const UseIdenticon = ({username}) => {
 const [svg, setSvg] = useState("")

 useEffect(() => {
  if (!username) return

  const url = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(username)}`
  fetch(url)
   .then((res) => res.text())
   .then((data) => {
    setSvg(data)
   })
   .catch(() => setSvg(""))
 }, [username])

 return <div className="identicon" dangerouslySetInnerHTML={{__html: svg}} />
}


export default UseIdenticon
