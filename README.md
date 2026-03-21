# 💸 Personal Expense Tracker

> Built with React · Vite · Tailwind CSS · Chart.js · Frankfurter API · Claude / Gemini AI

---

## 📋 Expense Management

- Recurring and Non-Recurring expense tabs
- Add, edit, delete, and clone expenses
- Inline status toggle — `PAID` / `PENDING` / `OVERDUE` / `SKIPPED`
- Status-colored left border stripe on every row for quick scanning
- Monthly group dividers with paid / pending / total subtotals
- Detail drawer — expand any row to see full expense details
- Note and receipt details field per expense
- Auto-generated recurring expenses each month
- Skip month for recurring expenses
- Bulk edit and bulk delete selected expenses
- Sub-transactions per expense with auto-summed total
- Quick-add from month divider row

## 🔍 Smart Search & Filters

- Natural language search — understands `>500`, `<100`, `pending march`, `travel 2026`
- Search hint chips for common filters
- Multi-select category filter chips
- Date range filter
- Sort by date, amount, or payment type
- Paginated results
- Filter by trip (Travel category)

## 🤖 AI Receipt Scanning

- Scan a receipt photo to auto-fill the expense form
- Supports Anthropic Claude and Google Gemini vision APIs
- Extracts merchant, amount, date, category, payment type, and items
- Mobile scan page at `/scan` — optimized for iPhone camera
- QR code in header to open mobile scan page instantly
- Relay server bridges phone to desktop tracker over local WiFi
- Form auto-fills on desktop when phone scan completes

## 📊 Analytics & Visualizations

- Advanced Analytics tab with year selector
- Year-over-Year spending comparison
- Spending Forecast via linear regression
- Spending Timeline — horizontal scrollable bar chart across all months
- Spike detection — highlights months 150%+ above average
- Month-over-Month breakdown table by category
- Category Spending Patterns with trend badges
- Monthly Totals — clickable bars drill into monthly breakdown
- Monthly drill-down modal with transaction tables per category
- Biggest Expense callout card
- Summary tab with category totals, yearly totals, and overdue alerts
- Pie, bar, and trend chart visualizations

## ✈️ Currency & Travel

- Live currency conversion via Frankfurter API
- Foreign amount and exchange rate stored per expense
- Trip tagging for Travel expenses
- Trip filter chips in expense list
- Category drill-down groups Travel expenses by trip

## 📁 Templates, Import & Export

- Save any expense as a reusable template
- Favorite templates pinned to top
- Quick-load templates with one click
- Import from JSON or CSV with diff preview
- Export filtered expenses to JSON or CSV
- Full backup and restore

## 🎨 UI & Experience

- Light and dark mode toggle
- Animated particle header
- Paid By selector with grouped options
- Manageable dropdowns — add and delete categories, payment types, and paid-by options inline
- Overdue expense banner with one-click mark-all-paid
- Backup reminder system
- Responsive layout

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Charts | Chart.js |
| Currency | Frankfurter API |
| AI Vision | Anthropic Claude / Google Gemini |
| Storage | localStorage |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Add your API key to .env
VITE_GEMINI_API_KEY=your-key-here
# or
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here

# Start the app
npm run dev

# Start the mobile receipt relay (optional, for phone scanning)
node scan-relay.js
```