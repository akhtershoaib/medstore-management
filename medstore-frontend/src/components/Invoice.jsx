import { money } from '../api.js';

export default function Invoice({ sale }) {
  return (
    <div className="invoice">
      <h2>Medical Store</h2>
      <p className="muted">
        Invoice {sale.invoiceNo}<br />
        {new Date(sale.saleTime).toLocaleString()}<br />
        Customer: {sale.customerName || 'Walk-in'} &middot; Billed by: {sale.createdBy}
      </p>
      <table>
        <thead>
          <tr><th>Medicine</th><th>Batch</th><th className="num">Qty</th><th className="num">MRP</th><th className="num">Amount</th></tr>
        </thead>
        <tbody>
          {sale.items.map((i) => (
            <tr key={i.id}>
              <td>{i.medicineName}</td><td>{i.batchNo}</td>
              <td className="num">{i.quantity}</td>
              <td className="num">{money(i.unitPrice)}</td>
              <td className="num">{money(i.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="totals">
        <div><span>Subtotal (incl. GST)</span><span>{money(sale.subtotal)}</span></div>
        <div className="muted"><span>GST included</span><span>{money(sale.gstAmount)}</span></div>
        <div><span>Discount</span><span>- {money(sale.discount)}</span></div>
        <div className="grand"><span>Total</span><span>{money(sale.total)}</span></div>
      </div>
    </div>
  );
}
