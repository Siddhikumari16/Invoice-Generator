const itemRows = document.getElementById('item-rows');
const addItemBtn = document.getElementById('add-item');
const subtotalSpan = document.getElementById('subtotal');
const taxSpan = document.getElementById('tax');
const grandTotalSpan = document.getElementById('grand-total');
const downloadBtn = document.getElementById('download-pdf');
const excelBtn = document.getElementById('download-excel');
const invoiceNumberInput = document.getElementById('invoiceNumber');
const savedInvoices = document.getElementById('saved-invoices');

function generateInvoiceNumber() {
  const num = 'INV' + Date.now();
  invoiceNumberInput.value = num;
}

function addRow() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" placeholder="Item name"></td>
    <td><input type="number" value="1" min="1" class="qty"></td>
    <td><input type="number" value="0" min="0" class="price"></td>
    <td class="total">0</td>
    <td><button type="button" class="remove-btn">Remove</button></td>
  `;
  itemRows.appendChild(tr);

  tr.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', calculateTotals);
  });

  tr.querySelector('.remove-btn').addEventListener('click', () => {
    tr.remove();
    calculateTotals();
  });

  calculateTotals();
}

function calculateTotals() {
  let subtotal = 0;

  itemRows.querySelectorAll('tr').forEach(row => {
    const qty = +row.querySelector('.qty').value;
    const price = +row.querySelector('.price').value;
    const total = qty * price;
    row.querySelector('.total').textContent = total.toFixed(2);
    subtotal += total;
  });

  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  subtotalSpan.textContent = subtotal.toFixed(2);
  taxSpan.textContent = tax.toFixed(2);
  grandTotalSpan.textContent = grandTotal.toFixed(2);
}

async function downloadPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name = document.getElementById('clientName').value;
    const address = document.getElementById('clientAddress').value;
    const date = document.getElementById('invoiceDate').value;
    const invoiceNo = invoiceNumberInput.value;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INVOICE", 90, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    let y = 40;
    doc.text(`Invoice #: ${invoiceNo}`, 20, y);
    doc.text(`Date: ${date}`, 150, y);
    y += 10;
    doc.text(`Client: ${name}`, 20, y);
    y += 10;
    doc.text(`Address: ${address}`, 20, y);
    y += 20;

    doc.setFont("helvetica", "bold");
    doc.text("Item", 20, y);
    doc.text("Qty", 60, y);
    doc.text("Price", 90, y);
    doc.text("Total", 130, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    itemRows.querySelectorAll('tr').forEach((row) => {
      const item = row.querySelector('input[type="text"]').value;
      const qty = row.querySelector('.qty').value;
      const price = row.querySelector('.price').value;
      const total = row.querySelector('.total').textContent;
      
      doc.text(item, 20, y);
      doc.text(qty, 60, y);
      doc.text(`₹${price}`, 90, y);
      doc.text(`₹${total}`, 130, y);
      y += 10;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Subtotal: ₹${subtotalSpan.textContent}`, 20, y);
    y += 10;
    doc.text(`Tax (18%): ₹${taxSpan.textContent}`, 20, y);
    y += 10;
    doc.text(`Grand Total: ₹${grandTotalSpan.textContent}`, 20, y);

    doc.save(`invoice_${invoiceNo}.pdf`);

    saveInvoice({ name, address, date, invoiceNo });
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
}

function exportToExcel() {
  const wb = XLSX.utils.book_new();
  const ws_data = [["Item", "Quantity", "Price", "Total"]];
  
  itemRows.querySelectorAll("tr").forEach(row => {
    const item = row.querySelector('input[type="text"]').value;
    const qty = row.querySelector('.qty').value;
    const price = row.querySelector('.price').value;
    const total = row.querySelector('.total').textContent;
    ws_data.push([item, qty, price, total]);
  });
  
  ws_data.push([]);
  ws_data.push(["Subtotal", "", "", subtotalSpan.textContent]);
  ws_data.push(["Tax (18%)", "", "", taxSpan.textContent]);
  ws_data.push(["Grand Total", "", "", grandTotalSpan.textContent]);
  
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Invoice");
  XLSX.writeFile(wb, "invoice.xlsx");
}

function saveInvoice(data) {
  let saved = JSON.parse(localStorage.getItem("invoices") || "[]");
  saved.push(data);
  localStorage.setItem("invoices", JSON.stringify(saved));
  displaySavedInvoices();
}

function displaySavedInvoices() {
  savedInvoices.innerHTML = "";
  const saved = JSON.parse(localStorage.getItem("invoices") || "[]");
  saved.forEach(inv => {
    const li = document.createElement("li");
    li.textContent = `${inv.invoiceNo} - ${inv.name} - ${inv.date}`;
    savedInvoices.appendChild(li);
  });
}

addItemBtn.addEventListener('click', addRow);
downloadBtn.addEventListener('click', downloadPDF);
excelBtn.addEventListener('click', exportToExcel);

generateInvoiceNumber();
addRow();
displaySavedInvoices();