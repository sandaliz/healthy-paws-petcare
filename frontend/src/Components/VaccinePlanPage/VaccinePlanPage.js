import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import "./VaccinePlanPage.css";
import Navbar from "../../Components/Home/Navbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function VaccinePlanPage() {
  const [form, setForm] = useState({
    petSpecies: "dog",
    breed: "",
    birthDate: "",
    sendToEmail: "",
    petName: "",
  });
  const [plan, setPlan] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [petNameError, setPetNameError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "petName") {
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
        setPetNameError("");
      } else {
        setPetNameError("Pet name can only contain letters and spaces");
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "sendToEmail") {
      validateEmail(value);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(email && !emailRegex.test(email) ? "Please enter a valid email address" : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) return alert("Please fix email before submitting");

    try {
      const res = await api.post("/api/vaccines", form);
      setPlan(res.data.plan);
    } catch (err) {
      console.error("Error creating plan:", err.response?.data || err.message);
      alert(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get("/api/vaccines");
        if (res.data?.plans?.length) setPlan(res.data.plans[0]);
      } catch (err) {
        console.error("Error fetching plan:", err.response?.data || err.message);
      }
    };
    fetchPlan();
  }, []);

  // Generate PDF with logo
  const generatePDF = () => {
    if (!plan) return alert("No vaccine plan to generate PDF");

    const doc = new jsPDF();

    // Load logo from public/images/HPlogo.png
    const logo = new Image();
    logo.src = `${window.location.origin}/images/HPlogo.png`;

    logo.onload = () => {
      // Add logo top-left
      doc.addImage(logo, "PNG", 14, 10, 25, 25);

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${plan.petName}'s Vaccine Plan`, 105, 20, { align: "center" });

      // Date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const today = new Date();
      doc.text(`Generated on: ${today.toLocaleDateString()}`, 105, 28, { align: "center" });

      // Table data
      const tableData = plan.schedule?.map((item) => [
        `Week ${item.week}`,
        item.vaccines.join(", "),
        new Date(item.dueDate).toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Week", "Vaccines", "Due Date"]],
        body: tableData,
        theme: "striped",
        styles: { fontSize: 11, cellPadding: 3 },
        headStyles: { fillColor: [84, 65, 60], textColor: 255 },
      });

      if (plan.specialNotes) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Special Notes:", 14, doc.lastAutoTable.finalY + 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(plan.specialNotes, 14, doc.lastAutoTable.finalY + 16);
      }

      doc.save(`${plan.petName}_Vaccine_Plan.pdf`);
    };
  };

  return (
    <>
      <Navbar />
      <div className="vaccine-page-vc p-6 max-w-2xl mx-auto-vc">
        <h1 className="vaccine-title-vc text-xl font-bold mb-4-vc">Generate Vaccine Plan</h1>

        <form onSubmit={handleSubmit} className="vaccine-form-vc space-y-3 mb-6-vc">
          <input
            type="text"
            name="petName"
            placeholder="Pet Name"
            value={form.petName}
            onChange={handleChange}
            className={`vaccine-input-vc border p-2 w-full-vc ${
              petNameError ? "vaccine-error-input-vc border-red-500" : ""
            }`}
            required
          />
          {petNameError && <span className="vaccine-error-text-vc text-red-500 text-sm-vc">{petNameError}</span>}

          <select
            name="petSpecies"
            value={form.petSpecies}
            onChange={handleChange}
            className="vaccine-select-vc border p-2 w-full-vc"
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
          </select>

          <select
            name="breed"
            value={form.breed}
            onChange={handleChange}
            className="vaccine-select-vc border p-2 w-full-vc"
            required
          >
            <option value="">Select Breed</option>
            <option value="None">None</option>
            <option value="Labrador Retriever">Labrador Retriever</option>
            <option value="German Shepherd">German Shepherd</option>
            <option value="Golden Retriever">Golden Retriever</option>
            <option value="French Bulldog">French Bulldog</option>
            <option value="Siberian Husky">Siberian Husky</option>
            <option value="Beagle">Beagle</option>
            <option value="Poodle (Standard)">Poodle (Standard)</option>
            <option value="Dachshund">Dachshund</option>
            <option value="Boxer">Boxer</option>
            <option value="Shih Tzu">Shih Tzu</option>
            <option value="Rottweiler">Rottweiler</option>
            <option value="Yorkshire Terrier">Yorkshire Terrier</option>
            <option value="Doberman Pinscher">Doberman Pinscher</option>
            <option value="Australian Shepherd">Australian Shepherd</option>
            <option value="Cocker Spaniel">Cocker Spaniel</option>
            <option value="Great Dane">Great Dane</option>
            <option value="Pembroke Welsh Corgi">Pembroke Welsh Corgi</option>
            <option value="Boston Terrier">Boston Terrier</option>
            <option value="Shetland Sheepdog">Shetland Sheepdog</option>
            <option value="Chihuahua">Chihuahua</option>
            <option value="None (Cat)">None (Cat)</option>
            <option value="Domestic Shorthair">Domestic Shorthair</option>
            <option value="Maine Coon">Maine Coon</option>
            <option value="Siamese">Siamese</option>
            <option value="Persian">Persian</option>
            <option value="Bengal">Bengal</option>
            <option value="Ragdoll">Ragdoll</option>
            <option value="Sphynx">Sphynx</option>
            <option value="British Shorthair">British Shorthair</option>
            <option value="Scottish Fold">Scottish Fold</option>
            <option value="Russian Blue">Russian Blue</option>
          </select>

          <input
            type="date"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
            className="vaccine-input-vc border p-2 w-full-vc"
            required
          />

          <input
            type="email"
            name="sendToEmail"
            placeholder="Your Email"
            value={form.sendToEmail}
            onChange={handleChange}
            className={`vaccine-input-vc border p-2 w-full-vc ${emailError ? "vaccine-error-input-vc border-red-500" : ""}`}
            required
          />
          {emailError && <span className="vaccine-error-text-vc text-red-500 text-sm-vc">{emailError}</span>}

          <button type="submit" className="vaccine-button-vc bg-blue-600 text-white px-4 py-2 rounded-vc">
            Generate Plan
          </button>
        </form>

        {plan && (
          <div className="vaccine-plan-container-vc">
            <h2 className="vaccine-plan-title-vc text-lg font-semibold mb-2-vc">{plan.petName}'s Vaccine Plan</h2>
            <ul className="vaccine-schedule-list-vc space-y-2">
              {plan.schedule?.map((item, i) => (
                <li key={i} className="vaccine-schedule-item-vc border p-2 rounded flex justify-between-vc">
                  <span>
                    Week {item.week}: {item.vaccines.join(", ")}
                  </span>
                  <span className="vaccine-schedule-date-vc text-gray-600-vc">
                    {new Date(item.dueDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
            {plan.specialNotes && (
              <div className="vaccine-special-notes-vc mt-4 p-2 border rounded bg-yellow-50">
                <h3 className="font-semibold">Special Notes</h3>
                <p>{plan.specialNotes}</p>
              </div>
            )}
            <button
              onClick={generatePDF}
              className="vaccine-button-vc bg-green-600 text-white px-4 py-2 mt-4 rounded-vc"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </>
  );
}
