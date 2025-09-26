import Salary from "../../Model/finance/salaryModel.js";

export const createSalary = async (req, res) => {
  try {
    let { employeeID, baseSalary, allowances, deductions, month, year } = req.body;

    if (!employeeID || baseSalary == null || !month || !year) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    allowances = allowances != null ? allowances : 0;
    deductions = deductions != null ? deductions : 0;

    const salary = new Salary({ employeeID, baseSalary, allowances, deductions, month, year });
    await salary.save();

    res.status(201).json({ message: "Salary record created", salary });
  } catch (err) {
    console.error("createSalary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----- Get all salaries -----
export const getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().populate("employeeID", "name email");
    res.json({ salaries });
  } catch (err) {
    console.error("getSalaries error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----- Update salary -----
export const updateSalary = async (req, res) => {
  try {
    const body = { ...req.body };
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

export const deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ message: "Salary record not found" });

    res.json({ message: "Salary deleted" });
  } catch (err) {
    console.error("deleteSalary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
