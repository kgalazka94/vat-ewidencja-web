function generate() {
    const month = document.getElementById("month").value;
    const name = document.getElementById("name").value;
    const plate = document.getElementById("plate").value;
    const startDate = document.getElementById("startDate").value;
    const startKm = document.getElementById("startKm").value;
    const endDate = document.getElementById("endDate").value;
    const endKm = document.getElementById("endKm").value;

    const [year, m] = month.split("-");
    const days = new Date(year, m, 0).getDate();

    let rows = "";
    let total = 0;

    for (let i = 1; i <= days && i <= 22; i++) {
        const km = 54;
        total += km;

        rows += `
    <tr>
      <td>${i}</td>
      <td>${String(i).padStart(2,"0")}-${m}-${year}</td>
      <td contenteditable>przejazd</td>
      <td contenteditable>biuro - klient - biuro</td>
      <td contenteditable>${km}</td>
    </tr>`;
    }

    const monthLabel = new Date(month).toLocaleString("pl-PL", {
        month: "long",
        year: "numeric"
    });

    document.getElementById("page").innerHTML = `
  <div class="a4">

    <h2>Ewidencja przebiegu pojazdu VAT</h2>

    <div class="top">
      <div>Miesiąc: ${monthLabel}</div>
      <div>Imię i nazwisko: ${name}</div>
      <div>Nr rejestracyjny: ${plate}</div>
    </div>

    <div class="top">
      <div>Data rozpoczęcia: ${startDate}</div>
      <div>Stan licznika: ${startKm} km</div>
    </div>

    <div class="top">
      <div>Data zakończenia: ${endDate}</div>
      <div>Stan licznika: ${endKm} km</div>
    </div>

    <div class="top bold">
      <div>Suma kilometrów: ${total} km</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Lp</th>
          <th>Data</th>
          <th>Cel</th>
          <th>Opis trasy</th>
          <th>Km</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

  </div>
  `;
}

function downloadPDF() {
    html2pdf().set({
        margin: 5,
        filename: "ewidencja.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4" }
    }).from(document.querySelector(".a4")).save();
}