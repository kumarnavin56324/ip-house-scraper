async function extract() {
  const input = document.getElementById("inputUrls").value.trim();
  const urls = input.split(/\r?\n/).filter(Boolean);
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  if (urls.length === 0) return;

  const response = await fetch("https://your-backend.onrender.com/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls })
  });

  const data = await response.json();
  data.results.forEach(entry => {
    const row = document.createElement("tr");
    const urlCell = document.createElement("td");
    const srcCell = document.createElement("td");

    urlCell.textContent = entry.url;
    srcCell.innerHTML = entry.sources.map(src => `<div>${src}</div>`).join("");

    row.appendChild(urlCell);
    row.appendChild(srcCell);
    tbody.appendChild(row);
  });
}

function clearOutput() {
  document.getElementById("inputUrls").value = "";
  document.querySelector("#resultTable tbody").innerHTML = "";
}

function copyResult() {
  const table = document.querySelector("#resultTable");
  const range = document.createRange();
  range.selectNode(table);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
  alert("Copied to clipboard!");
}

function exportCSV() {
  const rows = [["Infringing URL", "Source URL(s)"]];
  document.querySelectorAll("#resultTable tbody tr").forEach(row => {
    const cols = row.querySelectorAll("td");
    rows.push([cols[0].innerText, cols[1].innerText.replace(/\n/g, " | ")]);
  });

  let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "ip_house_results.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}