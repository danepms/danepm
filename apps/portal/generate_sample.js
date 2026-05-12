const XLSX = require('xlsx');
const path = require('path');
const os = require('os');

const rows = [
  {
    "Floor": 1,
    "Unit Name": "A1",
    "Unit Type": "1 Bedroom",
    "Rent (KES)": "15000",
    "Tenant Name": "Alice Wambui",
    "Tenant Phone": "0711223344",
    "Tenant Email": "alice@example.com",
    "Tenant ID Number": "11223344",
    "Kin 1 Name": "John Doe",
    "Kin 1 Phone": "0722112233",
    "Kin 1 Relation": "Spouse",
    "Kin 2 Name": "",
    "Kin 2 Phone": "",
    "Kin 2 Relation": "",
    "Kin 3 Name": "",
    "Kin 3 Phone": "",
    "Kin 3 Relation": "",
    "Move-in Date": "2026-01-01",
    "Arrears (KES)": "0"
  },
  {
    "Floor": 1,
    "Unit Name": "A2",
    "Unit Type": "1 Bedroom",
    "Rent (KES)": "15000",
    "Tenant Name": "Brian Ochieng",
    "Tenant Phone": "0722334455",
    "Tenant Email": "",
    "Tenant ID Number": "22334455",
    "Kin 1 Name": "Mary Ochieng",
    "Kin 1 Phone": "0733221100",
    "Kin 1 Relation": "Mother",
    "Kin 2 Name": "Peter Ochieng",
    "Kin 2 Phone": "0744332211",
    "Kin 2 Relation": "Brother",
    "Kin 3 Name": "",
    "Kin 3 Phone": "",
    "Kin 3 Relation": "",
    "Move-in Date": "2026-02-15",
    "Arrears (KES)": "5000"
  },
  {
    "Floor": 1,
    "Unit Name": "A3",
    "Unit Type": "Bedsitter",
    "Rent (KES)": "8000",
    "Tenant Name": "",
    "Tenant Phone": "",
    "Tenant Email": "",
    "Tenant ID Number": "",
    "Kin 1 Name": "",
    "Kin 1 Phone": "",
    "Kin 1 Relation": "",
    "Kin 2 Name": "",
    "Kin 2 Phone": "",
    "Kin 2 Relation": "",
    "Kin 3 Name": "",
    "Kin 3 Phone": "",
    "Kin 3 Relation": "",
    "Move-in Date": "",
    "Arrears (KES)": ""
  },
  {
    "Floor": 1,
    "Unit Name": "A4",
    "Unit Type": "Bedsitter",
    "Rent (KES)": "8000",
    "Tenant Name": "David Kimani",
    "Tenant Phone": "0744556677",
    "Tenant Email": "davidk@example.com",
    "Tenant ID Number": "",
    "Kin 1 Name": "Sarah Kimani",
    "Kin 1 Phone": "0755443322",
    "Kin 1 Relation": "Wife",
    "Kin 2 Name": "",
    "Kin 2 Phone": "",
    "Kin 2 Relation": "",
    "Kin 3 Name": "",
    "Kin 3 Phone": "",
    "Kin 3 Relation": "",
    "Move-in Date": "2025-10-01",
    "Arrears (KES)": "1500"
  },
  {
    "Floor": 1,
    "Unit Name": "A5",
    "Unit Type": "2 Bedroom",
    "Rent (KES)": "25000",
    "Tenant Name": "",
    "Tenant Phone": "",
    "Tenant Email": "",
    "Tenant ID Number": "",
    "Kin 1 Name": "",
    "Kin 1 Phone": "",
    "Kin 1 Relation": "",
    "Kin 2 Name": "",
    "Kin 2 Phone": "",
    "Kin 2 Relation": "",
    "Kin 3 Name": "",
    "Kin 3 Phone": "",
    "Kin 3 Relation": "",
    "Move-in Date": "",
    "Arrears (KES)": ""
  },
  {
    "Floor": 2,
    "Unit Name": "B1",
    "Unit Type": "1 Bedroom",
    "Rent (KES)": "15000",
    "Tenant Name": "Faith Njeri",
    "Tenant Phone": "0766778899",
    "Tenant Email": "",
    "Tenant ID Number": "66778899",
    "Kin 1 Name": "Paul Njeri",
    "Kin 1 Phone": "0777665544",
    "Kin 1 Relation": "Father",
    "Kin 2 Name": "",
    "Kin 2 Phone": "",
    "Kin 2 Relation": "",
    "Kin 3 Name": "",
    "Kin 3 Phone": "",
    "Kin 3 Relation": "",
    "Move-in Date": "2026-03-01",
    "Arrears (KES)": "0"
  },
  {
    "Floor": 2,
    "Unit Name": "B2",
    "Unit Type": "1 Bedroom",
    "Rent (KES)": "15000",
    "Tenant Name": "George Odhiambo",
    "Tenant Phone": "0777889900",
    "Tenant Email": "george.o@example.com",
    "Tenant ID Number": "77889900",
    "Kin 1 Name": "Lucy Odhiambo",
    "Kin 1 Phone": "0788776655",
    "Kin 1 Relation": "Sister",
    "Kin 2 Name": "",
    "Kin 2 Phone": "",
    "Kin 2 Relation": "",
    "Kin 3 Name": "",
    "Kin 3 Phone": "",
    "Kin 3 Relation": "",
    "Move-in Date": "2026-04-10",
    "Arrears (KES)": "10000"
  },
  {
    "Floor": 2,
    "Unit Name": "B3",
    "Unit Type": "Bedsitter",
    "Rent (KES)": "8000",
    "Tenant Name": "Hannah Wanjiku",
    "Tenant Phone": "0788990011",
    "Tenant Email": "",
    "Tenant ID Number": "",
    "Kin 1 Name": "Mark Wanjiku",
    "Kin 1 Phone": "0799887766",
    "Kin 1 Relation": "Brother",
    "Kin 2 Name": "",
    "Kin 2 Phone": "",
    "Kin 2 Relation": "",
    "Kin 3 Name": "",
    "Kin 3 Phone": "",
    "Kin 3 Relation": "",
    "Move-in Date": "2025-11-20",
    "Arrears (KES)": "0"
  },
  {
    "Floor": 2,
    "Unit Name": "B4",
    "Unit Type": "Bedsitter",
    "Rent (KES)": "8000",
    "Tenant Name": "",
    "Tenant Phone": "",
    "Tenant Email": "",
    "Tenant ID Number": "",
    "Kin 1 Name": "",
    "Kin 1 Phone": "",
    "Kin 1 Relation": "",
    "Kin 2 Name": "",
    "Kin 2 Phone": "",
    "Kin 2 Relation": "",
    "Kin 3 Name": "",
    "Kin 3 Phone": "",
    "Kin 3 Relation": "",
    "Move-in Date": "",
    "Arrears (KES)": ""
  },
  {
    "Floor": 2,
    "Unit Name": "B5",
    "Unit Type": "2 Bedroom",
    "Rent (KES)": "25000",
    "Tenant Name": "Joy Akinyi",
    "Tenant Phone": "0700112233",
    "Tenant Email": "joy.akinyi@example.com",
    "Tenant ID Number": "00112233",
    "Kin 1 Name": "Tom Akinyi",
    "Kin 1 Phone": "0711009988",
    "Kin 1 Relation": "Husband",
    "Kin 2 Name": "",
    "Kin 2 Phone": "",
    "Kin 2 Relation": "",
    "Kin 3 Name": "",
    "Kin 3 Phone": "",
    "Kin 3 Relation": "",
    "Move-in Date": "2026-05-01",
    "Arrears (KES)": "0"
  }
];

