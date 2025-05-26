import axios from "axios"

// const BASE_URL = "http://localhost:3001/question"
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/question`

const CreateQuestion = (data) => axios.post(`${BASE_URL}/`, data)
const CreateSubQuestion = (data) => axios.post(`${BASE_URL}/subquestion`, data)
const GetQuestionData = () => axios.get(`${BASE_URL}/`) 
const GetQuestionWithSubQuestion = () => axios.get(`${BASE_URL}/getall`) // Data is not typically sent in the body of a GET request
const GetSubQuestionData = () => axios.get(`${BASE_URL}/subquestion/subquestion`) // Data is not typically sent in the body of a GET request
const GetSubQuestionById = (question_id, subquestion_id) =>
 axios.get(`${BASE_URL}/subquestion/subquestion/${question_id}/${subquestion_id}`)
const GetSubQuestionByQustionId = (question_id) => axios.get(`${BASE_URL}/subquestion/subquestion/${question_id}`)
const UpdateQuestion = (question_id, data) => axios.put(`${BASE_URL}/update/${question_id}`, data)
const UpdateSubQuestion = (question_id, subquestion_id, data) =>
 axios.put(`${BASE_URL}/update/${question_id}/${subquestion_id}`, data)
const DeleteQuestion = (question_id) => axios.delete(`${BASE_URL}/delete/${question_id}`)
const DeleteSubQuestion = (question_id, subquestion_id) =>
 axios.delete(`${BASE_URL}/delete/${question_id}/${subquestion_id}`)

export {
 CreateQuestion,
 CreateSubQuestion,
 GetQuestionData,
 GetQuestionWithSubQuestion,
 GetSubQuestionData,
 GetSubQuestionById,
 GetSubQuestionByQustionId,
 UpdateQuestion,
 UpdateSubQuestion,
 DeleteQuestion,
 DeleteSubQuestion
}
