import {useState} from "react"
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"
import LoginPage from "./pages/login/login"
import SignupPage from "./pages/signup/signup"
import Dashboard from "./pages/dashboard/dashboard"
import Home from "./pages/dashboard/home/home"
import SurveyorPage from "./pages/dashboard/surveyor/surveyor.jsx"
import RespondentPage from "./pages/dashboard/respondent/respondent.jsx"
import QuestionPage from "./pages/dashboard/question/question.jsx"
import AnswerPage from "./pages/dashboard/answer/answer.jsx"
import FullAnswerPage from "./pages/dashboard/fullanswer/fullanswer.jsx"
import SettingPage from "./pages/dashboard/setting/setting.jsx"
import PrivateRoute from "./hooks/privateroute"
import "./App.css"

function App() {
 return (
  <Router>
   <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />

    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route
     path="/dashboard/*"
     element={
      <PrivateRoute>
       <Dashboard />
      </PrivateRoute>
     }>
     <Route index element={<Home />} />
     <Route path="surveyor" element={<SurveyorPage />} />
     <Route path="respondent" element={<RespondentPage />} />
     <Route path="question" element={<QuestionPage />} />
     <Route path="answer" element={<AnswerPage />} />
     <Route path="fullanswer" element={<FullAnswerPage />} />
     <Route path="setting" element={<SettingPage />} />
    </Route>
   </Routes>
  </Router>
 )
}

export default App
