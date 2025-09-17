const Salary = require("../../Model/finance/salaryModel");

const createSalary = async (req, res) => {
  try {
    let { employeeID, baseSalary, allowances, deductions, month, year } = req.body;

    if (!employeeID || baseSalary == null || !month || !year) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // default values if missing
    allowances = allowances != null ? allowances : 0;
    deductions = deductions != null ? deductions : 0;

    const salary = new Salary({
      employeeID,
      baseSalary,
      allowances,
      deductions,
      month,
      year
    });

    await salary.save();
    res.status(201).json({ message: "Salary record created", salary });
  } catch (err) {
    console.error("createSalary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate("employeeID", "OwnerName OwnerEmail");

    res.json({ salaries });
  } catch (err) {
    console.error("getSalaries error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateSalary = async (req, res) => {
  try {
    let body = { ...req.body };

    // ensure defaults when updating too
    if (body.allowances == null) body.allowances = 0;
    if (body.deductions == null) body.deductions = 0;

    const salary = await Salary.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!salary) return res.status(404).json({ message: "Salary record not found" });

    res.json({ message: "Salary updated", salary });
  } catch (err) {
    console.error("updateSalary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ message: "Salary record not found" });

    res.json({ message: "Salary deleted" });
  } catch (err) {
    console.error("deleteSalary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createSalary,
  getSalaries,
  updateSalary,
  deleteSalary
};