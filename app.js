const holidaysPL = [
    "01-01","06-01","01-05","03-05","15-08","01-11","11-11","25-12","26-12"
];

function isHoliday(date) {
    const d = date.toISOString().slice(5,10);
    return holidaysPL.includes(d);
}

function generate() {
    const month = document.getElementById("month").value;
    const startKm = parseFloat(document.getElementById("startKm").value) || 0;
    const skipW = document.getElementById("skipWeekends").checked;
    const skipH = document.getElementById("skipHolidays").checked;

    const [year, m] = month.split("-");
    const days = new Date(year, m, 0).getDate();

    let entries = [];

    for (let d = 1; d <= days; d++) {
        const date = new Date(year, m - 1, d);

        if (skipW && (date.getDay() === 0 || date.getDay() === 6)) continue;
        if (skipH && isHoliday(date)) continue;

        entries.push({
            date: `${String(d).padStart(2,"0")}-${m}-${year}`,
            km: 54
        });
    }

    render(entries, startKm);
}

function render(entries, startKm) {
    let rows = "";

    entries.slice(0,22).forEach((e, i) => {
        rows += `
    <tr ondblclick="addRow(this)" oncontextmenu="removeRow(this);return false;">
      <td></td>
      <td contenteditable>${e.date}</td>
      <td contenteditable>przejazd</td>
      <td contenteditable>biuro - klient - biuro</td>
      <td contenteditable oninput="recalc()">${e.km}</td>
    </tr>`;
    });

    document.getElementById("page").innerHTML = `
  <div class="a4">

    <h2>Ewidencja przebiegu pojazdu VAT</h2>

    <div id="summary"></div>

    <table>
      <thead>
        <tr>
          <th>Lp</th>
          <th>Data</th>
          <th>Cel</th>
          <th>Trasa</th>
          <th>Km</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

  </div>`;

    renumber();
    recalc(startKm);
}

function renumber() {
    document.querySelectorAll("tbody tr").forEach((r,i)=>{
        r.children[0].innerText = i+1;
    });
}

function addRow(row) {
    const newRow = row.cloneNode(true);
    row.after(newRow);
    renumber();
    recalc();
}

function removeRow(row) {
    row.remove();
    renumber();
    recalc();
}

function recalc(startOverride) {
    let total = 0;

    document.querySelectorAll("td:nth-child(5)").forEach(c=>{
        total += parseFloat(c.innerText)||0;
    });

    const start = startOverride ?? parseFloat(document.getElementById("startKm").value)||0;
    const end = start + total;

    document.getElementById("summary").innerHTML =
        `Start: ${start} km | Koniec: ${end} km | Suma: ${total} km`;
}

function downloadPDF() {
    html2pdf().set({
        margin:5,
        filename:"ewidencja.pdf",
        html2canvas:{scale:2},
        jsPDF:{unit:"mm",format:"a4"}
    }).from(document.querySelector(".a4")).save();
}