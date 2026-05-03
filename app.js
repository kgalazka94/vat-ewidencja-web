const ROWS_PER_PAGE = 22;

const monthEl = document.getElementById("month");
const startKmEl = document.getElementById("startKm");
const nameEl = document.getElementById("name");
const plateEl = document.getElementById("plate");

function generate() {
    const month = monthEl.value;
    if (!month) return;

    const [year, m] = month.split("-");
    const days = new Date(year, m, 0).getDate();

    let entries = [];

    for (let d = 1; d <= days; d++) {
        entries.push({
            date: `${String(d).padStart(2,"0")}-${m}-${year}`,
            km: 54
        });
    }

    render(entries.slice(0,22));
}

function render(entries) {
    const container = document.getElementById("pages");

    const monthLabel = new Date(monthEl.value).toLocaleString("pl-PL", {
        month: "long",
        year: "numeric"
    });

    let rows = "";

    entries.forEach((e) => {
        rows += `
    <tr ondblclick="addRow(this)" oncontextmenu="removeRow(this);return false;">
      <td></td>
      <td contenteditable>${e.date}</td>
      <td contenteditable>przejazd</td>
      <td contenteditable>biuro - klient - biuro</td>
      <td contenteditable oninput="recalc()">${e.km}</td>
    </tr>`;
    });

    container.innerHTML = `
  <div class="page">

    <div class="title">Ewidencja przebiegu pojazdu VAT</div>

    <div class="header-grid">
      <div>Miesiąc / rok: <b>${monthLabel}</b></div>
      <div>Strona 1</div>

      <div>Imię i nazwisko: ${nameEl.value}</div>
      <div>Nr rej: ${plateEl.value}</div>

      <div>Stan początkowy: <span id="startKmVal">${startKmEl.value}</span> km</div>
      <div>Stan końcowy: <span id="endKmVal">0</span> km</div>
    </div>

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

    <div class="footer">
      Z przeniesienia: 0.00 km<br>
      Podsumowanie strony: <span id="sumKm">0</span> km
    </div>

  </div>
  `;

    renumber();
    recalc();
}

function renumber() {
    document.querySelectorAll("tbody tr").forEach((r,i)=>{
        r.children[0].innerText = i+1;
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

    document.querySelectorAll("td:nth-child(5)").forEach(c=>{
        const val = parseFloat(c.innerText);
        total += isNaN(val) ? 0 : val;
    });

    const start = parseFloat(startKmEl.value) || 0;
    const end = start + total;

    document.getElementById("sumKm").innerText = total;
    document.getElementById("endKmVal").innerText = end;
}