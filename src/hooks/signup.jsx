import {useState} from "react"
import {registerAdmin} from "../api/admin.jsx"

const SignUpAdminHooks = () => {
 const [error, setError] = useState("")
 const [loading, setLoading] = useState(false)

 const SignUp = async (username, password) => {
  setLoading(true)
  setError("")
  try {
   const response = await registerAdmin({username, password}) // ← penting!
   return {success: true, message: response.data.message} // bisa pakai message dari backend
  } catch (error) {
   const msg = error.response?.data?.message || "Terjadi kesalahan"
   setError(msg)
   return {success: false, error: msg}
  } finally {
   setLoading(false)
  }
 }

 return {SignUp, error, loading}
}

export default SignUpAdminHooks
