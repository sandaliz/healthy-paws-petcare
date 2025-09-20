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
import autoTable from 'jspdf-autotable';
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
  const [salesByCategory, setSalesByCategory] = useState({});
  const [fastMovingItems, setFastMovingItems] = useState([]);
  const [topFoods, setTopFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // Daily Sales
        const salesRes = await axios.get("http://localhost:5000/prescriptions/insights/daily-sales");
        setDailySales(salesRes.data);

        // Sales by Category
        const categoryRes = await axios.get("http://localhost:5000/products/insights/sales");
        setSalesByCategory(categoryRes.data);

        // Fastest Moving Items
        const fastRes = await axios.get("http://localhost:5000/products/insights/fast-moving");
        setFastMovingItems(fastRes.data);

        // Top Foods
        const foodRes = await axios.get("http://localhost:5000/products/insights/top-foods");
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
    console.log("Fetching stock report...");
    const res = await axios.get("http://localhost:5000/products/insights/stock-report");
    console.log("API Response:", res.data);
    
    const report = res.data;

    if (!Array.isArray(report) || report.length === 0) {
      alert("No data available for stock report");
      return;
    }

    // Filter to only include products that have been sold
    const soldProducts = report.filter(item => {
      const qty = item.totalSold ?? 0;
      return qty > 0;
    });

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

    // Only process sold products
    soldProducts.forEach(item => {
      const qty = item.totalSold ?? 0;
      const price = item.cost ?? 0;
      const total = qty * price;
      grandTotalRevenue += total;

      tableRows.push([
        item.name || "N/A",
        qty,
        item.category || "N/A",
        (price).toLocaleString(),
        (total).toLocaleString()
      ]);
    });

    // Use autoTable function directly
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: "grid",
      headStyles: {
        fillColor: [84, 65, 60],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [255, 213, 142]
      }
    });

    doc.setFontSize(14);
    doc.text(
      `Grand Total Revenue: LKR ${grandTotalRevenue.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 10
    );
    
    doc.setFontSize(12);
    doc.text(
      `Total Products Sold: ${soldProducts.length}`,
      14,
      doc.lastAutoTable.finalY + 20
    );

    doc.save("stock_report_sold_products.pdf");
    console.log("PDF generated successfully!");
    
  } catch (err) {
    console.error("❌ PDF generation failed:", err);
    console.error("Error details:", err.response?.data || err.message);
    alert("Report generation failed — check console logs!");
  }
};

  // Line Chart Data
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

  // Pie Chart Data
  const categories = Object.keys(salesByCategory);
  const categoryValues = Object.values(salesByCategory);
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

  // Bar Chart (Top Foods)
  const barData = {
    labels: topFoods.map((f) => f.name),
    datasets: [
      {
        label: "All-Time Sales",
        data: topFoods.map((f) => f.sales),
        backgroundColor: "#54413C",
      },
    ],
  };

  return (
    <div className="insights-container">
      {/* Header with Report Button */}
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
          {/* Line Chart */}
          <div className="insight-card">
            <h2>Daily Sales</h2>
            {dailySales.length > 0 ? <Line data={lineData} /> : <p>No sales data available</p>}
          </div>

          {/* Pie Chart */}
          <div className="insight-card">
            <h2>Product Sales by Category</h2>
            {categories.length > 0 ? <Pie data={pieData} /> : <p>No category sales data available</p>}
          </div>

          {/* Fast Moving List */}
          <div className="insight-card">
            <h2>Fastest Moving Items</h2>
            {fastMovingItems.length > 0 ? (
              <ul className="fast-moving-list">
                {fastMovingItems.map((item, i) => (
                  <li key={i}>
                    <span>{item.name}</span>
                    <strong>{item.sales} sold</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No fast moving items found</p>
            )}
          </div>

          {/* Bar Chart */}
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