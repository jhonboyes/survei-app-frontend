import axios from "axios"

// const BASE_URL = "http://localhost:3001/surveyor"
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/surveyor`

export const CreateSurveyor = (data) => axios.post(`${BASE_URL}/`, data)
export const GetSurveyor = () => axios.get(`${BASE_URL}/`) // Removed data param as it's for all surveyors
export const GetSurveyorById = (surveyor_id) => axios.get(`${BASE_URL}/${surveyor_id}`)
export const updatesurveyoraname = (surveyor_id) => axios.get(`${BASE_URL}/name/${surveyor_id}`)
export const UpdateSurveyor = (surveyor_id, data) => axios.put(`${BASE_URL}/update/${surveyor_id}`, data)
export const DeleteSurveyor = (surveyor_id) => axios.delete(`${BASE_URL}/delete/${surveyor_id}`)
