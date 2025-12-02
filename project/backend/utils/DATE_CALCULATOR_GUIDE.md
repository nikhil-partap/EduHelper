# Date Calculator Utility Guide

## 📅 Overview

The `dateCalculator.js` utility calculates end dates for study plans by automatically skipping weekends and holidays, ensuring accurate working day calculations.

---

## 🎯 Features

- ✅ **Skip Weekends** - Automatically excludes Saturdays and Sundays
- ✅ **Skip Holidays** - Excludes custom holiday dates
- ✅ **Smart Start Date** - Moves to next working day if start is weekend/holiday
- ✅ **UTC Normalized** - All dates normalized to midnight UTC
- ✅ **Inclusive Duration** - Start date counts as day 1

---

## 📖 Usage

### Basic Import

```javascript
import { calculateEndDate } from "./utils/dateCalculator.js";
```

### Example 1: Simple 5-Day Plan

```javascript
const startDate = "2025-01-03"; // Friday
const durationDays = 5;
const holidays = [];

const endDate = calculateEndDate(startDate, durationDays, holidays);
// Result: 2025-01-09 (Thursday)
// Working days: Fri 3, Mon 6, Tue 7, Wed 8, Thu 9
```

### Example 2: With Weekend Skip

```javascript
const startDate = "2025-01-03"; // Friday
const durationDays = 5;
const holidays = [];

const endDate = calculateEndDate(startDate, durationDays, holidays);
// Skips: Sat 4, Sun 5
// Working days: Fri 3 (1), Mon 6 (2), Tue 7 (3), Wed 8 (4), Thu 9 (5)
// Result: 2025-01-09
```

### Example 3: With Holidays

```javascript
const startDate = "2025-01-03"; // Friday
const durationDays = 5;
const holidays = ["2025-01-06"]; // Monday holiday

const endDate = calculateEndDate(startDate, durationDays, holidays);
// Skips: Sat 4, Sun 5, Mon 6 (holiday)
// Working days: Fri 3 (1), Tue 7 (2), Wed 8 (3), Thu 9 (4), Fri 10 (5)
// Result: 2025-01-10
```

### Example 4: Start on Weekend

```javascript
const startDate = "2025-01-04"; // Saturday
const durationDays = 3;
const holidays = [];

const endDate = calculateEndDate(startDate, durationDays, holidays);
// Moves start to Monday 6
// Working days: Mon 6 (1), Tue 7 (2), Wed 8 (3)
// Result: 2025-01-08
```

### Example 5: Multiple Holidays

```javascript
const startDate = "2025-01-06"; // Monday
const durationDays = 5;
const holidays = [
  "2025-01-07", // Tuesday
  "2025-01-09", // Thursday
];

const endDate = calculateEndDate(startDate, durationDays, holidays);
// Skips: Tue 7, Thu 9, Sat 11, Sun 12
// Working days: Mon 6 (1), Wed 8 (2), Fri 10 (3), Mon 13 (4), Tue 14 (5)
// Result: 2025-01-14
```

---

## 🔧 Function Signature

```javascript
calculateEndDate(startDate, durationDays, (holidays = []));
```

### Parameters

| Parameter      | Type                 | Required | Description                                           |
| -------------- | -------------------- | -------- | ----------------------------------------------------- |
| `startDate`    | Date\|string\|number | Yes      | Starting date (ISO string, Date object, or timestamp) |
| `durationDays` | number               | Yes      | Number of working days (must be >= 1)                 |
| `holidays`     | Array                | No       | Array of holiday dates to skip (default: [])          |

### Returns

- **Type**: `Date`
- **Format**: Date object normalized to midnight UTC
- **Example**: `2025-01-10T00:00:00.000Z`

---

## 💡 Use Cases

### 1. Study Planner

```javascript
// Create a 30-day study plan
const studyPlan = {
  startDate: new Date(),
  durationDays: 30,
  holidays: [
    "2025-01-26", // Republic Day
    "2025-03-14", // Holi
  ],
};

const endDate = calculateEndDate(
  studyPlan.startDate,
  studyPlan.durationDays,
  studyPlan.holidays
);

console.log(`Study plan ends on: ${endDate.toISOString().split("T")[0]}`);
```

