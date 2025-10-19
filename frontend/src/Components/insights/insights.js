import React, { useEffect, useState } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./insights.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

function Insights() {
  const [dailySales, setDailySales] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [fastMovingItems, setFastMovingItems] = useState([]);
  const [topFoods, setTopFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // Daily Sales
        const salesRes = await axios.get("http://localhost:5001/prescriptions/insights/daily-sales");
        setDailySales(salesRes.data);

        // Sales by Category (array of {_id, totalSold})
        const categoryRes = await axios.get("http://localhost:5001/products/insights/sales");
        setSalesByCategory(categoryRes.data);

        // Fastest Moving Items
        const fastRes = await axios.get("http://localhost:5001/products/insights/fast-moving");
        setFastMovingItems(fastRes.data);

        // Top Foods
        const foodRes = await axios.get("http://localhost:5001/products/insights/top-foods");
        setTopFoods(foodRes.data);
      } catch (err) {
        console.error("Error fetching insights", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const generatePDFReport = async () => {
    try {
      const res = await axios.get("http://localhost:5001/products/insights/stock-report");
      const report = res.data;

      if (!Array.isArray(report) || report.length === 0) {
        alert("No data available for stock report");
        return;
      }

      const soldProducts = report.filter((item) => (item.totalSold ?? 0) > 0);

      if (soldProducts.length === 0) {
        alert("No products have been sold yet");
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Stock Report - Sold Products", 14, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

      const tableColumn = ["Product Name", "Quantity Sold", "Category", "Unit Price (LKR)", "Total Price (LKR)"];
      const tableRows = [];
      let grandTotalRevenue = 0;

      soldProducts.forEach((item) => {
        const qty = item.totalSold ?? 0;
        const price = item.cost ?? 0;
        const total = qty * price;
        grandTotalRevenue += total;

        tableRows.push([
          item.name || "N/A",
          qty,
          item.category || "N/A",
          price.toLocaleString(),
          total.toLocaleString(),
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "grid",
        headStyles: { fillColor: [84, 65, 60], textColor: 255 },
        bodyStyles: { fontSize: 9 },
      });

      doc.setFontSize(14);
      doc.text(
        `Grand Total Revenue: LKR ${grandTotalRevenue.toLocaleString()}`,
        14,
        doc.lastAutoTable.finalY + 10
      );
      doc.setFontSize(12);
      doc.text(`Total Products Sold: ${soldProducts.length}`, 14, doc.lastAutoTable.finalY + 20);

      doc.save("stock_report_sold_products.pdf");
    } catch (err) {
      console.error("❌ PDF generation failed:", err);
      alert("Report generation failed — check console logs!");
    }
  };

  // ✅ Chart Data Fixes

  const lineData = {
    labels: dailySales.map((d) => d.date),
    datasets: [
      {
        label: "Sales",
        data: dailySales.map((d) => d.count),
        borderColor: "#54413C",
        backgroundColor: "#FFD58E",
        tension: 0.3,
      },
    ],
  };

  const categories = salesByCategory.map((c) => c._id);
  const categoryValues = salesByCategory.map((c) => c.totalSold);
  const pieData = {
    labels: categories,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: ["#54413C", "#FFD58E", "#E07A5F", "#81B29A", "#F2CC8F"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: topFoods.map((f) => f.name),
    datasets: [
      {
        label: "All-Time Sales",
        data: topFoods.map((f) => f.totalSold), // ✅ FIX
        backgroundColor: "#54413C",
      },
    ],
  };

  return (
    <div className="insights-container">
      <div className="insights-header">
        <h1>Inventory Insights</h1>
        <button className="report-btn" onClick={generatePDFReport}>
          📄 Generate Stock Report (PDF)
        </button>
      </div>

      {loading ? (
        <p>Loading insights...</p>
      ) : (
        <div className="insights-grid">
          <div className="insight-card">
            <h2>Daily Sales</h2>
            {dailySales.length > 0 ? <Line data={lineData} /> : <p>No sales data available</p>}
          </div>

          <div className="insight-card">
            <h2>Product Sales by Category</h2>
            {categories.length > 0 ? <Pie data={pieData} /> : <p>No category sales data available</p>}
          </div>

          <div className="insight-card">
            <h2>Fastest Moving Items</h2>
            {fastMovingItems.length > 0 ? (
              <ul className="fast-moving-list">
                {fastMovingItems.map((item, i) => (
                  <li key={i}>
                    <span>{item.name}</span>
                    <strong>{item.totalSold} sold</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No fast moving items found</p>
            )}
          </div>

          <div className="insight-card">
            <h2>Top Foods (All-Time)</h2>
            {topFoods.length > 0 ? <Bar data={barData} /> : <p>No food sales data available</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Insights;