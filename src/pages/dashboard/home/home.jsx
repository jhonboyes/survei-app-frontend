import React, {useState, useEffect, useMemo} from "react"
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell} from "recharts"
import "./home.css"
import { GetAnswerWithQuestionByRespondentWithSurveyor } from "../../../api/answer.jsx"
import CrossTab from "../../../components/crosstab/crosstab.jsx"
import ExportToExcelButton from "../../../components/excelexport/export.jsx"
import Loader from "../../../components/loader/loader.jsx"

const Home = () => {
 const [rawData, setRawData] = useState([])
 const [loading, setLoading] = useState(false)

 // --- Surveyor filter/search ---
 const [searchTerm, setSearchTerm] = useState("")
 const [debouncedSearch, setDebouncedSearch] = useState("")
 const [selSurveyorIdx, setSelSurveyorIdx] = useState(-1) // -1 = Semua Surveyor

 // --- Respondent filters ---
 const [filterStatus, setFilterStatus] = useState("")
 const [filterGender, setFilterGender] = useState("")
 const [filterKec, setFilterKec] = useState("")
 const [filterKel, setFilterKel] = useState("")
 const [filterUsia, setFilterUsia] = useState("")
 const [filterStatusRespondent, setStatusRespondent] = useState("")

 // --- Dynamic respondent attribute filter key ---
 const [respFilterKey, setRespFilterKey] = useState("status")

 // --- Pertanyaan selection ---
 const [selQuestionId, setSelQuestionId] = useState("")

 // Fetch data once
 useEffect(() => {
  const fetchAll = async () => {
   setLoading(true)
   try {
    const res = await GetAnswerWithQuestionByRespondentWithSurveyor()
    const arr = Array.isArray(res.data) ? res.data : res.data && Array.isArray(res.data.data) ? res.data.data : []
    setRawData(arr)
   } catch {
    setRawData([])
   } finally {
    setLoading(false)
   }
  }
  fetchAll()
 }, [])

 // debounce search
 useEffect(() => {
  const t = setTimeout(() => setDebouncedSearch(searchTerm.toLowerCase()), 300)
  return () => clearTimeout(t)
 }, [searchTerm])

 // filter surveyors by name
 const surveyors = useMemo(
  () => (debouncedSearch === "" ? rawData : rawData.filter((s) => s.name?.toLowerCase().includes(debouncedSearch))),
  [rawData, debouncedSearch]
 )

 // build respondents array: either all or per surveyor
 const allRespondents = useMemo(() => {
  return surveyors.reduce((acc, s) => {
   if (Array.isArray(s.respondents)) {
    acc.push(...s.respondents)
   }
   return acc
  }, [])
 }, [surveyors])

 const respondentsBase = useMemo(() => {
  if (selSurveyorIdx >= 0 && selSurveyorIdx < surveyors.length) {
   return surveyors[selSurveyorIdx].respondents || []
  }
  return allRespondents
 }, [surveyors, selSurveyorIdx, allRespondents])

 // apply respondent-level filters
 const respondents = useMemo(() => {
  return respondentsBase.filter((r) => {
   if (filterStatus && r.status !== filterStatus) return false
   if (filterGender && r.gender !== filterGender) return false
   if (filterKec && r.kecamatan !== filterKec) return false
   if (filterKel && r.kelurahan !== filterKel) return false
   if (filterUsia && String(r.usia) !== filterUsia) return false
   if (filterStatusRespondent && r.statusRespondent !== filterStatusRespondent) return false
   return true
  })
 }, [respondentsBase, filterStatus, filterGender, filterKec, filterKel, filterUsia, filterStatusRespondent])

 // Helper: calculate distribution for any respondent field
 const calcDist = (data, key) => {
  const counter = {}
  data.forEach((item) => {
   const v = item[key] || "Unknown"
   counter[v] = (counter[v] || 0) + 1
  })
  const total = data.length
  return Object.entries(counter).map(([value, count]) => ({
   value,
   count,
   percentage: total ? Math.round((count / total) * 100) : 0
  }))
 }

 // distributions for dynamic respondent filter
 const respDist = useMemo(() => calcDist(respondents, respFilterKey), [respondents, respFilterKey])

 // questions list
 const questions = useMemo(() => {
  const map = new Map()
  respondentsBase.forEach((r) =>
   r.answers.forEach((ans) => {
    if (!map.has(ans.question_id)) {
     map.set(ans.question_id, {id: ans.question_id, text: ans.question.question})
    }
   })
  )
  return Array.from(map.values())
 }, [respondentsBase])

 // select default question
 useEffect(() => {
  if (questions.length && !selQuestionId) setSelQuestionId(questions[0]?.id || "")
 }, [questions, selQuestionId])

 // distribution for selected question
 const distData = useMemo(() => {
  const counter = {}
  let answered = 0
  respondents.forEach((r) => {
   const a = r.answers.find((x) => x.question_id === selQuestionId)
   if (a && a.answer != null) {
    answered++
    const vals = Array.isArray(a.answer) ? a.answer : [a.answer]
    vals.forEach((v) => (counter[v] = (counter[v] || 0) + 1))
   }
  })
  return Object.entries(counter).map(([answer, count]) => ({
   answer,
   count,
   percentage: answered ? Math.round((count / answered) * 100) : 0
  }))
 }, [selQuestionId, respondents])

 const exportRespDistData = useMemo(() => {
  return respDist.map(({value, count, percentage}) => ({
   [respFilterKey]: value,
   Jumlah: count,
   Persentase: percentage + "%"
  }))
 }, [respDist, respFilterKey])

 const exportDistData = useMemo(() => {
  return distData.map(({answer, count, percentage}) => ({
   Jawaban: answer,
   Jumlah: count,
   Persentase: percentage + "%"
  }))
 }, [distData])


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
  <div className="dashboard-container-fluid">
   <h1 className="judul">📈 Statistik Survei</h1>

   {/* Surveyor selector */}
   {/* <div className="mb-4 flex flex-col md:flex-row md:space-x-4 space-y-2">
    <input
     type="text"
     placeholder="🔍 Cari surveyor..."
     className="border rounded px-3 py-2 flex-1"
     value={searchTerm}
     onChange={(e) => {
      setSearchTerm(e.target.value)
      setSelSurveyorIdx(-1)
     }}
    />
    <select
     className="border rounded px-3 py-2"
     value={selSurveyorIdx}
     onChange={(e) => setSelSurveyorIdx(Number(e.target.value))}>
     <option value={-1}>📋 Semua Surveyor</option>
     {surveyors.map((s, i) => (
      <option key={i} value={i}>
       {s.name}
      </option>
     ))}
    </select>
   </div> */}

   {/* Respondent attribute filter dropdown */}
   <div className="respondent-wrapper">
    <div className="distribusi-respondent">
     <label className="respondent-label">Filter Responden Berdasarkan: </label>
     <div className="respondent-filter">
      <ExportToExcelButton data={exportRespDistData} fileName="respondent-presentase.xlsx" />
      <select value={respFilterKey} onChange={(e) => setRespFilterKey(e.target.value)} className="select-respondent">
       <option value="status">Status</option>
       <option value="gender">Gender</option>
       <option value="usia">Usia</option>
       <option value="kecamatan">Kecamatan</option>
       <option value="kelurahan">Kelurahan</option>
       <option value="status_respondent">Status Respondent</option>
      </select>
     </div>
     {/* Chart & table for respondent distribution */}
     <div className="respodent-data">
      <div className="mb-6">
       <h3 className="font-semibold mb-2">{respFilterKey}</h3>
       <div className="pie-chart">
        <ResponsiveContainer width="100%" height={500}>
         <PieChart>
          <Pie
           data={respDist}
           cx="50%"
           cy="50%"
           labelLine={true}
           label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
           outerRadius={150}
           fill="#8884d8"
           dataKey="percentage"
           nameKey="value">
           {respDist.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
           ))}
          </Pie>
          <Tooltip formatter={(v) => v + "%"} />
          <Legend />
         </PieChart>
        </ResponsiveContainer>
       </div>
       <div>
        <h3 className="table-title">{respFilterKey}</h3>
       </div>
       <table className="respondent-table-distribusi">
        <thead className="bg-gray-100">
         <tr>
          <th className="border px-4 py-2">{respFilterKey}</th>
          <th className="border px-4 py-2">Jumlah</th>
          <th className="border px-4 py-2">Persentase</th>
         </tr>
        </thead>
        <tbody>
         {respDist.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50">
           <td className="border px-4 py-2">{row.value}</td>
           <td className="border px-4 py-2">{row.count}</td>
           <td className="border px-4 py-2">{row.percentage}%</td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
     </div>
    </div>
    <div className="distribusi-answer">
     {/* Question selector & distribution chart/table */}
     {questions.length > 0 && (
      <>
       <label className="answer-label">Pilih Pertanyaan:</label>
       <div className="question-filter">
        <ExportToExcelButton data={exportDistData} fileName="respondent-answer.xlsx" />
        <select
         value={selQuestionId}
         onChange={(e) => setSelQuestionId(Number(e.target.value))}
         className="select-question">
         {questions.map((q) => (
          <option key={q.id} value={q.id}>
           {q.text}
          </option>
         ))}
        </select>
       </div>

       <div className="mb-6">
        <h3 className="font-semibold mb-2">
         {questions.find((q) => q.id === selQuestionId)?.text || "Pertanyaan tidak ditemukan"}
        </h3>
        <div className="bar-chart">
         <ResponsiveContainer width="100%" height={500}>
          <BarChart data={distData}>
           <XAxis dataKey="answer" />
           <YAxis />
           <Tooltip formatter={(v) => v + "%"} />
           <Bar dataKey="percentage">
            {distData.map((entry, index) => (
             <Cell
              key={`cell-${index}`}
              fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // random color
             />
            ))}
           </Bar>
          </BarChart>
         </ResponsiveContainer>
        </div>
        <div>
         <h3 className="font-semibold mb-2">
          {questions.find((q) => q.id === selQuestionId)?.text || "Pertanyaan tidak ditemukan"}
         </h3>
        </div>
        <table className="respondent-table-answer">
         <thead className="bg-gray-100">
          <tr>
           <th className="border px-4 py-2">Jawaban</th>
           <th className="border px-4 py-2">Jumlah</th>
           <th className="border px-4 py-2">Persentase</th>
          </tr>
         </thead>
         <tbody>
          {distData.map((row, i) => (
           <tr key={i} className="hover:bg-gray-50">
            <td className="border px-4 py-2">{row.answer}</td>
            <td className="border px-4 py-2">{row.count}</td>
            <td className="border px-4 py-2">{row.percentage}%</td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      </>
     )}
    </div>
   </div>
   <CrossTab respondents={respondents} questions={questions} />

   {!surveyors.length && <p className="text-gray-600">Tidak ada data survei.</p>}
  </div>
 )
}

export default Home
