# EmPay HRMS — Complete SVG Mockup Analysis

> Source analyzed from SVG export of the HRMS flow/mockup.
>
> This document extracts and structures:
>- all visible modules,
>- navigation,
>- page layouts,
>- workflows,
>- forms,
>- payroll logic,
>- role permissions,
>- analytics,
>- and UI behavior shown in the SVG.

---

# 1. Core System Overview

The system shown in the mockup is a role-based HRMS + Payroll platform.

Main system flow:

Employees
→ Attendance
→ Time Off / Leave
→ Payroll Processing
→ Payslip Generation
→ Reports & Analytics

The mockup strongly focuses on:
- interconnected business logic,
- modular workflows,
- employee lifecycle management,
- payroll calculations,
- and admin visibility.

---

# 2. Main Navigation Structure

The sidebar/navigation repeatedly shows these modules:

- Dashboard
- Employees
- Attendance
- Time Off
- Payroll
- Reports
- Settings

Additional elements:
- Company Name & Logo
- User Profile section
- Logout option

---

# 3. Roles Visible in the System

## Roles
- Admin
- Employee
- HR Officer
- Payroll Officer

---

# 4. Role Permissions

## 4.1 Admin

Full access.

Capabilities:
- Manage employees
- Manage payroll
- Manage attendance
- Manage leave/time off
- Generate reports
- Access analytics
- Configure settings
- Manage user roles

No visible restrictions.

---

## 4.2 Employee

Capabilities:
- View profile
- Mark attendance
- View attendance logs
- Apply for leave/time off
- View leave status
- View payslip
- View payroll summary

Restrictions:
- Cannot manage users
- Cannot edit payroll
- Cannot access admin settings
- Cannot manage reports

---

## 4.3 HR Officer

Capabilities:
- Manage employee profiles
- Monitor attendance
- Allocate leave
- View employee information

Restrictions:
- No payroll editing access
- No settings access

---

## 4.4 Payroll Officer

Capabilities:
- Payroll processing
- Generate payslips
- Attendance access
- Leave approval/rejection
- Payroll reports

Restrictions:
- Cannot modify employee master records
- Cannot access system settings

---

# 5. Authentication Flow

## Login Page

### Visible fields
- Email
- Password

### Buttons
- Login

### Flow
Login
→ Validate credentials
→ Detect role
→ Redirect to dashboard

---

## Registration Page

### Fields visible
- Full Name
- Email
- Password
- Confirm Password
- Role Selection

---

# 6. Dashboard Layout

## Common Structure

### Left Sidebar
- Dashboard
- Employees
- Attendance
- Time Off
- Payroll
- Reports
- Settings

### Top Bar
Visible elements:
- Notifications
- User profile
- Search area
- User avatar

---

# 7. Employee Profile Module

## Profile Overview Page

Visible labels:
- My Profile
- My Name
- Mobile
- Email
- Department
- Manager
- Company
- Location

Additional sections:
- About
- What I love about my job
- My interests and hobbies

The profile page contains descriptive sections using paragraph text.

---

# 8. Extended Profile Information

## Personal Details

Visible fields:
- Date of Birth
- Residing Address
- Personal Email
- Gender
- Nationality
- Marital Status

---

## Banking Details

Visible fields:
- Account Number
- Bank Name
- IFSC Code

---

## Skills Section

Visible elements:
- Skills
- + Add Skills

---

## Resume & Certification

Visible labels:
- Resume
- Certification

---

# 9. Salary Information Section

## Salary Fields Visible

- Month Wage
- Yearly Wage
- Basic Salary
- Performance Bonus
- Leave Travel Allowance
- House Rent Allowance
- Standard Allowance
- Fixed Allowance
- Professional Tax

Currency labels visible:
- ₹ / month
- %

Visible values in mockup:
- 50000
- 600000
- 12500.00
- 25000.00
- 2082.50
- 4167.00
- 2918.00
- 200.00
- 50.00
- 11.67

---

# 10. Salary Components Logic

The salary section indicates:

## Earnings
- Basic Salary
- Bonus
- Allowances

## Deductions
- Professional Tax
- PF/Deduction percentages
- Other deductions

The payroll logic appears component-based.

---

# 11. Employee Directory Module

## Employee Listing Table

Visible columns:
- Employee Name
- Department
- Email
- Mobile
- Status
- Role

Visible actions:
- View
- Edit
- Delete

---

# 12. Attendance Module

## Attendance Overview

Visible modules:
- Attendance Dashboard
- Attendance Table
- Attendance Summary

---

## Attendance Status Types

Visible statuses:
- Present
- Absent
- Leave
- Half Day

---

## Attendance Table Fields

Visible columns:
- Date
- Check In
- Check Out
- Working Hours
- Status

---

## Attendance Flow

