import React from "react"
import logo from "/public/logo.png"
import {useState, useEffect} from "react"
import {Card, Form, Button, Container, Col} from "react-bootstrap"
import {useNavigate} from "react-router-dom"
import {AlertSuccessComponent, AlertDangerComponent} from "../../components/alert/alert.jsx"
import LoaderComponent from "../../components/loader/loader.jsx"
import SignUpAdminHooks from "../../hooks/signup.jsx"
import "./signup.css"

const SignupPage = () => {
 const [username, setUsername] = useState("")
 const [password, setPassword] = useState("")
 const [success, setsSuccess] = useState("")
 const [error, setError] = useState("")
 const navigate = useNavigate()

 const {SignUp, error: signUpError, loading} = SignUpAdminHooks()

 const HandleSignup = async (e) => {
  e.preventDefault()
  const response = await SignUp(username, password)
  if (response.success) {
   setsSuccess(response.message)
   setTimeout(() => {
    navigate("/login")
   }, 1000)
  } else {
   setError(response.error || signUpError) // Use error from response or hook
  }
 }
 //   try {
 //     const response = await Signup(email, password);
 //     localStorage.setItem("token", response.data.token);
 //     navigate("/login");
 //   } catch (error) {
 //     setError("something went wrong, please try again later");
 //   }
 // }
 return (
  <>
   <div className="signup-wrapper">
    <Card className="signup-card">
     <div id="logo">
      {(error || signUpError) && <AlertDangerComponent message={error || signUpError} />}
      {success && <AlertSuccessComponent message={success} />}
      <img src={logo} alt="logo" className="signup-logo" />
     </div>
     <Card.Body>
      {loading && <LoaderComponent message="Mohon tunggu..." />}
      <Card.Title>Sign Up</Card.Title>
      <Form onSubmit={HandleSignup}>
       <Form.Label>Username</Form.Label>
       <Form.Control
        type="text"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
       />
       <Form.Label>Password</Form.Label>
       <Form.Control
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
       />
       <div className="button btn-btn">
        <Button disabled={loading} type="submit" className="btn btn-primary">
         Sign Up
        </Button>
        <Button disabled={loading} variant="secondary" onClick={() => navigate("/login")}>
         Back to Login
        </Button>
       </div>
      </Form>
     </Card.Body>
    </Card>
   </div>
  </>
 )
}

export default SignupPage
