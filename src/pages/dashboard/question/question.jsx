import React, {useState, useEffect} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSearch, faUserPlus, faTrash, faPen, faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"
import {AlertSuccessComponent, AlertDangerComponent} from "../../../components/alert/alert.jsx"
import Loader from "../../../components/loader/loader"
import {useLocation} from "react-router-dom"
import "./question.css"
import {
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
} from "../../../api/question" // Impor fungsi API

const QuestionPage = () => {
 const [localError, setLocalError] = useState("")
 const [localSuccess, setLocalSuccess] = useState("")
 const [isloading, setIsloading] = useState(false)
 const [searchTerm, setSearchTerm] = useState("")
 const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isDataDirty, setIsDataDirty] = useState(false)
 const [question, setQuestion] = useState([])
 const [subquestion, setSubquestion] = useState([])
 const [currentQuestion, setCurrentQuestion] = useState(null)
 const [currentSubQuestion, setCurrentSubQuestion] = useState(null)
 const [page, setPage] = useState(1)
 const [itemsPerPage] = useState(10)

 const [questionData, setQuestionData] = useState({
  question_id: "",
  code: "", // Assuming code might still be relevant for main question
  question: "",
  type: "",
  options: [] // Added to hold dynamic subquestions
 })

 useEffect(() => {
  const fetchQuestionData = async () => {
    setIsloading(true)
   try {
    const response = await GetQuestionData()
    const sortedQuestions = response.data.sort((a, b) => a.question_id - b.question_id)
    setQuestion(sortedQuestions)
   } catch (error) {
    console.error("Error fetching question data:", error)
   } finally {
    setIsloading(false)
   }
  }
  fetchQuestionData()
 }, [isDataDirty])

 // Debounce search term
 useEffect(() => {
  const timerId = setTimeout(() => {
   setDebouncedSearchTerm(searchTerm)
  }, 500) // Delay 500ms
  return () => clearTimeout(timerId)
 }, [searchTerm])

 useEffect(() => {
  setQuestionData((prev) => ({
   ...prev,
   options: Array.isArray(prev.options)
    ? prev.options
    : prev.options
    ? prev.options.split(",").map((opt) => opt.trim())
    : []
  }))
 }, [currentQuestion])

 // Filter questions based on search term
 const filteredQuestions = question.filter((q) => {
  const searchLower = debouncedSearchTerm.toLowerCase()
  return (
   (q.question_id && q.question_id.toString().toLowerCase().includes(searchLower)) ||
   (q.code && q.code.toLowerCase().includes(searchLower)) ||
   (q.question && q.question.toLowerCase().includes(searchLower)) ||
   (q.type && q.type.toLowerCase().includes(searchLower)) ||
   (Array.isArray(q.options) && q.options.some((opt) => opt.toLowerCase().includes(searchLower)))
  )
 })

 const handleInputChange = (e) => {
  setSearchTerm(e.target.value)
 }

 const handleAddQuestion = () => {
  setIsModalOpen(true)
  setCurrentQuestion(null)
  setQuestionData({
   question_id: "",
   question: "",
   type: "",
   options: []
  })
 }

 const handleFormChange = (e) => {
  const {name, value} = e.target
  if (name === "options") {
   setQuestionData({...questionData, [name]: value.split(",").map((opt) => opt.trim())})
  } else {
   setQuestionData({...questionData, [name]: value})
  }
 }

 const handleOptionChange = (value, index) => {
  const updatedOptions = [...questionData.options]
  updatedOptions[index] = value
  setQuestionData({...questionData, options: updatedOptions})
 }

 const addOption = () => {
  const updatedOptions = [...questionData.options, ""]
  setQuestionData({...questionData, options: updatedOptions})
 }

 const removeOption = (index) => {
  const updatedOptions = questionData.options.filter((_, idx) => idx !== index)
  setQuestionData({...questionData, options: updatedOptions})
 }

 const closeModal = () => {
  setIsModalOpen(false)
  setCurrentQuestion(null)
  setQuestionData({
   question_id: "",
   code: "",
   question: "",
   type: "",
   options: []
  })
  setLocalError("")
  setLocalSuccess("")
 }

 const editQuestion = (question) => {
  setIsModalOpen(true)
  setCurrentQuestion(question)
  setQuestionData({
   question_id: question.question_id,
   code: question.code || "", // code might not always exist
   question: question.question,
   type: question.type,
   options: Array.isArray(question.options)
    ? question.options
    : question.options
    ? String(question.options)
       .split(",")
       .map((opt) => opt.trim())
    : []
  })
  setLocalError("")
  setLocalSuccess("")
 }

 const deleteQuestion = async (questionToDelete) => {
  const result = await Swal.fire({
   title: "Yakin ingin menghapus?",
   text: `Pertanyaan "${questionToDelete.question}" akan dihapus permanen.`,
   icon: "warning",
   showCancelButton: true,
   confirmButtonColor: "#d33",
   cancelButtonColor: "#3085d6",
   confirmButtonText: "Ya, hapus!",
   cancelButtonText: "Batal"
  })

  if (result.isConfirmed) {
   try {
    await DeleteQuestion(questionToDelete.question_id)
    Swal.fire("Terhapus!", "Pertanyaan berhasil dihapus.", "success")
    setIsDataDirty(!isDataDirty) // Memicu re-fetch data
    setLocalSuccess("Pertanyaan berhasil dihapus.")
    setTimeout(() => {
     setLocalSuccess("")
    }, 2000)
   } catch (error) {
    console.error("Error deleting question:", error)
    Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus pertanyaan.", "error")
    if (error.response && error.response.data && error.response.data.message) {
     setLocalError(error.response.data.message)
    } else {
     setLocalError("Gagal menghapus pertanyaan.")
    }
   }
  }
 }

 const handleSubmit = async (e) => {
  e.preventDefault()
  setLocalError("")
  setLocalSuccess("")
  if (!questionData.question.trim()) {
   setLocalError("Pertanyaan tidak boleh kosong.")
   return
  }
  if (!questionData.type.trim()) {
   setLocalError("Jenis pertanyaan tidak boleh kosong.")
   setTimeout(() => setLocalError(""), 3000)
   return
  }
  if (!currentQuestion && !questionData.question_id.trim()) {
   setLocalError("ID Pertanyaan tidak boleh kosong untuk pertanyaan baru.")
   setTimeout(() => setLocalError(""), 3000)
   return
  }

  const payload = {
   question: questionData.question,
   type: questionData.type,
   options: questionData.options // Ensure options are in the correct format for the API
  }

  try {
   if (currentQuestion) {
    await UpdateQuestion(currentQuestion.question_id, payload)
    setLocalSuccess("Pertanyaan berhasil diperbarui.")
    Swal.fire({
     icon: "success",
     title: "Berhasil!",
     text: "Pertanyaan berhasil diperbarui",
     timer: 2000,
     showConfirmButton: false
    })
   } else {
    payload.question_id = questionData.question_id
    console.log("Payload:", payload)
    await CreateQuestion(payload)
    setLocalSuccess("Pertanyaan berhasil ditambahkan.")
    Swal.fire({
     icon: "success",
     title: "Berhasil!",
     text: "Pertanyaan berhasil ditambahkan",
     timer: 2000,
     showConfirmButton: false
    })
   }
   setIsDataDirty(!isDataDirty)
   setTimeout(() => {
    setLocalSuccess("")
   }, 2000)
   closeModal()
  } catch (error) {
   console.error("Error saving question:", error)
   if (error.response && error.response.data && error.response.data.message) {
    setLocalError(error.response.data.message)
    setTimeout(() => setLocalError(""), 3000)
   } else {
    setLocalError("Terjadi kesalahan saat menyimpan pertanyaan.")
    setTimeout(() => setLocalError(""), 3000)
   }
  }
 }

 // Calculate pagination
 const indexOfLastItem = page * itemsPerPage
 const indexOfFirstItem = indexOfLastItem - itemsPerPage
 const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem)
 const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage)

 const handleNextPage = () => {
  if (page < totalPages) {
   setPage(page + 1)
  }
 }

 const handlePrevPage = () => {
  if (page > 1) {
   setPage(page - 1)
  }
 }

  if (isloading) {
   return (
    <>
     <div className="loader-container">
      <Loader />
     </div>
    </>
   )
  }

 return (
  <div className="question-container-fluid">
   <h1>Managemen Pertanyaan</h1>
   <div className="question-actions">
    <div className="question-search-wrapper">
     <FontAwesomeIcon icon={faSearch} className="search-icon" />
     <input
      type="text"
      placeholder="Cari pertanyaan..."
      value={searchTerm}
      onChange={handleInputChange}
      className="search-input"
     />
    </div>
    <button className="add-button" onClick={handleAddQuestion}>
     <FontAwesomeIcon icon={faUserPlus} className="add-icon" /> Tambah
    </button>
   </div>

   {localSuccess && <AlertSuccessComponent message={localSuccess} />}
   {localError && <AlertDangerComponent message={localError} />}

   {isModalOpen && (
    <div className="modal">
     <div className="modal-content">
      {localSuccess && <AlertSuccessComponent message={localSuccess} />}
      {localError && <AlertDangerComponent message={localError} />}
      <h2>{currentQuestion ? "Edit Pertanyaan" : "Tambah Pertanyaan"}</h2>
      <form onSubmit={handleSubmit}>
       {!currentQuestion && (
        <div className="form-group">
         <label htmlFor="question_id">ID Pertanyaan</label>
         <input
          type="text"
          id="question_id"
          name="question_id"
          value={questionData.question_id}
          onChange={handleFormChange}
          placeholder="Contoh: 1"
         />
        </div>
       )}
       <div className="form-group">
        <label htmlFor="question">Pertanyaan</label>
        <textarea
         id="question"
         name="question"
         value={questionData.question}
         onChange={handleFormChange}
         placeholder="Masukkan teks pertanyaan"
         required
        />
       </div>
       <div className="form-group">
        <label htmlFor="type">Jenis</label>
        <select id="type" name="type" value={questionData.type} onChange={handleFormChange} required>
         <option value="">Pilih Jenis</option>
         <option value="text">Text</option>
         <option value="multiple_choice">Multiple Choice</option>
         <option value="checkbox">Checkbox</option>
         <option value="radio">Radio</option>
         <option value="dropdown">Dropdown</option>
         <option value="rating">Rating</option>
        </select>
       </div>
       {questionData.type !== "text" && (
        <div className="form-group">
         <label>Opsi</label>
         <div className="options-list">
          {questionData.options.map((opt, idx) => (
           <div key={idx} className="option-item">
            <input
             type="text"
             value={opt}
             onChange={(e) => handleOptionChange(e.target.value, idx)}
             placeholder={`Opsi ${idx + 1}`}
            />
            <button type="button" onClick={() => removeOption(idx)} className="remove-option-button">
             X
            </button>
           </div>
          ))}
         </div>
         <button type="button" onClick={addOption} className="add-option-button">
          + Tambah Opsi
         </button>
        </div>
       )}
       <div className="modal-buttons">
        <button type="submit" className="submit-button">
         {currentQuestion ? "Simpan" : "Tambah"}
        </button>
        <button type="button" onClick={closeModal} className="cancel-button">
         Batal
        </button>
       </div>
      </form>
     </div>
    </div>
   )}

   <table className="question-table">
    <thead>
     <tr>
      <th className="id-table">Id</th>
      <th className="code-table">Kode</th>
      <th className="question-table">Pertanyaan</th>
      <th className="type-table">Jenis</th>
      <th className="option-table">Opsi</th>
      <th className="action-table">Aksi</th>
     </tr>
    </thead>
    <tbody>
     {currentItems.length > 0 ? (
      currentItems.map((question) => (
       <tr key={question.question_id}>
        <td>{question.question_id}</td>
        <td>{question.code}</td>
        <td className="question-row">{question.question}</td>
        <td>{question.type}</td>
        <td>
         <ul>
          {question && Array.isArray(question.options)
           ? question.options.map((opt, idx) => (
              <li key={idx} className="questio-option">
               <span> {idx + 1}. </span>
               <span> {opt} </span>
              </li>
             ))
           : question.options}
         </ul>
        </td>
        <td>
         <div className="action-buttons">
          <button className="edit-button" onClick={() => editQuestion(question)}>
           <FontAwesomeIcon icon={faPen} className="edit-icon" /> Edit
          </button>
          <button className="delete-button" onClick={() => deleteQuestion(question)}>
           <FontAwesomeIcon icon={faTrash} className="delete-icon" /> Hapus
          </button>
         </div>
        </td>
       </tr>
      ))
     ) : (
      <tr>
       <td colSpan="6">Tidak ada Data Question</td>
      </tr>
     )}
    </tbody>
   </table>
   <div className="pagination-controls">
    <button className="pagination-button" onClick={handlePrevPage} disabled={page === 1}>
     <FontAwesomeIcon icon={faChevronLeft} />
     Prev
    </button>
    <span data-pagination-info>
     {page} dari {totalPages}
    </span>
    <button className="pagination-button" onClick={handleNextPage} disabled={page === totalPages}>
     Next <FontAwesomeIcon icon={faChevronRight} />
    </button>
   </div>
  </div>
 )
}

export default QuestionPage
