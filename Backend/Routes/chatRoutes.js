import express from "express";
const router = express.Router();


const knowledgeBase = [
  // Greetings
  { keywords: ["hi", "hello", "hey", "greetings"], reply: "👋 Hello! How can I assist you and your furry friend today?" },

  // Doctors
  { keywords: ["doctor", "vet", "consultant", "checkup"], reply: "👨‍⚕️ Doctors available Mon–Sat, 9 AM – 5 PM. Book at reception or by phone." },

  // Pharmacy
  { keywords: ["pharmacy", "medicine", "drugstore"], reply: "💊 Pharmacy hours: Mon–Sat, 8:30 AM – 8 PM." },

  // Grooming
  { keywords: ["groom", "bath", "shower", "haircut"], reply: "✂️ Grooming services: Mon–Sat, 10 AM – 4 PM. Reservations by phone are recommended." },

  // Emergencies
  { keywords: ["emergency", "urgent", "24/7", "ambulance"], reply: "🚨 Emergency services available 24/7. Call: 077-1234567." },

  // Boarding / Day Care
  { keywords: ["boarding", "stay", "hotel", "overnight", "daycare"], reply: "🏨 We provide safe pet boarding & daycare. Book early for holidays." },

  // Vaccinations
  { keywords: ["vaccination", "vaccine", "shots", "injection"], reply: "💉 Vaccinations start at 6–8 weeks for puppies & kittens. Adults need boosters every year or as advised." },

  // Food & Diet
  { keywords: ["food", "diet", "meal", "eat", "nutrition"], reply: "🥗 Avoid chocolate, grapes, onions, garlic, and junk food. Use balanced, vet-approved meals only." },

  // Training
  { keywords: ["train", "training", "tips", "behaviour", "discipline"], reply: "🎾 Training tip: keep it short, fun, consistent, and always reward good behaviour!" },

  // Appointments
  { keywords: ["appointment", "book", "schedule", "reservation"], reply: "📅 To book an appointment, call 077-9876543 or visit reception." },

  // 💳 Appointment Payments
  { keywords: ["appointment fee", "doctor fee", "consultation cost", "pay doctor", "checkup cost"], reply: "💳 Appointment/consultation fee is Rs. 1500 per pet. Pay via Cash, Card (Visa/Master), or Mobile Pay." },

  // 💳 Grooming Payments
  { keywords: ["grooming cost", "bath fee", "groom price", "pay grooming"], reply: "✂️ Grooming starts at Rs. 2000. Prices vary with pet size. Payments: Cash, Card, Mobile Pay accepted." },

  // 💳 Boarding Payments
  { keywords: ["boarding fee", "stay cost", "overnight charge", "daycare cost"], reply: "🏨 Boarding costs Rs. 1200 per night including food & care. Discounts for long stays. Pay via Cash, Card, or Mobile Pay." },

  // Opening Hours
  { keywords: ["opening", "hours", "time", "when open", "closing"], reply: "⏰ Open Mon–Sat 8:30 AM – 8 PM. Closed Sundays except for emergencies." },

  // Adoption
  { keywords: ["adopt", "adoption", "rescue", "foster"], reply: "🐶🐱 Adoption drives every Saturday with local shelters. Come meet your future best friend!" },

  // Lost & Found
  { keywords: ["lost pet", "found pet", "missing dog", "missing cat"], reply: "📢 Lost your pet? Leave details at reception. We post on our community board and contact local vets." },

  // Pet Shop
  { keywords: ["shop", "store", "pet shop", "supplies", "buy food"], reply: "🛒 On-site shop sells quality pet food, toys, leashes, grooming items, and medicine." },

  // Contacts
  { keywords: ["contact", "call", "phone", "number"], reply: "📞 Contact us: 077-9876543 (appointments/general) | 077-1234567 (emergencies)." },

  // Location
  { keywords: ["where", "location", "address", "map"], reply: "📍 PetCare Hospital: 123 PetCare Street, Colombo. Free parking available." }
];

// Default fallback if no match
const fallback =
  "Plase contact our reseptionist for more details ! For more details - 071-6918345 Thank you Have a Nice day ❤️";

// Chat route
router.post("/", (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ reply: "⚠️ Please provide a valid message." });
  }

  const text = message.toLowerCase();

  // Search knowledge base
  for (const item of knowledgeBase) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      return res.json({ reply: item.reply });
    }
  }

  // Nothing matched → fallback
  return res.json({ reply: fallback });
});

export default router;