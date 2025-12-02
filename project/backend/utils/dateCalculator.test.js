// File: /backend/utils/dateCalculator.test.js
// Test file for dateCalculator utility

import { calculateEndDate } from "./dateCalculator.js";

console.log("🧪 Testing Date Calculator Utility\n");

// Test 1: Basic 5-day duration with weekend and holiday
console.log("Test 1: 5 working days with weekend and holiday");
const start1 = "2025-01-03"; // Friday
const duration1 = 5;
const holidays1 = ["2025-01-06"]; // Monday holiday
const result1 = calculateEndDate(start1, duration1, holidays1);
console.log(`Start: ${start1} (Friday)`);
console.log(`Duration: ${duration1} working days`);
console.log(`Holidays: ${holidays1.join(", ")}`);
console.log(
  `Result: ${result1.toISOString().split("T")[0]} (${getDayName(result1)})`
);
console.log(`Expected: 2025-01-10 (Friday)`);
console.log(
  `✅ Pass: ${result1.toISOString().split("T")[0] === "2025-01-10"}\n`
);

// Test 2: Start on weekend (should move to Monday)
console.log("Test 2: Start on weekend");
const start2 = "2025-01-04"; // Saturday
const duration2 = 3;
const result2 = calculateEndDate(start2, duration2, []);
console.log(`Start: ${start2} (Saturday)`);
console.log(`Duration: ${duration2} working days`);
console.log(
  `Result: ${result2.toISOString().split("T")[0]} (${getDayName(result2)})`
);
console.log(`Expected: 2025-01-08 (Wednesday)`);
console.log(
  `✅ Pass: ${result2.toISOString().split("T")[0] === "2025-01-08"}\n`
);

// Test 3: Single day duration
console.log("Test 3: Single day duration");
const start3 = "2025-01-06"; // Monday
const duration3 = 1;
const result3 = calculateEndDate(start3, duration3, []);
console.log(`Start: ${start3} (Monday)`);
console.log(`Duration: ${duration3} working day`);
console.log(
  `Result: ${result3.toISOString().split("T")[0]} (${getDayName(result3)})`
);
console.log(`Expected: 2025-01-06 (Monday)`);
console.log(
  `✅ Pass: ${result3.toISOString().split("T")[0] === "2025-01-06"}\n`
);

// Test 4: Multiple holidays
console.log("Test 4: Multiple holidays");
const start4 = "2025-01-06"; // Monday
const duration4 = 5;
const holidays4 = ["2025-01-07", "2025-01-09"]; // Tue and Thu holidays
const result4 = calculateEndDate(start4, duration4, holidays4);
console.log(`Start: ${start4} (Monday)`);
console.log(`Duration: ${duration4} working days`);
console.log(`Holidays: ${holidays4.join(", ")}`);
console.log(
  `Result: ${result4.toISOString().split("T")[0]} (${getDayName(result4)})`
);
console.log(`Expected: 2025-01-15 (Wednesday)`);
console.log(
  `✅ Pass: ${result4.toISOString().split("T")[0] === "2025-01-15"}\n`
);

// Test 5: Start on holiday (should move to next working day)
console.log("Test 5: Start on holiday");
const start5 = "2025-01-06"; // Monday (holiday)
const duration5 = 2;
const holidays5 = ["2025-01-06"];
const result5 = calculateEndDate(start5, duration5, holidays5);
console.log(`Start: ${start5} (Monday - Holiday)`);
console.log(`Duration: ${duration5} working days`);
console.log(`Holidays: ${holidays5.join(", ")}`);
console.log(
  `Result: ${result5.toISOString().split("T")[0]} (${getDayName(result5)})`
);
console.log(`Expected: 2025-01-08 (Wednesday)`);
console.log(
  `✅ Pass: ${result5.toISOString().split("T")[0] === "2025-01-08"}\n`
);

// Helper function to get day name
function getDayName(date) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getUTCDay()];
}

console.log("✅ All tests completed!");
