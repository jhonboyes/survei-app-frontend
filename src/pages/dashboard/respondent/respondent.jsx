import React, {useState, useEffect} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {
 faSearch,
 faUserPlus,
 faTrash,
 faPen,
 faEye,
 faChevronLeft,
 faChevronRight
} from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"
import {AlertSuccessComponent, AlertDangerComponent} from "../../../components/alert/alert.jsx"
import "./respondent.css"
import {
 CreateRespondent,
 GetRespondent,
 UpdateRespondent, // Added back UpdateRespondent
 DeleteRespondent // Corrected from DeleteSurveyor
} from "../../../api/respondent.jsx"
import {GetSurveyor} from "../../../api/surveyor.jsx" // Import GetSurveyor
import ExportToExcelButton from "../../../components/excelexport/export.jsx"
import Loader from "../../../components/loader/loader.jsx"

const RespondentPage = () => {
 const [respondents, setRespondents] = useState([])
 const [isloading, setIsloading] = useState(true)
 const [surveyorsData, setSurveyorsData] = useState({}) // State untuk menyimpan data surveyor (nama berdasarkan ID)
 const [localError, setLocalError] = useState("")
 const [success, setSuccess] = useState("") // Renamed from setsSuccess for consistency
 const [searchTerm, setSearchTerm] = useState("")
 const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [currentRespondent, setCurrentRespondent] = useState(null) // Renamed for clarity
 const [isDataDirty, setIsDataDirty] = useState(false)
 const [isImageModalOpen, setIsImageModalOpen] = useState(false)
 const [page, setPage] = useState(1)
 const [itemsPerPage] = useState(50)
 const [currentImage, setCurrentImage] = useState("") // Untuk menyimpan URL gambar yang akan ditampilkan
 const [formData, setFormData] = useState({
  respondent_id: "", // Corrected from respondents_id
  surveyor_id: ""
 })

 // Fetch respondents and surveyors
 useEffect(() => {
  const fetchAllData = async () => {
   setIsloading(true)
   try {
    const [respondentsResponse, surveyorsResponse] = await Promise.all([GetRespondent(), GetSurveyor()])
    const sortedRespondents = respondentsResponse?.data?.sort((a, b) => a.respondent_id - b.respondent_id)
    setRespondents(sortedRespondents || [])
    // Membuat map dari surveyor_id ke nama surveyor untuk pencarian cepat
    const surveyorMap = {}
    ;(surveyorsResponse?.data || []).forEach((surveyor) => {
     surveyorMap[surveyor.surveyor_id] = surveyor.name
    })
    setSurveyorsData(surveyorMap)
   } catch (error) {
    console.error("Error fetching data:", error)
    setLocalError("Gagal memuat data.")
   } finally {
    setIsloading(false)
   }
  }
  fetchAllData()
 }, [isDataDirty])

 // Debounce search term
 useEffect(() => {
  const debounceTimeout = setTimeout(() => {
   setDebouncedSearchTerm(searchTerm)
  }, 500)
  return () => clearTimeout(debounceTimeout)
 }, [searchTerm])

 const handleInputChange = (e) => {
  setSearchTerm(e.target.value) // Corrected typo: setSearchTerm instead of searchTerm
 }

 const handleFormChange = (e) => {
  setFormData({...formData, [e.target.name]: e.target.value})
 }

 const openModal = (respondent = null) => {
  setIsModalOpen(true)
  setLocalError("") // Clear previous errors
  setSuccess("") // Clear previous success messages
  if (respondent) {
   setCurrentRespondent(respondent)
   setFormData({
    respondent_id: respondent.respondent_id,
    surveyor_id: respondent.surveyor_id || ""
    // code is not directly part of the form for editing, it's displayed or handled by backend
   })
  } else {
   setCurrentRespondent(null)
   setFormData({respondent_id: "", surveyor_id: ""})
  }
 }

 const closeModal = () => {
  setIsModalOpen(false)
  setCurrentRespondent(null)
  setFormData({respondent_id: "", surveyor_id: ""})
  setLocalError("")
  setSuccess("")
 }

 const handleSubmit = async (e) => {
  e.preventDefault()
  setLocalError("")
  setSuccess("")

  if (!formData.respondent_id && !currentRespondent) {
   setLocalError("Respondent ID tidak boleh kosong.")
   setTimeout(() => setLocalError(""), 3000)
   return
  }
  if (!formData.surveyor_id) {
   setLocalError("Surveyor ID tidak boleh kosong.")
   setTimeout(() => setLocalError(""), 3000)
   return
  }

  const payload = {
   surveyor_id: formData.surveyor_id.trim()
  }
  // For new respondent, respondent_id is part of payload
  if (!currentRespondent) {
   payload.respondent_id = formData.respondent_id.trim()
  }

  try {
   if (currentRespondent) {
    // For update, respondent_id is in the URL, not payload body
    await UpdateRespondent(currentRespondent.respondent_id, {surveyor_id: formData.surveyor_id.trim()})
    setSuccess("Responden berhasil diperbarui.")
    setTimeout(() => setSuccess(""), 3000)
   } else {
    await CreateRespondent(payload)
    setSuccess("Responden berhasil dibuat.")
    setTimeout(() => setSuccess(""), 3000)
   }
   setIsDataDirty(!isDataDirty) // Memicu re-fetch data
   closeModal()
  } catch (error) {
   console.error("Error saving respondent:", error)
   if (error.response && error.response.data && error.response.data.message) {
    setLocalError(error.response.data.message)
   } else {
    setLocalError("Terjadi kesalahan saat menyimpan responden.")
   }
   setTimeout(() => setLocalError(""), 3000)
  }
 }

 const handleDelete = async (respondentId) => {
  const result = await Swal.fire({
   title: "Yakin ingin menghapus?",
   text: "Data responden akan dihapus permanen.",
   icon: "warning",
   showCancelButton: true,
   confirmButtonColor: "#d33",
   cancelButtonColor: "#3085d6",
   confirmButtonText: "Ya, hapus!",
   cancelButtonText: "Batal"
  })

  if (result.isConfirmed) {
   try {
    await DeleteRespondent(respondentId)
    Swal.fire("Terhapus!", "Responden berhasil dihapus.", "success")
    setIsDataDirty(!isDataDirty) // Memicu re-fetch data
   } catch (error) {
    console.error("Error deleting respondent:", error)
    Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus responden.", "error")
    if (error.response && error.response.data && error.response.data.message) {
     setLocalError(error.response.data.message) // Show specific error if available
    } else {
     setLocalError("Gagal menghapus responden.")
    }
   }
  }
 }

 const getSurveyorNameById = (surveyorId) => {
  return surveyorsData[surveyorId] || surveyorId
 }

 const filteredRespondents = respondents.filter((respondent) => {
  const respondentId = respondent.respondent_id ? respondent.respondent_id.toString().toLowerCase() : ""
  const code = respondent.code ? respondent.code.toLowerCase() : ""
  const surveyorId = respondent.surveyor_id ? respondent.surveyor_id.toString().toLowerCase() : ""
  const surveyorName = (getSurveyorNameById(respondent.surveyor_id) || "").toString().toLowerCase()
  const searchTermLower = debouncedSearchTerm.toLowerCase()

  return (
   respondentId.includes(searchTermLower) ||
   code.includes(searchTermLower) ||
   surveyorId.includes(searchTermLower) ||
   surveyorName.includes(searchTermLower) // Search by surveyor name
  )
 })

 // Pagination
 const indexOfLastItem = page * itemsPerPage
 const indexOfFirstItem = indexOfLastItem - itemsPerPage
 const currentItems = filteredRespondents.slice(indexOfFirstItem, indexOfLastItem)
 const totalPages = Math.ceil(filteredRespondents.length / itemsPerPage)

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

// //  if ( isloading) {
// //   return <div>Memuat Data…</div>
// //  }

 return (
  <div className="respondent-container-fluid">
   <h1>Manajemen Respondent</h1>
   <div className="respondent-actions">
    <div className="respondent-search-wrapper">
     <FontAwesomeIcon icon={faSearch} className="search-icon" />
     <input
      type="text"
      placeholder="Cari resppondent (ID/Nama/Kode tau cari berdasarkan respondent)"
      value={searchTerm}
      onChange={handleInputChange}
      className="search-input"
     />
    </div>
    <button onClick={() => openModal()} className="add-button">
     <FontAwesomeIcon icon={faUserPlus} className="add-icon" /> Tambah
    </button>
    <ExportToExcelButton data={respondents} fileName="respondents" />
   </div>

   {/* Modal untuk menampilkan gambar */}
   {isImageModalOpen && (
    <div className="modal">
     <div className="modal-content-image">
      <h2>Foto Responden</h2>
      <div className="image-container">
       {currentImage ? (
        <img src={currentImage} alt="Foto Responden" className="respondent-image" />
       ) : (
        <p>Tidak ada gambar yang tersedia</p>
       )}
      </div>
      <div className="modal-buttons-image">
       <button type="button" className="cancel-button" onClick={() => setIsImageModalOpen(false)}>
        {" "}
        Tutup{" "}
       </button>
      </div>
     </div>
    </div>
   )}

   {isModalOpen && (
    <div className="modal">
     <div className="modal-content">
      <h2>{currentRespondent ? "Edit Responden" : "Tambah Responden"}</h2>
      {/* /* Display alerts inside modal if modal is open */}
      {localError && <AlertDangerComponent message={localError} />}
      {success && <AlertSuccessComponent message={success} />}
      <form onSubmit={handleSubmit}>
       <div className="form-group">
        <label htmlFor="respondent_id">ID Responden</label>
        <input
         type="text"
         id="respondent_id"
         name="respondent_id"
         value={formData.respondent_id}
         onChange={handleFormChange}
         disabled={!!currentRespondent} // Disable if editing
         required
        />
       </div>
       <div className="form-group">
        <label htmlFor="surveyor_id">ID Surveyor</label>
        <input
         type="text"
         id="surveyor_id"
         name="surveyor_id"
         value={formData.surveyor_id}
         onChange={handleFormChange}
         required
        />
       </div>
       {/* Code is generated by backend, so not an input field here */}
       <div className="modal-buttons">
        <button type="submit" className="submit-button">
         {currentRespondent ? "Simpan Perubahan" : "Tambah"}
        </button>
        <button type="button" className="cancel-button" onClick={closeModal}>
         Batal
        </button>
       </div>
      </form>
     </div>
    </div>
   )}

   <div className="table-container">
    <table className="respondent-table">
     <thead>
      <tr>
       <th className="repondentid-table">Id</th>
       <th className="code-table">Kode</th>
       <th className="surveyorname-table">Surveyor</th>
       <th className="respondentname-table">Nama</th>
       <th className="gender-table">Jenis Kelamin</th>
       <th className="age-table">Usia</th>
       <th className="kelurahan-table">Kelurahan</th>
       <th className="kecamatan-table">Kecamatan</th>
       <th className="telp-table">Telepon</th>
       <th className="jenis-table">Jenis Respondent</th>
       <th className="status-table">status</th>
       <th className="photo_url">foto</th>
       <th className="action-table">Aksi</th>
      </tr>
     </thead>
     <tbody>
      {filteredRespondents.length > 0 ? (
       filteredRespondents.map((respondent) => (
        <tr key={respondent.respondent_id}>
         <td>{respondent.respondent_id}</td>
         <td>{respondent.code}</td>
         <td>{getSurveyorNameById(respondent.surveyor_id)}</td>
         <td className="respondentname-table">{respondent.name}</td>
         <td className="gender-table">{respondent.gender}</td>
         <td className="age-table">{respondent.usia}</td>
         <td className="kelurahan-table">{respondent.kelurahan}</td>
         <td className="kecamatan-table">{respondent.kecamatan}</td>
         <td className="telp-table">{respondent.telp}</td>
         <td className="jenis-table">{respondent.status_respondent}</td>
         <td>{respondent.status}</td>
         <td>
          {respondent.photo_url ? (
           <button
            className="view-button"
            onClick={() => {
             setCurrentImage(respondent.photo_url)
             setIsImageModalOpen(true)
            }}>
            <FontAwesomeIcon icon={faEye} />
           </button>
          ) : (
           "Tidak ada foto"
          )}
         </td>
         <td>
          <div className="action-buttons">
           <button className="edit-button" onClick={() => openModal(respondent)}>
            <FontAwesomeIcon icon={faPen} />
           </button>
           <button className="delete-button" onClick={() => handleDelete(respondent.respondent_id)}>
            <FontAwesomeIcon icon={faTrash} />
           </button>
          </div>
         </td>
        </tr>
       ))
      ) : (
       <tr>
        <td colSpan="13" className="no-data">
         Tidak ada data responden.
        </td>
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
  </div>
 )
}

export default RespondentPage
