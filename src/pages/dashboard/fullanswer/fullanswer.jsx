import React, {useState, useEffect} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSearch, faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons"
import {GetAnswerWithQuestionByRespondentWithSurveyorBatch} from "../../../api/answer.jsx"
import ExportToExcelButton from "../../../components/excelexport/export.jsx"
import Loader from "../../../components/loader/loader.jsx"
import "./fullanswer.css"

const FullAnswerPage = () => {
 const [searchTerm, setSearchTerm] = useState("")
 const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
 const [pivotedData, setPivotedData] = useState([])
 const [questionHeaders, setQuestionHeaders] = useState([])

 const [page, setPage] = useState(1)
 const [limit] = useState(100)
 const [totalPage, setTotalPage] = useState(1)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState(null)

const flattenData = (data) => {
 const flat = []
 data.forEach((respondent) => {
  const respondentName = respondent.name || "Tanpa Nama Responden"
  const surveyorName = respondent.surveyor?.name || "Tanpa Nama Surveyor"
  if (!respondent.answers || respondent.answers.length === 0) return
  respondent.answers.forEach((ans) => {
   const questionText = ans.question?.question || "Pertanyaan kosong"
   const answerText = Array.isArray(ans.answer) && ans.answer.length > 0 ? ans.answer.join(", ") : ans.answer || "-"
   flat.push({
    respondent_id: respondent.respondent_id,
    respondent: respondentName,
    surveyor: surveyorName,
    question: questionText,
    answer: answerText
   })
  })
 })
 return flat
}

 const pivotData = (data) => {
  const pivoted = {}
  const allQuestions = new Set()

  data.forEach((item) => {
   const key = `${item.respondent}||${item.surveyor}`
   if (!pivoted[key]) {
    pivoted[key] = {
     respondent_id: item.respondent_id,
     respondent: item.respondent,
     surveyor: item.surveyor,
     answers: {}
    }
   }
   if (item.question) {
    pivoted[key].answers[item.question] = item.answer || "-"
    allQuestions.add(item.question)
   }
  })

  const pivotedArray = Object.values(pivoted)
  const headers = Array.from(allQuestions)
  return {pivotedArray, headers}
 }

 const fetchData = async () => {
  setLoading(true)
  setError(null)
  try {
   const response = await GetAnswerWithQuestionByRespondentWithSurveyorBatch(page, limit)
   const rawData = response.data.data
   const totalCount = response.data.totalCount || 100

   const flatData = flattenData(rawData)
   const {pivotedArray, headers} = pivotData(flatData)
   setPivotedData(pivotedArray)
   setQuestionHeaders(headers)
   setTotalPage(Math.ceil(totalCount / limit))
  } catch (error) {
   console.error("Error fetching data:", error)
   setError("Gagal memuat data. Silakan coba lagi.")
  } finally {
   setLoading(false)
  }
 }

 useEffect(() => {
  fetchData()
 }, [page])

 useEffect(() => {
  const timer = setTimeout(() => {
   setDebouncedSearchTerm(searchTerm)
  }, 500)
  return () => clearTimeout(timer)
 }, [searchTerm])

 const handleInputChange = (e) => {
  setSearchTerm(e.target.value)
 }

 const filteredData = pivotedData.filter(
  (item) =>
   item.respondent.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
   item.surveyor.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
 )

 const exportData = filteredData.map((item) => {
  const row = {
   id: item.respondent_id,
   Surveyor: item.surveyor,
   Responden: item.respondent
  }
  questionHeaders.forEach((q) => {
   row[q] = item.answers[q] || "-"
  })
  return row
 })

  if (loading) {
   return (
    <>
     <div className="loader-container">
      <Loader />
     </div>
    </>
   )
  }

 return (
  <div className="answer-container-fluid">
   <h1>Manajemen Jawaban</h1>

   <div className="question-actions">
    <div className="search-wrapper">
     <FontAwesomeIcon icon={faSearch} className="search-icon" />
     <input
      type="text"
      placeholder="Cari..."
      value={searchTerm}
      onChange={handleInputChange}
      className="search-input"
     />
    </div>
    <div className="export-button-wrapper">
     <ExportToExcelButton data={exportData} filename="JawabanSurvei.xlsx" className="export-button" />
    </div>
   </div>

   {/* {loading && <p className="loading-text">Memuat data...</p>} */}
   {error && <p className="error-text">{error}</p>}

   <table className="answer-table">
    <thead>
     <tr>
      <th>ID</th>
      <th>Surveyor</th>
      <th>Responden</th>
      {questionHeaders.map((header, index) => (
       <th key={index}>{header}</th>
      ))}
     </tr>
    </thead>
    <tbody>
     {filteredData.length === 0 ? (
      <tr>
       <td colSpan={3 + questionHeaders.length}>Data tidak ditemukan.</td>
      </tr>
     ) : (
      filteredData.map((item, index) => (
       <tr key={index}>
        <td>{item.respondent_id}</td>
        <td>{item.surveyor}</td>
        <td>{item.respondent}</td>
        {questionHeaders.map((header, i) => (
         <td key={i}>{item.answers[header] || "-"}</td>
        ))}
       </tr>
      ))
     )}
    </tbody>
   </table>

   <div className="pagination-controls">
    <button
     className="pagination-button"
     onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
     disabled={page === 1 || loading}>
     <FontAwesomeIcon icon={faChevronLeft} /> Prev
    </button>
    <span className="pagination-info">
     Halaman {page} dari {totalPage}
    </span>
    <button
     className="pagination-button"
     onClick={() => setPage((prev) => Math.min(prev + 1, totalPage))}
     disabled={page === totalPage || loading}>
     Next <FontAwesomeIcon icon={faChevronRight} />
    </button>
   </div>
  </div>
 )
}

export default FullAnswerPage
