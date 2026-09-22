/**
 * Export and Print Utilities — EEC EAMS
 * Generates CSV and Excel spreadsheet files and provides print functionality.
 */

/**
 * Cleanly format and escape cell value for CSV
 */
function escapeCSV(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export table data to CSV file with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const headerLine = headers.map(escapeCSV).join(',');
  const rowLines = rows.map((r) => r.map(escapeCSV).join(',')).join('\r\n');
  const csvContent = '\uFEFF' + headerLine + '\r\n' + rowLines;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.endsWith('.csv') ? filename : `${filename}.csv`}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export table data to Excel spreadsheet (XML Spreadsheet 2003 format)
 */
export function exportToExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const escapeXML = (val: any) => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const headerCells = headers
    .map(
      (h) =>
        `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`
    )
    .join('');

  const rowLines = rows
    .map((row) => {
      const cells = row
        .map((val) => {
          const isNum = typeof val === 'number';
          const type = isNum ? 'Number' : 'String';
          return `<Cell><Data ss:Type="${type}">${escapeXML(val)}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('\n');

  const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0B2F5C" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXML(sheetName)}">
  <Table>
   <Row ss:Height="22">${headerCells}</Row>
   ${rowLines}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.endsWith('.xls') ? filename : `${filename}.xls`}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open browser print dialog with print-friendly layout
 */
export function printReport() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
