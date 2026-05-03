const ROWS_PER_PAGE = 22;
let routes = [];

const monthEl = document.getElementById("month");
const nameEl = document.getElementById("name");
const plateEl = document.getElementById("plate");
const startKmEl = document.getElementById("startKm");
const kmPerDayEl = document.getElementById("kmPerDay");
const skipWeekendsEl = document.getElementById("skipWeekends");

// ===== ROUTES =====
fetch("routes.csv")
    .then(r => r.text())
    .then(text => {
        routes = text.split("\n").map(line => {
            const [name, km] = line.split(",");
            return { name, km: parseFloat(km) };
        });

        const list = document.getElementById("routesList");

        routes.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r.name;
            list.appendChild(opt);
        });
    });

// ===== GENERATE =====
function generate() {
    const [year, m] = monthEl.value.split("-");
    const days = new Date(year, m, 0).getDate();

    const container = document.getElementById("pages");
    container.innerHTML = "";

    let entries = [];

    for (let d = 1; d <= days; d++) {
        const date = new Date(year, m - 1, d);
        const day = date.getDay();

        if (skipWeekendsEl.checked && (day === 0 || day === 6)) continue;

        entries.push({
            lp: entries.length + 1,
            date: `${String(d).padStart(2, "0")}-${m}-${year}`,
            km: parseFloat(kmPerDayEl.value)
        });
    }

    render(entries);
}

// ===== RENDER =====
function render(entries) {
    const pagesDiv = document.getElementById("pages");
    pagesDiv.innerHTML = "";

    let pageNumber = 1;
    let carry = 0;

    for (let i = 0; i < entries.length; i += ROWS_PER_PAGE) {
        const chunk = entries.slice(i, i + ROWS_PER_PAGE);

        let pageKm = 0;

        const rows = chunk.map((e, idx) => {
            pageKm += e.km;

            return `
      <tr>
        <td>${e.lp}</td>
        <td contenteditable>${e.date}</td>
        <td contenteditable>przejazd</td>
        <td>
          <input list="routesList" value="${routes[0]?.name || ''}" onchange="routeChanged(this)">
        </td>
        <td contenteditable oninput="recalc()">${e.km}</td>
        <td>
          <button onclick="addRow(this)">+</button>
          <button onclick="removeRow(this)">-</button>
        </td>
      </tr>`;
        }).join("");

        const page = document.createElement("div");
        page.className = "page";

        page.innerHTML = `
      <div class="header">
        <b>Ewidencja VAT</b><br>
        ${nameEl.value} | ${plateEl.value}<br>
        Strona ${pageNumber}
      </div>

      <table>
        <tr>
          <th>Lp</th><th>Data</th><th>Cel</th><th>Trasa</th><th>Km</th><th>Akcje</th>
        </tr>
        ${rows}
      </table>

      <div class="footer">
        Z przeniesienia: ${carry.toFixed(2)} km<br>
        Podsumowanie strony: ${(carry + pageKm).toFixed(2)} km
      </div>
    `;

        carry += pageKm;
        pageNumber++;

        pagesDiv.appendChild(page);
    }

    recalc();
}

// ===== ADD / REMOVE =====
function addRow(btn) {
    const row = btn.closest("tr");

    const newRow = row.cloneNode(true);
    row.after(newRow);

    recalc();
}

function removeRow(btn) {
    const row = btn.closest("tr");
    row.remove();

    recalc();
}

// ===== ROUTE CHANGE =====
function routeChanged(input) {
    const val = input.value;
    const route = routes.find(r => r.name === val);

    if (!route) return;

    const row = input.closest("tr");
    row.children[4].innerText = route.km;

    recalc();
}

// ===== RECALC =====
function recalc() {
    const kms = document.querySelectorAll("td:nth-child(5)");
    let total = 0;

    kms.forEach(c => total += parseFloat(c.innerText) || 0);

    const start = parseFloat(startKmEl.value) || 0;
    const end = start + total;

    document.getElementById("summary").innerHTML =
        `<b>Start:</b> ${start} | <b>Koniec:</b> ${end} | <b>Suma:</b> ${total}`;
}

// ===== PDF =====
function downloadPDF() {
    html2pdf().set({
        margin: 5,
        filename: "ewidencja.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4" }
    }).from(document.getElementById("pages")).save();
}

// ===== SAVE =====
setInterval(() => {
    localStorage.setItem("vat", JSON.stringify({
        month: monthEl.value,
        name: nameEl.value,
        plate: plateEl.value,
        startKm: startKmEl.value,
        kmPerDay: kmPerDayEl.value
    }));
}, 2000);

window.onload = () => {
    const data = JSON.parse(localStorage.getItem("vat"));
    if (!data) return;

    monthEl.value = data.month;
    nameEl.value = data.name;
    plateEl.value = data.plate;
    startKmEl.value = data.startKm;
    kmPerDayEl.value = data.kmPerDay;
};