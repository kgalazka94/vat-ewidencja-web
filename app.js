const ROWS_PER_PAGE = 22;
let routes = [];

fetch("routes.csv")
    .then(res => res.text())
    .then(text => {
        routes = text.split("\n").filter(r => r.trim());
        const list = document.getElementById("routesList");
        routes.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r;
            list.appendChild(opt);
        });
    });

function generate() {
    const month = monthEl.value;
    const name = nameEl.value;
    const plate = plateEl.value;
    const startKm = parseFloat(startKmEl.value);
    const kmPerDay = parseFloat(kmPerDayEl.value);
    const skipWeekends = skipWeekendsEl.checked;

    const [year, m] = month.split("-");
    const days = new Date(year, m, 0).getDate();

    const pagesDiv = document.getElementById("pages");
    pagesDiv.innerHTML = "";

    let entries = [];

    for (let d = 1; d <= days; d++) {
        const date = new Date(year, m - 1, d);
        const day = date.getDay();

        if (skipWeekends && (day === 0 || day === 6)) continue;

        entries.push({
            lp: entries.length + 1,
            date: `${String(d).padStart(2, "0")}-${m}-${year}`,
            km: kmPerDay
        });
    }

    let carry = 0;
    let pageNumber = 1;

    for (let i = 0; i < entries.length; i += ROWS_PER_PAGE) {
        const chunk = entries.slice(i, i + ROWS_PER_PAGE);

        let pageKm = 0;

        let rows = chunk.map(e => {
            pageKm += e.km;

            return `
      <tr>
        <td>${e.lp}</td>
        <td>${e.date}</td>
        <td contenteditable>przejazd</td>
        <td>
          <input list="routesList" value="${routes[0] || ''}">
        </td>
        <td contenteditable oninput="recalc()">${e.km}</td>
      </tr>
      `;
        }).join("");

        const page = document.createElement("div");
        page.className = "page";

        page.innerHTML = `
      <div class="header">
        <b>Ewidencja przebiegu pojazdu VAT</b><br>
        ${name} | ${plate} | ${month}<br>
        Strona ${pageNumber}
      </div>

      <table>
        <tr>
          <th>Lp</th><th>Data</th><th>Cel</th><th>Trasa</th><th>Km</th>
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

    updateSummary(startKm);
}

function recalc() {
    const kms = document.querySelectorAll("td:nth-child(5)");
    let total = 0;
    kms.forEach(k => total += parseFloat(k.innerText) || 0);

    const startKm = parseFloat(startKmEl.value);
    updateSummary(startKm, total);
}

function updateSummary(start, totalOverride = null) {
    let total = totalOverride ?? 0;

    if (!totalOverride) {
        document.querySelectorAll("td:nth-child(5)").forEach(c => {
            total += parseFloat(c.innerText) || 0;
        });
    }

    const end = start + total;

    let el = document.getElementById("summary");
    if (!el) {
        el = document.createElement("div");
        el.id = "summary";
        document.body.appendChild(el);
    }

    el.innerHTML = `<b>Start:</b> ${start} | <b>Koniec:</b> ${end} | <b>Suma:</b> ${total}`;
}

function downloadPDF() {
    html2pdf().set({
        margin: 5,
        filename: "ewidencja.pdf",
        jsPDF: { format: "a4" }
    }).from(document.getElementById("pages")).save();
}

// localStorage
const monthEl = document.getElementById("month");
const nameEl = document.getElementById("name");
const plateEl = document.getElementById("plate");
const startKmEl = document.getElementById("startKm");
const kmPerDayEl = document.getElementById("kmPerDay");
const skipWeekendsEl = document.getElementById("skipWeekends");

window.onload = () => {
    const data = JSON.parse(localStorage.getItem("vat"));
    if (data) Object.assign({
        monthEl, nameEl, plateEl, startKmEl, kmPerDayEl
    }, data);
};

setInterval(() => {
    localStorage.setItem("vat", JSON.stringify({
        month: monthEl.value,
        name: nameEl.value,
        plate: plateEl.value,
        startKm: startKmEl.value,
        kmPerDay: kmPerDayEl.value
    }));
}, 2000);