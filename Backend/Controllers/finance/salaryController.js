import User from "../../Model/userModel.js"
import Salary from "../../Model/finance/salaryModel.js"

// ===== Create Salary =====
export const createSalary = async (req, res) => {
  try {
    let { employeeID, baseSalary, allowances, deductions, month, year } = req.body
    if (!employeeID || baseSalary == null || !month || !year) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    const employee = await User.findById(employeeID)
    if (!employee) return res.status(404).json({ message: "Employee not found" })
    if (employee.role === "USER") return res.status(400).json({ message: "Cannot create salary for normal users" })

    const existing = await Salary.findOne({ employeeID, month, year })
    if (existing) return res.status(400).json({ message: "Salary already exists for this employee" })

    allowances = allowances ?? 0
    deductions = deductions ?? 0

    const salary = new Salary({ employeeID, baseSalary, allowances, deductions, month, year })
    await salary.save()
    res.status(201).json({ message: "Salary record created", salary })
  } catch (err) {
    console.error("createSalary error:", err)
    res.status(500).json({ message: "Server error" })
  }
}

// ===== Get All Staff with Salary Info =====
export const getSalaries = async (req, res) => {
  try {
    const staffRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "INVENTORY_MANAGER",
      "RECEPTIONIST",
      "PET_CARE_TAKER",
      "FINANCE_MANAGER"
    ]
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query

    const staff = await User.find({ role: { $in: staffRoles } }, "name email role")

    const salaries = await Salary.find({ month, year }).lean()
    const salariesMap = new Map(salaries.map(s => [s.employeeID.toString(), s]))

    const merged = staff.map(emp => {
      const salary = salariesMap.get(emp._id.toString())
      return {
        employeeID: emp,
        _id: salary?._id || null,
        baseSalary: salary?.baseSalary || null,
        allowances: salary?.allowances || 0,
        deductions: salary?.deductions || 0,
        netSalary: salary?.netSalary || null,
        month: salary?.month || month,
        year: salary?.year || year,
        status: salary?.status || "Not Generated"
      }
    })

    res.json({ salaries: merged })
  } catch (err) {
    console.error("getSalaries error", err)
    res.status(500).json({ message: "Server error" })
  }
}

// ===== Update Salary =====
export const updateSalary = async (req, res) => {
  try {
    const { id } = req.params
    const body = { ...req.body }

    if (body.month && body.year && body.employeeID) {
      const existing = await Salary.findOne({
        employeeID: body.employeeID,
        month: body.month,
        year: body.year,
        _id: { $ne: id }
      })
      if (existing) return res.status(400).json({ message: "Duplicate salary for this employee & period" })
    }

    if (body.allowances == null) body.allowances = 0
    if (body.deductions == null) body.deductions = 0

    const salary = await Salary.findByIdAndUpdate(id, body, { new: true })
    if (!salary) return res.status(404).json({ message: "Salary record not found" })
    res.json({ message: "Salary updated", salary })
  } catch (err) {
    console.error("updateSalary error:", err)
    res.status(500).json({ message: "Server error" })
  }
}

// ===== Delete =====
export const deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id)
    if (!salary) return res.status(404).json({ message: "Salary record not found" })
    res.json({ message: "Salary deleted" })
  } catch (err) {
    console.error("deleteSalary error:", err)
    res.status(500).json({ message: "Server error" })
  }
}

export const generatePayrollByRole = async (req,res)=>{
  try{
    const {month,year,roles} = req.body
    // roles = { ADMIN:120000, RECEPTIONIST:70000, ... }
    if(!month||!year) return res.status(400).json({message:"Month/year required"})
    const allStaff = await User.find({ role: { $in: Object.keys(roles) } })

    const results = []
    for(const emp of allStaff){
      const exists = await Salary.findOne({employeeID:emp._id, month, year})
      if(!exists){
        const salary=new Salary({
          employeeID:emp._id,
          baseSalary: roles[emp.role] || 0,
          month,year
        })
        await salary.save()
        results.push(salary)
      }
    }
    res.json({message:"Role-based payroll generated", count:results.length, salaries:results})
  }catch(err){
    console.error("generatePayrollByRole error",err)
    res.status(500).json({message:"Server error"})
  }
}

// ===== Salary Summary (Paid vs Pending) =====
export const getSalarySummary = async (req, res) => {
  try {
    const { month, year } = req.query
    const match = {}
    if (month) match.month = Number(month)
    if (year) match.year = Number(year)

    const agg = await Salary.aggregate([
      { $match: match },
      { $group: { _id: "$status", total: { $sum: "$netSalary" }, count: { $sum: 1 } } }
    ])
    let summary = { Paid: { total: 0, count: 0 }, Pending: { total: 0, count: 0 } }
    agg.forEach(g => { summary[g._id] = { total: g.total, count: g.count } })
    res.json({ summary })
  } catch (err) {
    console.error("getSalarySummary error:", err)
    res.status(500).json({ message: "Server error" })
  }
}