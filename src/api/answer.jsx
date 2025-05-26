import axios from "axios"

// const BASE_URL = "http://localhost:3001/answer"
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/answer`


const CreateAnswerData = (data) => axios.post(`${BASE_URL}/`, data)
const GetAllAnswerData = () => axios.get(`${BASE_URL}/`)
const GetAnswers = () => axios.get(`${BASE_URL}/answer`)
const GetAnswerById = (answer_id) => axios.get(`${BASE_URL}/answer/${answer_id}`)
const GetAllAnswerWithQuestion = () => axios.get(`${BASE_URL}/question`)
const GetAnswersByQuestionId = (question_id) => axios.get(`${BASE_URL}/question/${question_id}`)
const GetAllSubAnswerBySubQuestion = () => axios.get(`${BASE_URL}/subquestion`)
const GetAllSubAnswerWithQuestionAndSubquestion = () => axios.get(`${BASE_URL}/subquestion/question`)
const GetSubAnswerBySubQuestionId = (subquestion_id) =>
 axios.get(`${BASE_URL}/subquestion/subquestion/${subquestion_id}`)
const GetSubAnswerBySubQuestionIdAndQuestionId = (subquestion_id, question_id) =>
 axios.get(`${BASE_URL}/subquestion/subquestion/${subquestion_id}/${question_id}`)
const GetAnswerByRespondent = () => axios.get(`${BASE_URL}/respondent`)
const GetAnswersByRespondentId = (respondent_id) => axios.get(`${BASE_URL}/respondent/${respondent_id}`)
const GetAnswerWithQuestionByRespondentWithSurveyor = () => axios.get(`${BASE_URL}/surveyor/question`)
const GetAnswerWithQuestionByRespondentWithSurveyorBatch = (page = 1, limit = 100) =>
 axios.get(`${BASE_URL}/batch?page=${page}&limit=${limit}`)
const UpdateAnswer = (code, data) => axios.put(`${BASE_URL}/update/${code}`, data)
const DeleteAnswer = (code) => axios.delete(`${BASE_URL}/delete/${code}`)

export {
 CreateAnswerData,
 GetAllAnswerData,
 GetAnswers,
 GetAnswerById,
 GetAllAnswerWithQuestion,
 GetAnswersByQuestionId,
 GetAllSubAnswerBySubQuestion,
 GetAllSubAnswerWithQuestionAndSubquestion,
 GetSubAnswerBySubQuestionId,
 GetSubAnswerBySubQuestionIdAndQuestionId,
 GetAnswerByRespondent,
 GetAnswersByRespondentId,
 GetAnswerWithQuestionByRespondentWithSurveyor,
 GetAnswerWithQuestionByRespondentWithSurveyorBatch,
 UpdateAnswer,
 DeleteAnswer
}
