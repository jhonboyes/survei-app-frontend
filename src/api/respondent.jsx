import axios from "axios"

// const BASE_URL = "http://localhost:3001/respondent"
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/respondent`

const CreateRespondent = (data) => axios.post(`${BASE_URL}/`, data)
const GetRespondent = (data) => axios.get(`${BASE_URL}/`, data) // Removed data param as it's for all surveyors
const GetRespondentBySurveyor = (data) => axios.get(`${BASE_URL}/respondent`, data)
const GetRespondentById = (respondent_id) => axios.get(`${BASE_URL}/respondent/${respondent_id}`)
const GetRespondentBySurveyorId = (surveyor_id) => axios.get(`${BASE_URL}/respondent/surveyor/${surveyor_id}`)
const UpdateRespondent = (respondent_id, data) => axios.put(`${BASE_URL}/update/${respondent_id}`, data)
const DeleteRespondent = (respondent_id) => axios.delete(`${BASE_URL}/delete/${respondent_id}`)

export {
 CreateRespondent,
 GetRespondent,
 GetRespondentBySurveyor,
 GetRespondentById,
 GetRespondentBySurveyorId,
 UpdateRespondent,
 DeleteRespondent
}
