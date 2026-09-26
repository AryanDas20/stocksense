# 📦 StockSense: Next-Generation Inventory Management System

Welcome to **StockSense**, a modular Inventory Management System (IMS) designed to digitize and streamline all stock-related operations within a business. Our solution effectively replaces manual registers, Excel sheets, and scattered tracking methods with a centralized, real-time, and easy-to-use application.

---

## 🎯 Problem Statement & Target Audience

Managing inventory manually leads to discrepancies, operational bottlenecks, and lost revenue. **StockSense** provides a seamless digital infrastructure to solve these challenges.

The platform is designed specifically for:

* **Inventory Managers:** Users who manage incoming and outgoing stock.


* **Warehouse Staff:** Users who perform transfers, picking, shelving, and counting.



---

## 🚀 Core Features

### 🔐 Authentication & Onboarding

* Users can easily sign up and log in to the platform.


* The system includes an OTP-based password reset for security.


* Upon successful login, users are directly redirected to the Inventory Dashboard.



### 📊 Interactive Dashboard

The landing page provides a real-time snapshot of inventory operations. Key Performance Indicators (KPIs) include:

* Total Products in Stock.


* Low Stock or Out of Stock Items.


* Pending Receipts and Pending Deliveries.


* Internal Transfers Scheduled.



### 📦 Product Management

* Users can create and update products with specific details including Name, SKU / Code, Category, and Unit of Measure.


* Initial stock levels can optionally be set during product creation.


* Users can view stock availability per location, manage product categories, and set up reordering rules.



### 🔄 Operations & Stock Tracking

* **Receipts (Incoming Goods):** Used when items arrive from vendors. Users create a new receipt, add the supplier and products, input received quantities, and validate to automatically increase stock.


* **Delivery Orders (Outgoing Goods):** Used when stock leaves the warehouse for customer shipments. Staff pick and pack items, then validate the order to automatically decrease stock.


* **Internal Transfers:** Allows moving stock inside the company, such as from a Main Warehouse to a Production Floor, or between racks and warehouses. Each movement is logged in the ledger.


* **Stock Adjustments:** Fixes mismatches between recorded stock and physical counts. Users select the product and location, enter the counted quantity, and the system auto-updates and logs the adjustment.



### 🛠 Navigation & Additional Capabilities

The intuitive navigation sidebar includes access to:

* Products, Operations (including Receipts, Delivery Orders, Inventory Adjustment, and Move History), Dashboard, Setting, Warehouse, and a Profile Menu (My Profile, Logout).


* **Dynamic Filters:** Users can filter by document type (Receipts / Delivery / Internal / Adjustments), status (Draft, Waiting, Ready, Done, Canceled), warehouse/location, or product category.


* **Smart Tools:** The system supports low stock alerts, multi-warehouse support, and an advanced SKU search with smart filters.



---

## 📈 Example Inventory Flow

To understand the lifecycle of a product within StockSense, here is a standard operational flow:

1. **Step 1: Receive Goods from Vendor**
* Receive 100 kg of Steel.


* The system automatically logs: Stock +100.




2. **Step 2: Move to Production Rack**
* Initiate an internal transfer from the Main Store to the Production Rack.


* Total stock remains unchanged, but the new location is updated in the system.




3. **Step 3: Deliver Finished Goods**
* Deliver 20 steel frames.


* The system automatically logs: Stock for frames -20.




4. **Step 4: Adjust Damaged Items**
* Report 3 kg of steel as damaged.


* The system automatically logs an adjustment: Stock -3.


* Everything is securely logged in the Stock Ledger.





---

## 🎨 Design & Prototyping

To view the initial wireframes and UI architecture, please check out our Excalidraw mockup:
[View the Mockup Here](https://www.google.com/search?q=https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R&utm_source=gemini)

---

## 💻 Tech Stack & Installation

*(Add your hackathon tech stack details, installation commands, and environment variable requirements here)*

1. Clone the repository: `git clone [repository-url]`
2. Install dependencies: `npm install` (or equivalent)
3. Run the development server: `npm start` (or equivalent)

What specific technology stack (frontend, backend, database) did you use so we can finalize the technical instructions section?
