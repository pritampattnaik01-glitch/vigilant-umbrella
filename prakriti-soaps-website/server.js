const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ORDER_EMAIL = process.env.ORDER_EMAIL || "pritampattnaik01@gmail.com";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/order", async (req, res) => {
  try {
    const { customer, items, total } = req.body || {};
    if (!customer?.name || !customer?.phone || !customer?.address || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ ok: false, message: "Please fill all required order details." });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        ok: false,
        message: "Email is not configured yet. Add SMTP_USER and SMTP_PASS in .env."
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || "true") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const itemRows = items.map(i =>
      `<tr>
        <td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(i.name)}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd">${i.qty}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd">₹${Number(i.price).toFixed(2)}</td>
      </tr>`
    ).join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto">
        <h2>New Order — ${escapeHtml(process.env.STORE_NAME || "Prakriti Soaps")}</h2>
        <p><b>Customer:</b> ${escapeHtml(customer.name)}</p>
        <p><b>Phone:</b> ${escapeHtml(customer.phone)}</p>
        <p><b>Email:</b> ${escapeHtml(customer.email || "Not provided")}</p>
        <p><b>Address:</b><br>${escapeHtml(customer.address).replace(/\n/g, "<br>")}</p>
        <h3>Order items</h3>
        <table style="border-collapse:collapse;width:100%">
          <thead><tr><th style="text-align:left;padding:8px">Product</th><th style="text-align:left;padding:8px">Qty</th><th style="text-align:left;padding:8px">Price</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <h3>Total: ₹${Number(total || 0).toFixed(2)}</h3>
      </div>`;

    await transporter.sendMail({
      from: `"${process.env.STORE_NAME || "Prakriti Soaps"}" <${process.env.SMTP_USER}>`,
      to: ORDER_EMAIL,
      replyTo: customer.email || undefined,
      subject: `New order from ${customer.name} — ₹${Number(total || 0).toFixed(2)}`,
      html
    });

    res.json({ ok: true, message: "Order received successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Could not send the order email." });
  }
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

app.listen(PORT, () => {
  console.log(`Store running at http://localhost:${PORT}`);
});
