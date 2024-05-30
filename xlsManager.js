const { google } = require("googleapis");
const fs = require("fs");
const credentials = JSON.parse(fs.readFileSync("./circleapp-agent.json"));
// Create a GoogleAuth instance
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function accessGs(columnIndex, link) {
  const googleclient = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: googleclient });
  // The ID of the spreadsheet to access
  const spreadsheetId = "1VNO249pg8WY4wFBn4XIkQ6YyV67hBdiFg_oMmZ4icu8";
  // Read data from the spreadsheet
  const readRes = await googleSheets.spreadsheets.get({
    spreadsheetId: spreadsheetId,
    fields:
      "sheets(data(rowData(values(hyperlink,userEnteredValue,effectiveValue))))",
  });
  // var url = sheet.getRange("A2").getRichTextValue().getLinkUrl();
  // JSON.stringify(readRes.data.sheets[2].data[0].rowData[65])
  console.log(JSON.stringify(readRes.data.sheets[1].data[0].rowData[1]));
  const data = readRes.data.sheets[1].data[0].rowData;
  console.log(data.length);

  console.log(data[4].values[10]);
  // console.log(data[3].values[3]);
  // console.log(data[3].values[4]);
  // console.log(data[3].values[5]);
  // console.log(data[3].values[6]);
  // console.log(data[3].values[7]);
  // console.log(data[1].values);
  // console.log(data[3].values[9]);

  for (let i = 2; i < data.length; i++) {
    const row = data[i];

    if (row?.values && row.values[10]?.hyperlink) {
      if (row.values[10]?.hyperlink?.split("://")[1] === link.split("://")[1]) {
        const dataConstruct = {
          id: row.values[1].userEnteredValue.stringValue,
          location: row.values[2].userEnteredValue.stringValue,
          bhk: row.values[3]?.userEnteredValue.stringValue,
          type: !row.values[5].userEnteredValue
            ? ""
            : row.values[5].userEnteredValue.stringValue,
          furnishing: row.values[6]?.userEnteredValue.stringValue,
          rent: row.values[8].effectiveValue.numberValue,
          availability: !row.values[9].userEnteredValue
            ? ""
            : row.values[9].userEnteredValue.stringValue,
          address: !row.values[11].userEnteredValue
            ? ""
            : row.values[11].userEnteredValue.stringValue,
          location_link: row.values[12]?.hyperlink ?? "",
          photo_link: row.values[10]?.hyperlink,
        };
        console.log(dataConstruct);
        return dataConstruct;
      } else {
      }
    }
  }

  //   const findLinkInCell = (cell) => {
  //     if (cell && cell.textFormatRuns) {
  //       for (const run of cell.textFormatRuns) {
  //         if (run.format && run.format.link) {
  //           return run.format.link.uri;
  //         }
  //       }
  //     }
  //     return null;
  //   };

  // const data = readRes.data.values;
  //   for (let i = 1; i < data.length; i++) {
  //     const cell = data[i].values[columnIndex];
  //     const cellLink = findLinkInCell(cell);
  //     if (cellLink === link) {
  //       const rowData = headers.reduce((acc, header, index) => {
  //         acc[header] = data[i].values[index].userEnteredValue.stringValue || "";
  //         console.log(acc, "acc");
  //         return acc;
  //       }, {});
  //       console.log(rowData, "row");
  //       return JSON.stringify(rowData);
  //     }
  //   }
  // const row = data.find(row => row[columnIndex] === link);
  // console.log(row)
  // console.log(readRes.data.values[0]);
}

//accessGs(0,"https://drive.google.com/drive/folders/129NKJUhNyz2NxqiE_VpSHtUMSl84mvek?usp=drive_link")

module.exports = accessGs;
