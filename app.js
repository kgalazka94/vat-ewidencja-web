const ROWS_PER_PAGE = 22;

const monthEl = document.getElementById("month");
const startKmEl = document.getElementById("startKm");
const nameEl = document.getElementById("name");
const plateEl = document.getElementById("plate");

function easter(year) {
    const f = Math.floor;
    const a = year % 19;
    const b = f(year / 100);
    const c = year % 100;
    const d = f(b / 4);
    const e = b % 4;
    const g = f((8 * b + 13) / 25);
    const h = (19 * a + b - d - g + 15) % 30;
    const j = f(c / 4);
    const k = c % 4;
    const m = (a + 11 * h) / 319;
    const r = (2 * e + 2 * j - k - h + m + 32) % 7;
    const n = f((h - m + r + 90) / 25);
    const p = (h - m + r + n + 19) % 32;
    return new Date(year, n - 1, p);
}

function getHolidays(year) {
    const e = easter(year);

    return [
        "01-01","06-01","01-05","03-05","15-08","01-11","11-11","25-12","26-12",
        formatDate(e),
        formatDate(addDays(e, 1)), // poniedziałek wielkanocny
        formatDate(addDays(e, 60)) // boże ciało
    ];
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function formatDate(d) {
    return d.toISOString().slice(5,10);
}

function generate() {
    const month = monthEl.value;
    if (!month) return;

    const [year, m] = month.split("-");
    const days = new Date(year, m, 0).getDate();

    const holidays = getHolidays(parseInt(year));
    const skipW = document.getElementById("skipWeekends").checked;
    const skipH = document.getElementById("skipHolidays").checked;

    let entries = [];

    for (let d = 1; d <= days; d++) {
        const date = new Date(year, m - 1, d);
        const key = formatDate(date);

        if (skipW && (date.getDay() === 0 || date.getDay() === 6)) continue;
        if (skipH && holidays.includes(key)) continue;

        entries.push({
            date: `${String(d).padStart(2,"0")}-${m}-${year}`,
            km: 54
        });
    }

    render(entries);
}

function render(entries) {
    const pagesDiv = document.getElementById("pages");
    pagesDiv.innerHTML = "";

    let carry = 0;
    let totalPages = Math.ceil(entries.length / ROWS_PER_PAGE);

    const monthLabel = new Date(monthEl.value).toLocaleString("pl-PL", {
        month: "long",
        year: "numeric"
    });

    entries.forEach((_, index) => {
        if (index % ROWS_PER_PAGE !== 0) return;

        const chunk = entries.slice(index, index + ROWS_PER_PAGE);

        let pageKm = 0;

        const rows = chunk.map((e, i) => {
            pageKm += e.km;

            return `
      <tr ondblclick="addRow(this)" oncontextmenu="removeRow(this);return false;">
        <td></td>
        <td contenteditable>${e.date}</td>
        <td contenteditable>przejazd</td>
        <td contenteditable>biuro - klient - biuro</td>
        <td contenteditable oninput="recalc()">${e.km}</td>
      </tr>`;
        }).join("");

        const pageNum = Math.floor(index / ROWS_PER_PAGE) + 1;

        const page = document.createElement("div");
        page.className = "page";

        page.innerHTML = `
    <div class="header">
      <b>Ewidencja przebiegu pojazdu VAT</b><br>
      ${monthLabel}<br>
      ${nameEl.value} | ${plateEl.value}<br>
      Strona ${pageNum} z ${totalPages}
    </div>

    <table>
      <thead>
        <tr>
          <th>Lp</th><th>Data</th><th>Cel</th><th>Trasa</th><th>Km</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="footer">
      Z przeniesienia: ${carry.toFixed(2)} km<br>
      Podsumowanie strony: ${(carry + pageKm).toFixed(2)} km
    </div>
    `;

        carry += pageKm;
        pagesDiv.appendChild(page);
    });

    renumber();
    recalc();
}

function renumber() {
    document.querySelectorAll("tbody").forEach(t => {
        t.querySelectorAll("tr").forEach((r,i)=>{
            r.children[0].innerText = i+1;
        });
    });
}

function addRow(row) {
    row.after(row.cloneNode(true));
    renumber();
    recalc();
}

function removeRow(row) {
    row.remove();
    renumber();
    recalc();
}

function recalc() {
    let total = 0;

    document.querySelectorAll("td:nth-child(5)").forEach(c => {
        const val = parseFloat(c.innerText);
        total += isNaN(val) ? 0 : val;
    });

    const start = parseFloat(startKmEl.value) || 0;
    const end = start + total;

    // usuń stare końcówki (ważne!)
    document.querySelectorAll(".endKm").forEach(e => e.remove());

    document.querySelectorAll(".footer").forEach(f => {
        const div = document.createElement("div");
        div.className = "endKm";
        div.innerText = `Stan końcowy: ${end} km`;
        f.appendChild(div);
    });
}

function downloadPDF() {
    html2pdf().set({
        margin:5,
        filename:"ewidencja.pdf",
        html2canvas:{scale:2},
        jsPDF:{unit:"mm",format:"a4"}
    }).from(document.getElementById("pages")).save();
}