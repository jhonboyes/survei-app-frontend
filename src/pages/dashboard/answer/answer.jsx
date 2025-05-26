import React, {useState, useEffect, useMemo} from "react"
import {
 faChevronLeft,
 faChevronRight
} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {Card} from "react-bootstrap"
import "./answer.css"
import {GetAnswerWithQuestionByRespondentWithSurveyor} from "../../../api/answer.jsx"
import Loader from "../../../components/loader/loader.jsx"

const AnswerPage = () => {
 const [data, setData] = useState([]) // Array of { surveyor_id, name, respondents: [...] }
 const [isLoading, setIsLoading] = useState(false)
 const [searchKeyword, setSearchKeyword] = useState("")
 const [searchSurveyor, setSearchSurveyor] = useState("")
 const [selectedSurveyorId, setSelectedSurveyorId] = useState("all")

 // --- filters untuk kolom respondent ---
 const [filterStatus, setFilterStatus] = useState("")
 const [filterGender, setFilterGender] = useState("")
 const [filterKecamatan, setFilterKecamatan] = useState("")
 const [filterKelurahan, setFilterKelurahan] = useState("")
 const [filterUsia, setFilterUsia] = useState("")
 const [filterSurveyor, setfilterSurveyor] = useState("")
 const [filterStatusRespondent, setfilterStatusRespondent] = useState("")
 const [page, setPage] = useState(1)
 const [itemsPerPage] = useState(10)

 // Fetch data sekali
 useEffect(() => {
  const fetchData = async () => {
   setIsLoading(true)
   try {
    const res = await GetAnswerWithQuestionByRespondentWithSurveyor()
    const items = Array.isArray(res.data) ? res.data : res.data?.data ?? []
    setData(items)
   } catch (err) {
    console.error(err)
    setData([])
   } finally {
    setIsLoading(false)
   }
  }
  fetchData()
 }, [])

 // Surveyor search + filter
 const allRespondents = useMemo(() => {
  return data.flatMap((s) =>
   (s.respondents || []).map((r) => ({
    ...r,
    surveyor_id: s.surveyor_id,
    surveyor_name: s.name
   }))
  )
 }, [data])

 const filteredSurveyors = useMemo(() => {
  return data.filter((s) => s.name?.toLowerCase().includes(searchSurveyor.toLowerCase()))
 }, [data, searchSurveyor])

 // Ambil respondents sesuai pilihan
 const filteredRespondents = useMemo(() => {
  const keyword = searchKeyword.toLowerCase()
  return allRespondents.filter((r) => {
   const matchKeyword =
    !searchKeyword.trim() ||
    r.name?.toLowerCase().includes(keyword) ||
    r.gender?.toLowerCase().includes(keyword) ||
    r.status?.toLowerCase().includes(keyword) ||
    r.kecamatan?.toLowerCase().includes(keyword) ||
    r.kelurahan?.toLowerCase().includes(keyword) ||
    String(r.usia).includes(keyword) ||
    r.surveyor_name?.toLowerCase().includes(keyword) ||
    r.status_respondent?.toLowerCase().includes(keyword)

   const matchDropdown =
    (!filterStatus || r.status === filterStatus) &&
    (!filterGender || r.gender === filterGender) &&
    (!filterKecamatan || r.kecamatan === filterKecamatan) &&
    (!filterKelurahan || r.kelurahan === filterKelurahan) &&
    (!filterUsia || String(r.usia) === filterUsia) &&
    (!filterStatusRespondent || r.status_respondent === filterStatusRespondent) &&
    (selectedSurveyorId === "all" || String(r.surveyor_id) === selectedSurveyorId)

   return matchKeyword && matchDropdown
  })
 }, [
  allRespondents,
  searchKeyword,
  filterStatus,
  filterGender,
  filterKecamatan,
  filterKelurahan,
  filterUsia,
  filterStatusRespondent,
  selectedSurveyorId
 ])

 const uniqueValues = useMemo(() => {
  const sets = {
   statuses: new Set(),
   genders: new Set(),
   kecamatans: new Set(),
   kelurahans: new Set(),
   usias: new Set(),
   status_respondents: new Set()
  }
  allRespondents.forEach((r) => {
   if (r.status) sets.statuses.add(r.status)
   if (r.gender) sets.genders.add(r.gender)
   if (r.kecamatan) sets.kecamatans.add(r.kecamatan)
   if (r.kelurahan) sets.kelurahans.add(r.kelurahan)
   if (r.usia != null) sets.usias.add(r.usia)
   if (r.status_respondent) sets.status_respondents.add(r.status_respondent)
  })
  return {
   statuses: Array.from(sets.statuses).sort(),
   genders: Array.from(sets.genders).sort(),
   kecamatans: Array.from(sets.kecamatans).sort(),
   kelurahans: Array.from(sets.kelurahans).sort(),
   usias: Array.from(sets.usias).sort((a, b) => a - b),
   status_respondents: Array.from(sets.status_respondents).sort()
  }
 }, [allRespondents])

 const stats = useMemo(() => {
  const total = filteredRespondents.length
  const byStatus = filteredRespondents.reduce((acc, r) => {
   acc[r.status] = (acc[r.status] || 0) + 1
   return acc
  }, {})
  return {total, byStatus}
 }, [filteredRespondents])

 const respondentStatus = () => {
  const totalCount = allRespondents.length
  const totalPercentage = totalCount > 0 ? Math.round((totalCount / totalCount) * 100) : 0
  const completedCount = allRespondents.filter((r) => r.status === "completed").length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const maleCount = allRespondents.filter((r) => r.status === "completed" && r.gender === "Laki-laki").length
  const malePercentage = totalCount > 0 ? Math.round((maleCount / totalCount) * 100) : 0 // Calculate male percentage
  const femaleCount = allRespondents.filter((r) => r.status === "completed" && r.gender === "Perempuan").length
  const femalePercentage = totalCount > 0 ? Math.round((femaleCount / totalCount) * 100) : 0 // Calculate female percentage

  const RespondentAsli = allRespondents.filter((r) => r.status_respondent === "Asli").length
  const statusRespondentPercentageAsli = totalCount > 0 ? Math.round((RespondentAsli / totalCount) * 100) : 0
  const respondentPengganti = allRespondents.filter((r) => r.status_respondent === "Pengganti").length
  const statusRespondentPercentagePengganti = totalCount > 0 ? Math.round((respondentPengganti / totalCount) * 100) : 0

  return {
   completedCount,
   totalCount,
   totalPercentage,
   percentage,
   malePercentage,
   femalePercentage,
   statusRespondentPercentageAsli,
   statusRespondentPercentagePengganti
  }
 }

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

 if (isLoading) {
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
   <h1>Management Jawaban</h1>

   {/* Surveyor filter */}
   <div className="answer-actions">
    <div className="answer-search-wrapper">
     <input
      type="text"
      placeholder="Cari surveyor…"
      value={searchKeyword}
      onChange={(e) => setSearchKeyword(e.target.value)}
      className="search-input"
     />
    </div>
   </div>

   {/* Statistik */}
   <div className="respondent-status-wrapper">
    <Card className="respondent-status">
     <Card.Title>Respondent Selesai</Card.Title>
     <Card.Text>
      {respondentStatus().percentage}% / {respondentStatus().totalPercentage}%
     </Card.Text>
     <Card.Footer className="footer-card">Total Respondent: {respondentStatus().totalCount}</Card.Footer>
    </Card>

    <Card className="respondent-status">
     <Card.Title>Respondent Laki-laki</Card.Title>
     <Card.Text>
      {respondentStatus().malePercentage}% / {respondentStatus().totalCount}
     </Card.Text>
     <Card.Footer className="footer-card">Total Respondent: {respondentStatus().totalCount}</Card.Footer>
    </Card>

    <Card className="respondent-status">
     <Card.Title>Respondent Perempuan</Card.Title>
     <Card.Text>
      {respondentStatus().femalePercentage}% / {respondentStatus().totalCount}
     </Card.Text>
     <Card.Footer className="footer-card">Total Respondent: {respondentStatus().totalCount}</Card.Footer>
    </Card>

    <Card className="respondent-status">
     <Card.Title>Respondent Asli</Card.Title>
     <Card.Text>
      {respondentStatus().statusRespondentPercentageAsli}% / {respondentStatus().totalCount}
     </Card.Text>
     <Card.Footer className="footer-card">Total Respondent: {respondentStatus().totalCount}</Card.Footer>
    </Card>

    <Card className="respondent-status">
     <Card.Title>Respondent Pengganti</Card.Title>
     <Card.Text>
      {respondentStatus().statusRespondentPercentagePengganti}% / {respondentStatus().totalCount}
     </Card.Text>
     <Card.Footer className="footer-card">Total Respondent: {respondentStatus().totalCount}</Card.Footer>
    </Card>
   </div>

   {/* Tabel Respondent */}
   <div className="table-container">
    <table className="answer-table">
     <thead className="bg-gray-200">
      <tr>
       <th>Nama</th>
       <th>
        <select className="select" value={selectedSurveyorId} onChange={(e) => setSelectedSurveyorId(e.target.value)}>
         <option value="all">Surveyor</option>
         {data.map((surveyor) => (
          <option key={surveyor.surveyor_id} value={String(surveyor.surveyor_id)}>
           {surveyor.name || `ID ${surveyor.surveyor_id}`}
          </option>
         ))}
        </select>
       </th>
       <th>
        <select className="select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
         <option value="">Jenis Kelamin</option>
         {uniqueValues.genders.map((g) => (
          <option key={g} value={g}>
           {g}
          </option>
         ))}
        </select>
       </th>
       <th>
        <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
         <option value="">Status</option>
         {uniqueValues.statuses.map((s) => (
          <option key={s} value={s}>
           {s}
          </option>
         ))}
        </select>
       </th>
       <th>
        <select className="select" value={filterKecamatan} onChange={(e) => setFilterKecamatan(e.target.value)}>
         <option value="">Kecamatan</option>
         {uniqueValues.kecamatans.map((k) => (
          <option key={k} value={k}>
           {k}
          </option>
         ))}
        </select>
       </th>
       <th>
        <select className="select" value={filterKelurahan} onChange={(e) => setFilterKelurahan(e.target.value)}>
         <option value="">Kelurahan</option>
         {uniqueValues.kelurahans.map((k) => (
          <option key={k} value={k}>
           {k}
          </option>
         ))}
        </select>
       </th>
       <th>
        <select className="select" value={filterUsia} onChange={(e) => setFilterUsia(e.target.value)}>
         <option value="">Umur</option>
         {uniqueValues.usias.map((u) => (
          <option key={u} value={u}>
           {u}
          </option>
         ))}
        </select>
       </th>
       <th>
        <select
         className="select"
         value={filterStatusRespondent}
         onChange={(e) => setfilterStatusRespondent(e.target.value)}>
         <option value="">Jenis</option>
         {uniqueValues.status_respondents.map((u) => (
          <option key={u} value={u}>
           {u}
          </option>
         ))}
        </select>
       </th>
       <th>Jawaban</th>
      </tr>
     </thead>
     <tbody>
      {!isLoading &&
       filteredRespondents.map((r) => (
        <tr key={r.respondent_id} className="hover:bg-gray-50">
         <td className="border px-3 py-2">{r.name}</td>
         <td className="border px-3 py-2">{r.surveyor_name}</td>
         <td className="border px-3 py-2">{r.gender}</td>
         <td className="border px-3 py-2">{r.status}</td>
         <td className="border px-3 py-2">{r.kecamatan}</td>
         <td className="border px-3 py-2">{r.kelurahan}</td>
         <td className="border px-3 py-2">{r.usia}</td>
         <td className="border px-3 py-2">{r.status_respondent}</td>
         <td className="border px-3 py-2">
          <DetailsAnswer answers={r.answers} />
         </td>
        </tr>
       ))}
     </tbody>
     {!isLoading && filteredRespondents.length === 0 && (
      <tr>
       <td colSpan={9} className="p-4 text-center">
        Tidak ada data.
       </td>
      </tr>
     )}
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

const DetailsAnswer = ({answers}) => {
 const [open, setOpen] = useState(false)
 return (
  <div>
   <button onClick={() => setOpen(!open)} className="text-blue-600 underline text-sm">
    {open ? "Sembunyikan" : "Lihat Jawaban"}
   </button>
   {open && (
    <table className="mt-2 w-full text-sm border-collapse border">
     <thead className="bg-gray-100">
      <tr>
       <th className="border px-2 py-1">Pertanyaan</th>
       <th className="border px-2 py-1">Jawaban</th>
      </tr>
     </thead>
     <tbody>
      {answers.map((ans, i) => (
       <tr key={ans.question.question_id || `answer-${i}`} className="hover:bg-gray-50">
        <td className="border px-2 py-1">{ans.question.question}</td>
        <td className={`border px-2 py-1 ${ans.answer ? "" : "italic text-red-500"}`}>
         {Array.isArray(ans.answer) ? ans.answer.join(", ") : ans.answer ?? "–"}
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   )}
  </div>
 )
}

export default AnswerPage