const ws = XLSX.utils.json_to_sheet(rows);

// Set column widths
const colWidths = [
  { wch: 8 },  // Floor
  { wch: 12 }, // Unit Name
  { wch: 15 }, // Unit Type
  { wch: 12 }, // Rent
  { wch: 25 }, // Tenant Name
  { wch: 15 }, // Tenant Phone
  { wch: 25 }, // Tenant Email
  { wch: 18 }, // Tenant ID
  { wch: 20 }, // Kin 1 Name
  { wch: 15 }, // Kin 1 Phone
  { wch: 15 }, // Kin 1 Relation
  { wch: 20 }, // Kin 2 Name
  { wch: 15 }, // Kin 2 Phone
  { wch: 15 }, // Kin 2 Relation
  { wch: 20 }, // Kin 3 Name
  { wch: 15 }, // Kin 3 Phone
  { wch: 15 }, // Kin 3 Relation
  { wch: 15 }, // Move-in Date
  { wch: 15 }  // Arrears
];
ws['!cols'] = colWidths;

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Property Setup");

// Write to Desktop
const desktopPath = path.join(os.homedir(), 'Desktop', 'Sample_Tenants.xlsx');
XLSX.writeFile(wb, desktopPath);

console.log(`Successfully created sample file at: ${desktopPath}`);
