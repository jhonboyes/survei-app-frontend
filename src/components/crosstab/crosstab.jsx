import React, {useState, useMemo} from "react"
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from "recharts"
import ExportToExcelButton from "../excelexport/export"
import "./crosstab.css"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#3366AA", "#66AA33", "#AA6633"]

function CrossTab({respondents, questions}) {
 const [dim1, setDim1] = useState("question")
 const [dim2, setDim2] = useState("respondent")

 const [selectedQuestionId1, setSelectedQuestionId1] = useState(questions.length > 0 ? questions[0].id : "")
 const [selectedQuestionId2, setSelectedQuestionId2] = useState(questions.length > 1 ? questions[1].id : "")
 const [selectedRespondentField1, setSelectedRespondentField1] = useState("gender")
 const [selectedRespondentField2, setSelectedRespondentField2] = useState("status")

 const [filterAnswer1, setFilterAnswer1] = useState("")
 const [filterAnswer2, setFilterAnswer2] = useState("")

 const respondentAttributes = ["status", "gender", "usia", "kecamatan", "kelurahan", "statusRespondent"]

 function getDimValue(respondent, dimType, attrOrQuestionId) {
  if (dimType === "respondent") {
   return respondent[attrOrQuestionId] ?? "Unknown"
  }
  if (dimType === "question") {
   const ans = respondent.answers.find((a) => a.question_id === attrOrQuestionId)
   if (!ans || ans.answer == null) return "Tidak dijawab"
   if (Array.isArray(ans.answer)) return ans.answer.join(", ")
   return ans.answer
  }
  return "Unknown"
 }

 const getUniqueAnswers = (questionId) => {
  const answerSet = new Set()
  respondents.forEach((resp) => {
   const ans = resp.answers.find((a) => a.question_id === questionId)
   if (ans && ans.answer != null) {
    if (Array.isArray(ans.answer)) {
     ans.answer.forEach((v) => answerSet.add(v))
    } else {
     answerSet.add(ans.answer)
    }
   }
  })
  return Array.from(answerSet)
 }

 const crosstabData = useMemo(() => {
  if (!respondents.length) return []

  const counter = {}

  respondents.forEach((resp) => {
   const val1 =
    dim1 === "respondent"
     ? getDimValue(resp, "respondent", selectedRespondentField1)
     : getDimValue(resp, "question", selectedQuestionId1)

   const val2 =
    dim2 === "respondent"
     ? getDimValue(resp, "respondent", selectedRespondentField2)
     : getDimValue(resp, "question", selectedQuestionId2)

   if (filterAnswer1 && val1 !== filterAnswer1) return
   if (filterAnswer2 && val2 !== filterAnswer2) return

   if (!counter[val1]) counter[val1] = {}
   counter[val1][val2] = (counter[val1][val2] || 0) + 1
  })

  const result = []
  Object.entries(counter).forEach(([val1, innerObj]) => {
   Object.entries(innerObj).forEach(([val2, count]) => {
    result.push({dim1Value: val1, dim2Value: val2, count})
   })
  })
  return result
 }, [
  respondents,
  dim1,
  dim2,
  selectedQuestionId1,
  selectedQuestionId2,
  selectedRespondentField1,
  selectedRespondentField2,
  filterAnswer1,
  filterAnswer2
 ])

 const dim2Values = useMemo(() => {
  const set = new Set()
  crosstabData.forEach((item) => set.add(item.dim2Value))
  return Array.from(set)
 }, [crosstabData])

 const groupedData = useMemo(() => {
  const map = {}
  crosstabData.forEach(({dim1Value, dim2Value, count}) => {
   if (!map[dim1Value]) map[dim1Value] = {dim1Value}
   map[dim1Value][dim2Value] = count
  })
  return Object.values(map)
 }, [crosstabData])

 const totalCount = crosstabData.reduce((sum, item) => sum + item.count, 0)
 const totalPerDim2 = {}
 dim2Values.forEach((val) => {
  totalPerDim2[val] = groupedData.reduce((sum, row) => sum + (row[val] || 0), 0)
 })

 const colorMap = {}
 dim2Values.forEach((val, i) => {
  colorMap[val] = COLORS[i % COLORS.length]
 })

 const dim1Label =
  dim1 === "respondent"
   ? selectedRespondentField1
   : questions.find((q) => q.id === selectedQuestionId1)?.text || "Dimensi 1"

 const exportCrossTabData = groupedData.map((row) => {
  const result = {[dim1Label]: row.dim1Value}
  dim2Values.forEach((val) => {
   result[`${val} (Jumlah)`] = row[val] || 0
   result[`${val} (%)`] = totalCount ? (((row[val] || 0) / totalCount) * 100).toFixed(1) + "%" : "0.0%"
  })
  return result
 })

 return (
  <div className="crosstab-wrapper">
   <div className="crosstab-header">
    <h2>Crosstab Statistik</h2>
    <ExportToExcelButton data={exportCrossTabData} fileName="crosstab-statistik" />
   </div>
   <div className="crosstab-controls">
    <div className="crosstab-dim">
     <label>Dimensi 1:</label>
     <br />
     <select value={dim1} onChange={(e) => setDim1(e.target.value)}>
      <option value="respondent">Responden (atribut)</option>
      <option value="question">Pertanyaan</option>
     </select>
     {dim1 === "respondent" && (
      <select value={selectedRespondentField1} onChange={(e) => setSelectedRespondentField1(e.target.value)}>
       {respondentAttributes.map((attr) => (
        <option key={attr} value={attr}>
         {attr}
        </option>
       ))}
      </select>
     )}
     {dim1 === "question" && (
      <>
       <select value={selectedQuestionId1 ?? ""} onChange={(e) => setSelectedQuestionId1(Number(e.target.value))}>
        {questions.map((q) => (
         <option key={q.id} value={q.id}>
          {q.text}
         </option>
        ))}
       </select>
       <select value={filterAnswer1} onChange={(e) => setFilterAnswer1(e.target.value)}>
        <option value="">Semua jawaban</option>
        {getUniqueAnswers(selectedQuestionId1).map((ans) => (
         <option key={ans} value={ans}>
          {ans}
         </option>
        ))}
       </select>
      </>
     )}
    </div>

    <div className="crosstab-dim">
     <label>Dimensi 2:</label>
     <br />
     <select value={dim2} onChange={(e) => setDim2(e.target.value)}>
      <option value="respondent">Responden (atribut)</option>
      <option value="question">Pertanyaan</option>
     </select>
     {dim2 === "respondent" && (
      <select value={selectedRespondentField2} onChange={(e) => setSelectedRespondentField2(e.target.value)}>
       {respondentAttributes.map((attr) => (
        <option key={attr} value={attr}>
         {attr}
        </option>
       ))}
      </select>
     )}
     {dim2 === "question" && (
      <>
       <select value={selectedQuestionId2 ?? ""} onChange={(e) => setSelectedQuestionId2(Number(e.target.value))}>
        {questions.map((q) => (
         <option key={q.id} value={q.id}>
          {q.text}
         </option>
        ))}
       </select>
       <select value={filterAnswer2} onChange={(e) => setFilterAnswer2(e.target.value)}>
        <option value="">Semua jawaban</option>
        {getUniqueAnswers(selectedQuestionId2).map((ans) => (
         <option key={ans} value={ans}>
          {ans}
         </option>
        ))}
       </select>
      </>
     )}
    </div>
   </div>

   <div className="crosstab-title">
    <div className="dim-label">
     {dim1 === "respondent"
      ? selectedRespondentField1
      : questions.find((q) => q.id === selectedQuestionId1)?.text || "Dimensi 1"}
    </div>
    <div className="dan-label">dan</div>
    <div className="dim-label">
     {dim2 === "respondent"
      ? selectedRespondentField2
      : questions.find((q) => q.id === selectedQuestionId2)?.text || "Dimensi 2"}
    </div>
   </div>

   <table className="crosstab-table">
    <thead>
     {/* Baris pertama: judul masing-masing dim2 dengan colspan=2 */}
     <tr>
      <th rowSpan={2}>
       {dim1 === "respondent"
        ? selectedRespondentField1
        : questions.find((q) => q.id === selectedQuestionId1)?.text || "Dimensi 1"}
      </th>
      {dim2Values.map((val) => (
       <th key={val} colSpan={2}>
        {val}
       </th>
      ))}
     </tr>

     {/* Baris kedua: sub-header “Count” dan “%” */}
     <tr>
      {dim2Values.map((val) => (
       <React.Fragment key={val}>
        <th>Jumlah</th>
        <th>persentase</th>
       </React.Fragment>
      ))}
     </tr>
    </thead>

    <tbody>
     {groupedData.map(({dim1Value, ...counts}) => (
      <tr key={dim1Value}>
       <td>{dim1Value}</td>
       {dim2Values.map((val) => {
        const count = counts[val] || 0
        const percent = totalCount ? (((counts[val] || 0) / totalCount) * 100).toFixed(1) : "0.0"
        return (
         <React.Fragment key={val}>
          <td>{count}</td>
          <td>{percent}%</td>
         </React.Fragment>
        )
       })}
      </tr>
     ))}
    </tbody>

    <tfoot>
     <tr>
      <td>Jumlah</td>
      {dim2Values.map((val) => (
       <React.Fragment key={val}>
        <td colSpan={2}>{totalPerDim2[val]}</td>
       </React.Fragment>
      ))}
     </tr>
     <tr>
      <td>Persentase</td>
      {dim2Values.map((val) => {
       const pct = totalCount ? ((totalPerDim2[val] / totalCount) * 100).toFixed(1) : "0.0"
       return (
        <React.Fragment key={val}>
         {/* <td></td> */}
         <td colSpan={2}>{pct}%</td>
        </React.Fragment>
       )
      })}
     </tr>
    </tfoot>
   </table>

   <ResponsiveContainer width="100%" height={500}>
    <BarChart data={groupedData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
     <XAxis dataKey="dim1Value" />
     <YAxis />
     <Tooltip />
     {dim2Values.map((val) => (
      <Bar key={val} dataKey={val} stackId="a" fill={colorMap[val]} />
     ))}
    </BarChart>
   </ResponsiveContainer>
  </div>
 )
}

export default CrossTab
