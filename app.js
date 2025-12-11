const express = require("express");
const app = express();

const PORT = 3000;
const YEAR = 2026;

function generateMonthHTML(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = `
    <div class="month">
      <h2>${new Date(year, month).toLocaleString("default",{month:"long"})}</h2>
      <table>
        <tr>
          <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th>
          <th>Thu</th><th>Fri</th><th>Sat</th>
        </tr>
        <tr>
  `;

  for (let i = 0; i < firstDay; i++) {
    html += `<td></td>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const weekDay = (firstDay + day - 1) % 7;

    html += `<td>${day}</td>`;

    if (weekDay === 6 && day !== daysInMonth) {
      html += "</tr><tr>";
    }
  }

  html += "</tr></table></div>";
  return html;
}

app.get("/", (req, res) => {
  let html = `
  <html>
    <head>
      <title>Calendar 2026</title>
      <style>
        body{
          font-family: Arial;
          background:#f5f5f5;
          text-align:center;
        }
        h1{
          margin: 10px;
        }
        .year {
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(250px,1fr));
          gap:15px;
          padding:20px;
        }
        .month{
          background:white;
          padding:10px;
          border-radius:8px;
          box-shadow:0 0 5px rgba(0,0,0,0.15);
        }
        table{
          width:100%;
          border-collapse: collapse;
        }
        td,th{
          border:1px solid #ccc;
          padding:5px;
        }
        th{
          background:#333;
          color:white;
        }
      </style>
    </head>
    <body>
      <h1>📅 Calendar - 2026</h1>
      <div class="year">
  `;

  for(let m=0;m<12;m++){
    html += generateMonthHTML(YEAR,m);
  }

  html += `
      </div>
    </body>
  </html>
  `;

  res.send(html);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Calendar running on http://0.0.0.0:${PORT}`);
});

