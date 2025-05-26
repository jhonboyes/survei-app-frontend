import React, {useState, useEffect} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSearch, faUserPlus, faTrash, faPen, faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"
import {AlertSuccessComponent, AlertDangerComponent} from "../../../components/alert/alert.jsx"
import {useLocation} from "react-router-dom"
import "./surveyor.css"
import {GetSurveyor, CreateSurveyor, UpdateSurveyor, DeleteSurveyor} from "../../../api/surveyor" // Impor fungsi API
import Loader from "../../../components/loader/loader.jsx"

const SurveyorPage = () => {
 const [surveyors, setSurveyors] = useState([])
 const [localError, setLocalError] = useState("")
 const [isloading, setIsloading] = useState(false)
 const [success, setsSuccess] = useState("")
 const [searchTerm, setSearchTerm] = useState("")
 const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("") // State untuk debounce
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [currentSurveyor, setCurrentSurveyor] = useState(null) // Untuk edit
 const [isDataDirty, setIsDataDirty] = useState(false) // State untuk memicu re-fetch data
  const [page, setPage] = useState(1)
  const [itemsPerPage] = useState(10)
 const [formData, setFormData] = useState({
  surveyor_id: "",
  name: "",
  code: "", // Tambahkan inisialisasi untuk code
  assignedrange_start: "",
  assignedrange_end: ""
 })

 // Fetch surveyors
 useEffect(() => {
  const fetchSurveyors = async () => {
   setIsloading(true)
   try {
    const response = await GetSurveyor()
    const sorteredSurveyors = response?.data?.sort((a, b) => a.surveyor_id - b.surveyor_id) || []
    setSurveyors(sorteredSurveyors || [])
   } catch (error) {
    console.error("Error fetching surveyors:", error)
   } finally {
    setIsloading(false)
   }
  }
  fetchSurveyors()
 }, [isDataDirty])

 // Debounce search term
 useEffect(() => {
  const timerId = setTimeout(() => {
   setDebouncedSearchTerm(searchTerm)
  }, 500) // Atur delay debounce (misalnya 500ms)
  return () => {
   clearTimeout(timerId)
  }
 }, [searchTerm])

 const handleInputChange = (e) => {
  setSearchTerm(e.target.value)
 }

 const handleFormChange = (e) => {
  setFormData({...formData, [e.target.name]: e.target.value})
 }

 const openModal = (surveyor = null) => {
  setIsModalOpen(true)
  if (surveyor) {
   setCurrentSurveyor(surveyor)
   setCurrentSurveyor(surveyor)
   setFormData({
    surveyor_id: surveyor.surveyor_id,
    name: surveyor.name,
    code: surveyor.code || "", // Isi code dari surveyor yang diedit
    assignedrange_start: surveyor.assignedrange?.start || "",
    assignedrange_end: surveyor.assignedrange?.end || ""
   })
  } else {
   setCurrentSurveyor(null)
   setFormData({surveyor_id: "", name: "", code: "", assignedrange_start: "", assignedrange_end: ""})
  }
 }

 const closeModal = () => {
  setIsModalOpen(false)
  setCurrentSurveyor(null)
  setFormData({surveyor_id: "", name: "", code: "", assignedrange_start: "", assignedrange_end: ""})
 }

 const handleSubmit = async (e) => {
  e.preventDefault()
  setLocalError("") // Reset error before new submission
  setsSuccess("") // Reset success message

  // Validasi Frontend Tambahan
  if (currentSurveyor) {
   // Mode Edit
   if (!formData.name || formData.name.trim() === "") {
    setLocalError("Nama surveyor tidak boleh kosong.")
    return
   }
   if (!formData.code || formData.code.trim() === "") {
    setLocalError("Kode surveyor tidak boleh kosong.")
    return
   }
   if (
    formData.assignedrange_start === "" ||
    formData.assignedrange_start === null ||
    formData.assignedrange_end === "" ||
    formData.assignedrange_end === null
   ) {
    setLocalError("Assigned Range Start dan End tidak boleh kosong.")
    return
   }
   if (parseInt(formData.assignedrange_start, 10) >= parseInt(formData.assignedrange_end, 10)) {
    setLocalError("Assigned Range Start harus lebih kecil dari Assigned Range End.")
    return
   }
  } else {
   // Mode Create
   if (!formData.surveyor_id || formData.surveyor_id.trim() === "") {
    setLocalError("Surveyor ID tidak boleh kosong.")
    return
   }
   if (
    formData.assignedrange_start === "" ||
    formData.assignedrange_start === null ||
    formData.assignedrange_end === "" ||
    formData.assignedrange_end === null
   ) {
    setLocalError("Assigned Range Start dan End tidak boleh kosong.")
    return
   }
   if (parseInt(formData.assignedrange_start, 10) >= parseInt(formData.assignedrange_end, 10)) {
    setLocalError("Assigned Range Start harus lebih kecil dari Assigned Range End.")
    return
   }
  }

  // Definisikan payload berdasarkan apakah ini operasi create atau update
  let payload = {}
  if (currentSurveyor) {
   // Untuk update, JANGAN sertakan surveyor_id dalam body payload jika sudah di URL
   payload = {
    name: formData.name.trim(),
    code: formData.code.trim(), // Pastikan code dikirim saat update dan di-trim
    assignedrange: {
     start: parseInt(formData.assignedrange_start, 10),
     end: parseInt(formData.assignedrange_end, 10)
    }
   }
  } else {
   // Untuk create
   payload = {
    surveyor_id: formData.surveyor_id.trim(),
    name: formData.name.trim(),
    // code tidak di-set saat create, kecuali backend mengharapkannya
    assignedrange: {
     start: parseInt(formData.assignedrange_start, 10),
     end: parseInt(formData.assignedrange_end, 10)
    }
   }
  }

  // Tambahan validasi untuk NaN pada assignedrange setelah parsing
  if (payload.assignedrange && (isNaN(payload.assignedrange.start) || isNaN(payload.assignedrange.end))) {
   setLocalError("Assigned Range Start dan End harus berupa angka yang valid.")
   return
  }

  try {
   if (currentSurveyor) {
    const response = await UpdateSurveyor(currentSurveyor.surveyor_id, payload) // payload sudah disiapkan di atas
    setsSuccess("Surveyor berhasil diperbarui.")

    // Perbarui state surveyors secara langsung
    setSurveyors((prevSurveyors) => {
     return prevSurveyors.map((surveyor) => {
      if (surveyor.surveyor_id === currentSurveyor.surveyor_id) {
       return {
        ...surveyor,
        name: payload.name,
        code: payload.code,
        assignedrange: payload.assignedrange
       }
      }
      return surveyor
     })
    })

    setIsDataDirty(true) // Tetap memicu re-fetch data untuk sinkronisasi
   } else {
    // payload untuk create sudah disiapkan di atas
    const response = await CreateSurveyor(payload)
    setsSuccess("Surveyor berhasil dibuat.")

    // Tambahkan surveyor baru langsung ke state
    if (response && response.data) {
     setSurveyors((prevSurveyors) => [...prevSurveyors, response.data])
    } else {
     // Jika response tidak memiliki data, tambahkan payload ke state
     // dengan asumsi backend mengembalikan data yang sama dengan yang dikirim
     setSurveyors((prevSurveyors) => [
      ...prevSurveyors,
      {
       surveyor_id: payload.surveyor_id,
       name: payload.name,
       assignedrange: payload.assignedrange,
       // code mungkin dihasilkan oleh backend
       code: response?.data?.code || ""
      }
     ])
    }

    setIsDataDirty(true) // Tetap memicu re-fetch data untuk sinkronisasi
   }
   closeModal()
  } catch (error) {
   console.error("Error saving surveyor:", error)
   if (error.response && error.response.data && error.response.data.message) {
    setLocalError(error.response.data.message)
   } else {
    setLocalError("Terjadi kesalahan saat menyimpan surveyor.")
   }
  }
 }

 const handleDelete = async (surveyorId) => {
  const result = await Swal.fire({
   title: "Yakin ingin menghapus?",
   text: "Data surveyor akan dihapus permanen.",
   icon: "warning",
   showCancelButton: true,
   confirmButtonColor: "#d33",
   cancelButtonColor: "#3085d6",
   confirmButtonText: "Ya, hapus!",
   cancelButtonText: "Batal"
  })

  if (result.isConfirmed) {
   try {
    await DeleteSurveyor(surveyorId)
    Swal.fire("Terhapus!", "Surveyor berhasil dihapus.", "success")

    // Perbarui state surveyors secara langsung dengan menghapus surveyor yang dihapus
    setSurveyors((prevSurveyors) => prevSurveyors.filter((surveyor) => surveyor.surveyor_id !== surveyorId))

    setIsDataDirty(true) // Tetap memicu re-fetch data untuk sinkronisasi
   } catch (error) {
    console.error("Error deleting surveyor:", error)
    Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus.", "error")
   }
  }
 }

 const filteredSurveyors = surveyors.filter((surveyor) => {
  const term = debouncedSearchTerm.toLowerCase()
  const surveyorIdString = String(surveyor.surveyor_id) // Konversi surveyor_id ke string

  return (
   (surveyor.name && surveyor.name.toLowerCase().includes(term)) ||
   (surveyorIdString && surveyorIdString.toLowerCase().includes(term)) ||
   (surveyor.code && surveyor.code.toLowerCase().includes(term))
  )
 })

 // Pagination
 // Pagination
 const indexOfLastItem = page * itemsPerPage
 const indexOfFirstItem = indexOfLastItem - itemsPerPage
 const currentItems = filteredSurveyors.slice(indexOfFirstItem, indexOfLastItem)
 const totalPages = Math.ceil(filteredSurveyors.length / itemsPerPage)

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
  <div className="surveyor-container-fluid">
   <h1>Manajemen Surveyor</h1>
   <div className="surveyor-actions">
    <div className="search-wrapper">
     <FontAwesomeIcon icon={faSearch} className="search-icon" />
     <input
      type="text"
      placeholder="Cari Surveyor (ID/Nama/Kode)"
      value={searchTerm}
      onChange={handleInputChange}
      className="search-input"
     />
    </div>
    <button onClick={() => openModal()} className="add-button">
     <FontAwesomeIcon icon={faUserPlus} className="add-icon" /> Tambah
    </button>
   </div>

   {isModalOpen && (
    <div className="modal">
     <div className="modal-content">
      {localError && <AlertDangerComponent message={localError} />}
      {success && <AlertSuccessComponent message={success} />}
      <h2>{currentSurveyor ? "Edit Surveyor" : "Tambah Surveyor Baru"}</h2>
      <form onSubmit={handleSubmit}>
       <label>
        Surveyor ID:
        <input
         type="text"
         name="surveyor_id"
         value={formData.surveyor_id}
         onChange={handleFormChange}
         required
         disabled={!!currentSurveyor}
        />
       </label>
       <label>
        Nama:
        <input type="text" name="name" value={formData.name} onChange={handleFormChange} />
       </label>
       {currentSurveyor && (
        <label>
         Kode:
         <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleFormChange}
          required
          disabled={!!currentSurveyor}
         />
        </label>
       )}
       <label>
        Assigned Range Start:
        <input
         type="number" // Change type to number for better UX and validation
         name="assignedrange_start"
         value={formData.assignedrange_start}
         onChange={handleFormChange}
         required
        />
       </label>
       <label>
        Assigned Range End:
        <input
         type="number" // Change type to number for better UX and validation
         name="assignedrange_end"
         value={formData.assignedrange_end}
         onChange={handleFormChange}
         required
        />
       </label>
       <div className="modal-buttons">
        <button type="submit">{currentSurveyor ? "Update" : "Simpan"}</button>
        <button type="button" onClick={closeModal}>
         Batal
        </button>
       </div>
      </form>
     </div>
    </div>
   )}

   <table className="surveyor-table">
    <thead>
     <tr>
      <th className="surveyorid-tabel">Surveyor ID</th>
      <th className="name-table">Nama</th>
      <th className="code-table">Kode</th>
      <th className="range-tabel">Range</th>
      <th className="action-tabel">Aksi</th>
     </tr>
    </thead>
    <tbody>
     {filteredSurveyors.length > 0 ? (
      filteredSurveyors.map((surveyor) => (
       <tr key={surveyor.surveyor_id}>
        <td>{surveyor.surveyor_id}</td>
        <td>{surveyor.name}</td>
        <td>{surveyor.code}</td>
        <td>{surveyor.assignedrange ? `${surveyor.assignedrange.start} - ${surveyor.assignedrange.end}` : ""}</td>
        <td>
         <div className="action-buttons">
          <button onClick={() => openModal(surveyor)} className="edit-button">
           <FontAwesomeIcon icon={faPen} className="add-icon" />
          </button>
          <button onClick={() => handleDelete(surveyor.surveyor_id)} className="delete-button">
           <FontAwesomeIcon icon={faTrash} className="add-icon" />
          </button>
         </div>
        </td>
       </tr>
      ))
     ) : (
      <tr>
       <td colSpan="5">Tidak ada data surveyor.</td>
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

export default SurveyorPage
