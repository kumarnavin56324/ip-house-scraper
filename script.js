async function extractSources() {
  const urls = document.getElementById("urlInput").value.split("\n").map(u => u.trim()).filter(Boolean);
  const response = await fetch("/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  });
  const data = await response.json();
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";
  data.results.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.url}</td><td>${item.sources.join("<br>")}</td>`;
    tbody.appendChild(row);
  });
}

function clearAll() {
  document.getElementById("urlInput").value = "";
  document.querySelector("#resultsTable tbody").innerHTML = "";
}

function copyTable() {
  const range = document.createRange();
  range.selectNode(document.querySelector("table"));
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand("copy");
  alert("Table copied to clipboard!");
}

function exportCSV() {
  const rows = [["Infringing URL", "Source URLs"]];
  document.querySelectorAll("#resultsTable tbody tr").forEach(tr => {
    const cols = tr.querySelectorAll("td");
    rows.push([cols[0].innerText, cols[1].innerText.replace(/\n/g, ", ")]);
  });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "media_sources.csv";
  a.click();
}
