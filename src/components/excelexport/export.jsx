import React from "react"
import * as XLSX from "xlsx"
import {saveAs} from "file-saver"
import {faFileExcel} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"

const ExportToExcelButton = ({data, fileName = "data-export"}) => {
 const handleExport = () => {
  if (!data || data.length === 0) {
   alert("Tidak ada data untuk diekspor.")
   return
  }

  // Buat worksheet dan workbook
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

  // Konversi ke Blob dan simpan
  const excelBuffer = XLSX.write(workbook, {
   bookType: "xlsx",
   type: "array"
  })
  const dataBlob = new Blob([excelBuffer], {
   type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  })
  saveAs(dataBlob, `${fileName}.xlsx`)
 }

 return (
  <button onClick={handleExport} className="export-button">
   <FontAwesomeIcon icon={faFileExcel} className="export" />
  </button>
 )
}

export default ExportToExcelButton