Employee marks attendance
→ Attendance saved
→ Monthly records generated
→ Attendance affects payroll

---

# 13. Time Off / Leave Module

## Leave Application Form

Visible fields:
- Leave Type
- Start Date
- End Date
- Reason

Visible leave categories:
- Paid Leave
- Sick Leave
- Casual Leave
- Unpaid Leave

---

## Leave Approval Table

Visible fields:
- Employee Name
- Leave Type
- Duration
- Status

Visible actions:
- Approve
- Reject

---

## Leave Business Logic

Approved leave:
- updates leave balance
- affects payroll calculations
- prevents salary deduction where applicable

Rejected leave:
- no payroll adjustment

---

# 14. Payroll Module

## Payroll Dashboard

Visible widgets:
- Gross Salary
- Deductions
- Net Salary
- Payroll Summary

Visible analytics:
- Payroll charts
- Salary distribution
- Deduction summaries

---

# 15. Payroll Processing Flow

Visible workflow:

Attendance Records
+
Approved Leave
+
Salary Structure
↓
Payroll Calculation
↓
Payslip Generation
↓
Reports & Analytics

---

# 16. Payroll Calculation Structure

## Earnings Section

Visible components:
- Basic Salary
- HRA
- Bonus
- Standard Allowance
- Fixed Allowance
- Travel Allowance

---

## Deduction Section

Visible components:
- Professional Tax
- PF Contribution
- Attendance deductions
- Unpaid leave deductions

---

## Final Output

Visible outputs:
- Gross Salary
- Net Salary
- Total Deductions
- Final Payable Salary

---

# 17. Payslip Module

## Payslip Layout

### Employee Information
- Employee Name
- Employee ID
- Department
- Designation

### Salary Information
- Earnings
- Deductions
- Net Salary

### Footer Information
- Total Earnings
- Total Deductions
- Final Payable Amount

---

# 18. Reports Module

## Reports Visible

- Attendance Report
- Payroll Report
- Leave Report
- Employee Statistics

---

## Analytics & Charts

Visible chart categories:
- Attendance Trends
- Payroll Trends
- Leave Analytics
- Employee Statistics

Dashboard cards visible:
- Total Employees
- Present Employees
- Payroll Expenses
- Leave Distribution

---

# 19. Settings Module

## Visible Settings Areas

- Role Management
- Access Permissions
- User Management

Some smaller settings labels remain partially unreadable due to SVG complexity.

---

# 20. UI Design Patterns Observed

## Design Style

- Dark theme
- Dashboard-centric layout
- Sidebar navigation
- Analytics cards
- Data tables
- Status badges
- Form-heavy workflow

---

## Reusable Components

- CRUD tables
- Modal forms
- Charts
- Dashboard cards
- Search/filter bars
- Role-based visibility

---

# 21. Business Relationships Visible in Mockup

## Core ERP-style dependency chain

Employee
→ Attendance
→ Leave
→ Payroll
→ Payslip
→ Analytics

This is the most important architectural relationship shown in the SVG.

---

# 22. Important Notes Visible in the Mockup

## Payroll Notes

- Payroll depends on attendance.
- Approved leave affects payroll.
- Payslips are generated after payroll processing.

---

## Attendance Notes

- Daily logs maintained.
- Monthly attendance tracking exists.

---

## Leave Notes

- Leave approval workflow mandatory.
- Leave status tracking implemented.

---

# 23. Pages Clearly Visible in SVG

## Authentication
- Login
- Register

## Dashboards
- Admin Dashboard
- Employee Dashboard
- HR Dashboard
- Payroll Dashboard

## Employee Management
- Employee List
- Employee Profile
- Add Employee
- Edit Employee

## Attendance
- Attendance Overview
- Attendance Logs
- Attendance Summary

## Time Off
- Apply Leave
- Leave Approval
- Leave Status

## Payroll
- Payroll Dashboard
- Payroll Processing
- Payslip
- Salary Components

## Reports
- Payroll Reports
- Attendance Reports
- Employee Analytics

## Settings
- Role Management
- Permissions
- User Management

---

# 24. Important Architectural Understanding

The SVG does NOT indicate:
- AI automation,
- advanced enterprise payroll,
- biometric integrations,
- complex accounting,
- or external banking systems.

The design is intentionally focused on:

- HR workflows,
- employee operations,
- payroll visibility,
- attendance tracking,
- role-based access,
- and business process integration.

---

# 25. Most Important Insight From the Mockup

The mockup repeatedly emphasizes:

> Connected business logic over visual complexity.

The central system behavior is:

Employees
→ Attendance Tracking
→ Time Off Approval
→ Payroll Calculation
→ Payslip Generation
→ Analytics & Reporting

This interconnected workflow is the actual core of the problem statement.