### 2. Assignment Deadline

```javascript
// Calculate assignment due date (10 working days)
const assignmentStart = "2025-01-15";
const workingDays = 10;
const schoolHolidays = ["2025-01-26"];

const dueDate = calculateEndDate(assignmentStart, workingDays, schoolHolidays);
```

### 3. Project Timeline

```javascript
// Calculate project completion date
const projectStart = new Date();
const projectDuration = 45; // 45 working days
const publicHolidays = [
  "2025-01-26", // Republic Day
  "2025-03-14", // Holi
  "2025-03-31", // Eid
];

const projectEnd = calculateEndDate(
  projectStart,
  projectDuration,
  publicHolidays
);
```

---

## ⚠️ Important Notes

### 1. Inclusive Duration

The start date counts as day 1:

```javascript
// 1-day duration returns the start date itself (if it's a working day)
calculateEndDate("2025-01-06", 1, []); // Returns: 2025-01-06
```

### 2. Weekend Detection

- **Saturday**: Day 6 (skipped)
- **Sunday**: Day 0 (skipped)
- Uses UTC day of week

### 3. Holiday Format

Holidays can be in any format:

```javascript
const holidays = [
  "2025-01-26", // ISO string
  new Date("2025-03-14"), // Date object
  1737849600000, // Timestamp
];
```

### 4. UTC Normalization

All dates are normalized to midnight UTC:

```javascript
const date = new Date("2025-01-15T14:30:00Z");
const normalized = calculateEndDate(date, 1, []);
// Result: 2025-01-15T00:00:00.000Z
```

---

## 🧪 Testing

Run the test suite:

```bash
cd backend/utils
node dateCalculator.test.js
```

Expected output:

```
🧪 Testing Date Calculator Utility

Test 1: 5 working days with weekend and holiday
✅ Pass: true

Test 2: Start on weekend
✅ Pass: true

Test 3: Single day duration
✅ Pass: true

...

✅ All tests completed!
```

---

## 🐛 Error Handling

### Invalid Inputs

```javascript
// Missing startDate
calculateEndDate(null, 5, []);
// Error: Invalid inputs: startDate and durationDays (>=1) are required

// Invalid duration
calculateEndDate("2025-01-01", 0, []);
// Error: Invalid inputs: startDate and durationDays (>=1) are required

// Negative duration
calculateEndDate("2025-01-01", -5, []);
// Error: Invalid inputs: startDate and durationDays (>=1) are required
```

---

## 📊 Performance

- **Time Complexity**: O(n) where n = durationDays + holidays
- **Space Complexity**: O(h) where h = number of holidays
- **Typical Performance**: < 1ms for durations up to 365 days

---

## 🔄 Integration with Study Planner

```javascript
// In studyPlannerController.js
import { calculateEndDate } from "../utils/dateCalculator.js";

export const createStudyPlan = async (req, res) => {
  const { startDate, durationDays, holidays } = req.body;

  // Calculate end date
  const endDate = calculateEndDate(startDate, durationDays, holidays);

  // Create study plan
  const studyPlan = await StudyPlanner.create({
    studentId: req.user._id,
    startDate,
    endDate,
    durationDays,
    holidays,
    // ... other fields
  });

  res.status(201).json({ success: true, studyPlan });
};
```

---

## 🎓 Best Practices

1. **Always provide holidays** for accurate calculations
2. **Use ISO date strings** for consistency
3. **Validate duration** before calling (must be >= 1)
4. **Store both start and end dates** in database
5. **Consider timezone** when displaying to users

---

## 📝 Example Output

```javascript
const result = calculateEndDate("2025-01-03", 5, ["2025-01-06"]);

console.log(result);
// Output: 2025-01-10T00:00:00.000Z

console.log(result.toISOString().split("T")[0]);
// Output: 2025-01-10

console.log(result.toLocaleDateString());
// Output: 1/10/2025 (depends on locale)
```

---

**Your date calculator is ready to use!** 📅✨
