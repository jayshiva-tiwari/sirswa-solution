# 📖 Project Explanation – Business Management System

## 🏢 Introduction  
This project is a **Business Management Web App** built for small to mid-size agencies.  
It helps manage **Leads, Clients, Projects, Expenses, and Reports** in one place with **role-based access control**.  

The goal is to simplify daily operations for:  
- **Calling Staff** → Entering leads & updating client details.  
- **Admin/Managers** → Tracking business performance, revenue, and profit.  

---

## 🎯 Problem Statement  
Most agencies handle leads and client details in **Excel sheets or WhatsApp chats**, which leads to:  
- ❌ Data loss or duplication.  
- ❌ No structured follow-up system.  
- ❌ Difficult profit/loss tracking.  
- ❌ No real-time overview of agency performance.  

---

## ✅ Solution Provided  
This web app solves the above problems by providing:  
- A **centralized dashboard** for Admin.  
- **Role-based login** (Admin & Staff).  
- **Structured forms** for leads, clients, and expenses.  
- **Automated calculations** (profit, pending payments).  
- **Visual charts & reports** for better decision-making.  

--- 

# 📊 Business Management System  

A full-stack **Business Management Web App** to handle **Leads, Clients, Projects, Expenses, and Reports** with role-based access (Admin & Calling Staff).  

---

## 🚀 Features  

### 🔐 Authentication & Roles  
- **Admin** → Full access (Dashboard, Leads, Clients, Expenses, Reports)  
- **Calling Staff** → Limited access (Leads & Clients only)  
- Secure **JWT-based Authentication**  

---

### 📞 Leads Management (Admin + Staff)  
- Add new leads with details:  
  - Client Name, Phone Number  
  - Reference Source (Justdial, Adkriti, Meta, etc.)  
  - Auto-filled Date  
  - Status (New, In Progress, Closed, Not Interested)  
  - Notes, Follow-up Timeline  
- **Table View** with filters (date, status, source)  
- **Inline Editing** for quick updates  
- **Follow-up Reminder Notifications**  

---

### 👥 Clients & Project Management (Admin + Staff)  
- Add & manage client projects:  
  - Client Name, Phone Number  
  - Project Details, Payment Tracking  
  - Auto-calculate Remaining Payment  
  - Bond Signed (Yes/No)  
  - Project Timeline & Delivery Status  
- Filter by delivery status  
- Update payment & project status anytime  
- Track project progress easily  

---

### 💰 Expense & Profit Tracking (Admin Only)  
- Add expenses with date, category, amount, and description  
- Auto-calculate **Total Income vs Spend**  
- Profit = Income – Expenses  
- **Monthly Breakdown** with charts (Pie + Bar)  
- Export reports to **Excel/PDF**  
- Features implemented:  
  - ✅ Complete Expense Management  
  - ✅ Category-wise Tracking (Marketing, Staff Salary, Tools, Other)  
  - ✅ Profit Margin Calculation  
  - ✅ Financial Overview Cards  
  - ✅ Search & Filter Options  
  - ✅ Receipt Number Management  
  - ✅ Payment Method Tracking  

---

### 📊 Dashboard (Admin Only)  
- Total Leads (monthly)  
- Conversion Rate (Leads → Clients)  
- Total Revenue & Profit  
- Upcoming Deliveries list  
- Expense Chart (Pie & Bar)  

---

## 🛠️ Tech Stack  

### Frontend  
- ⚛️ React.js (with modern hooks & components)  
- 🎨 TailwindCSS / ShadCN (for UI)  
- 📊 Chart.js / Recharts (for data visualization)  

### Backend  
- 🟢 Node.js + Express.js (REST API)  
- 🔐 JWT Authentication & Authorization  
- 📦 Mongoose ODM  

### Database  
- 🍃 MongoDB 

---

