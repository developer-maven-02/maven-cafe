# Maven Cafe - Complete Project Documentation

## 1. Project Overview

**Project Name:** Maven Cafe  
**Project Type:** Next.js 16 Web Application (Cafeteria Management System)  
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide React Icons  
**Target Users:** Customers, Staff, and Administrators of a cafeteria/cafe

---

## 2. Application Structure

```
maven-cafe/
├── app/
│   ├── layout.tsx                 # Root layout with Geist fonts
│   ├── page.tsx                   # Main landing page
│   ├── globals.css                # Global styles
│   ├── api/                       # API routes (currently empty)
│   ├── screens/                   # All page screens
│   │   ├── page.tsx               # Main menu page (Customer view)
│   │   ├── Authentication/
│   │   │   └── login.tsx          # Login page
│   │   ├── admin/                 # Admin dashboard & management
│   │   │   ├── page.tsx           # Admin dashboard
│   │   │   ├── menu/              # Menu management
│   │   │   │   ├── page.tsx       # Menu categories
│   │   │   │   ├── beverage/      # Beverage management
│   │   │   │   │   ├── page.tsx   # List beverages
│   │   │   │   │   └── AddBeverage/page.tsx
│   │   │   │   ├── food/          # Food management
│   │   │   │   │   ├── page.tsx   # List food items
│   │   │   │   │   └── AddFood/page.tsx
│   │   │   │   └── specialService/ # Special services
│   │   │   │       ├── page.tsx   # Services + Quick Notes
│   │   │   │       ├── AddService/page.tsx
│   │   │   │       └── AddQuickNote/page.tsx
│   │   │   ├── order/             # Order management
│   │   │   │   └── page.tsx      # View all orders
│   │   │   └── team/              # Team member management
│   │   │       ├── page.tsx       # List team members
│   │   │       ├── add/page.tsx   # Add new member
│   │   │       └── edit/[id]/page.tsx
│   │   ├── product/               # Product catalog (Customer)
│   │   │   ├── Beverages/page.tsx
│   │   │   ├── Food/page.tsx
│   │   │   └── Special-Services/page.tsx
│   │   ├── staff/                 # Staff dashboard
│   │   │   ├── page.tsx          # Staff dashboard (3 panels)
│   │   │   ├── orders/           # Order management
│   │   │   │   ├── page.tsx      # Incoming orders list
│   │   │   │   └── [id]/page.tsx # Order detail + status update
│   │   │   ├── service-requests/ # Service requests
│   │   │   │   ├── page.tsx      # Service requests list
│   │   │   │   └── [id]/page.tsx # Service detail + update
│   │   │   └── notifications/    # Notifications list
│   │   ├── support/               # Customer support
│   │   │   ├── review/page.tsx   # Submit review
│   │   │   └── complaint/page.tsx # Submit complaint
│   │   ├── orders/                # Customer orders
│   │   │   ├── [id]/page.jsx     # Order details
│   │   │   └── MyOrders/page.jsx # Order history
│   │   └── profile/               # User profile
├── components/                     # Reusable components (empty)
├── lib/                           # Utility functions (empty)
├── services/                      # API services (empty)
├── public/                        # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 3. User Roles & Access

| Role | Access |
|------|--------|
| **Customer** | Browse menu, place orders, view order history, submit reviews/complaints, manage profile |
| **Staff** | View live orders, manage service requests, update order status, view notifications |
| **Admin** | Dashboard with stats, manage menu (beverages, food, services), manage orders, manage team members |

---

## 4. Complete Database Schema

### 4.1 Users Table
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'staff' | 'admin';
  seat?: string;  // For customers (e.g., "Seat 6", "A12")
  createdAt: string;
}
```

### 4.2 Team Members Table
```typescript
interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'Chef' | 'Cashier' | 'Waiter' | 'Manager';
  joinedDate: string;  // format: "YYYY-MM-DD"
  status: 'Active' | 'Inactive';
  password: string;
  image?: string;  // URL
  createdAt: string;
}

// Mock Data:
[
  { id: 1, name: "Rahul Sharma", email: "rahul@cafe.com", role: "Chef", date: "2024-03-01" },
  { id: 2, name: "Anita Verma", email: "anita@cafe.com", role: "Cashier", date: "2024-03-02" },
  { id: 3, name: "Mohit Singh", email: "mohit@cafe.com", role: "Waiter", date: "2024-03-03" }
]
```

### 4.3 Beverages Table
```typescript
interface Beverage {
  id: number;
  name: string;
  description: string;
  category: 'Beverages';
  image: string;
  temperatureOptions: ['Hot', 'Cold'];
  typeOptions: ['Milk', 'Black'];
  sugarLevels: [0, 1, 2, 3];
  isAvailable: boolean;
  createdAt: string;
}

// Mock Data:
[
  { id: 1, name: "Coffee" },
  { id: 2, name: "Cold Coffee" },
  { id: 3, name: "Tea" }
]
```

### 4.4 Food Table
```typescript
interface Food {
  id: number;
  name: string;
  description: string;
  category: 'Food';
  image: string;
  temperatureOptions: ['Hot', 'Cold'];
  isAvailable: boolean;
  createdAt: string;
}

// Mock Data:
[
  { id: 1, name: "Veg Sandwich" },
  { id: 2, name: "Burger" },
  { id: 3, name: "Pizza" }
]
```

### 4.5 Special Services Table
```typescript
interface SpecialService {
  id: number;
  name: string;
  icon: string;  // Icon name from Lucide
  category: 'Special Services';
  createdAt: string;
}

// Mock Data:
[
  { id: 1, name: "Birthday Decoration", icon: "Gift" },
  { id: 2, name: "Table Setup", icon: "Utensils" },
  { id: 3, name: "Anniversary Setup", icon: "Heart" }
]
```

### 4.6 Quick Notes Table
```typescript
interface QuickNote {
  id: number;
  text: string;
  createdAt: string;
}

// Mock Data:
[
  { id: 1, text: "Urgent" },
  { id: 2, text: "Need assistance" },
  { id: 3, text: "Please come quickly" }
]
```

### 4.7 Customer Service Requests Table (from Special-Services page)
```typescript
interface CustomerServiceRequest {
  id: number;
  service: 'Call Staff' | 'Reheat Food' | 'Request Water' | 'Clean Table';
  seat: string;
  notes: string;
  status: 'Pending' | 'Processing' | 'Completed';
  createdAt: string;
}

// Available Services:
[
  { name: "Call Staff", icon: Bell },
  { name: "Reheat Food", icon: Flame },
  { name: "Request Water", icon: Droplets },
  { name: "Clean Table", icon: Trash }
]
```

### 4.8 Orders Table
```typescript
interface Order {
  id: number;
  userId: number;
  userName: string;
  itemId: number;
  itemName: string;
  category: 'Beverages' | 'Food';
  quantity: number;
  seat: string;  // e.g., "Seat 6", "A12"
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Served' | 'Rejected' | 'Delivered' | 'Completed';
  date: string;  // format: "YYYY-MM-DD"
  time: string;  // e.g., "10:20 AM"
  
  // Beverage specific options
  temperature?: 'Hot' | 'Cold';
  type?: 'Milk' | 'Black';
  sugar?: number;
  
  // Food specific options
  foodType?: 'Hot' | 'Cold';
  
  notes?: string;
  createdAt: string;
}

// Admin Order Mock Data:
[
  { id: 1045, item: "Coffee", user: "John", seat: "Seat 6", status: "Preparing", date: "2024-06-10" },
  { id: 1046, item: "Veg Sandwich", user: "Emma", seat: "Seat 2", status: "Pending", date: "2024-06-11" },
  { id: 1047, item: "Birthday Decoration", user: "Alex", seat: "Seat 4", status: "Completed", date: "2024-06-11" }
]

// Staff Order Mock Data:
[
  { id: 1045, name: "Rahul", item: "Veg Sandwich", qty: 1, location: "Seat 6", notes: "Extra hot" },
  { id: 1046, name: "Amit", item: "Coffee", qty: 2, location: "Seat 3", notes: "Less sugar" }
]

// Customer Order Mock Data:
[
  { id: 1045, item: "Coffee", qty: 1, status: "Preparing", time: "10:20 AM" },
  { id: 1044, item: "Veg Sandwich", qty: 2, status: "Delivered", time: "9:45 AM" },
  { id: 1043, item: "Cold Coffee", qty: 1, status: "Completed", time: "Yesterday" }
]
```

### 4.9 Staff Service Requests Table
```typescript
interface StaffServiceRequest {
  id: number;
  customerId: number;
  customer: string;
  service: string;
  location: string;
  note?: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
  rejectReason?: string;
  createdAt: string;
}

// Mock Data:
[
  { id: 201, customer: "Rahul", service: "Water", location: "Seat 6" },
  { id: 202, customer: "Amit", service: "Table Cleaning", location: "Seat 3" }
]

// Reject Reasons:
["Seat Not Found", "Service Unavailable", "Already Served", "Other"]
```

### 4.10 Reviews Table
```typescript
interface Review {
  id: number;
  rating: number;  // 1-5
  comment: string;
  createdAt: string;
}
```

### 4.11 Complaints Table
```typescript
interface Complaint {
  id: number;
  reason: 'Order Delay' | 'Wrong Item' | 'Quality Issue' | 'Staff Behavior' | 'Other';
  description: string;
  status: 'Pending' | 'Resolved';
  createdAt: string;
}

// Complaint Reasons:
["Order Delay", "Wrong Item", "Quality Issue", "Staff Behavior", "Other"]
```

### 4.12 Notifications Table
```typescript
interface Notification {
  id: number;
  type: 'order' | 'service' | 'ready';
  message: string;
  time: string;  // e.g., "2 min ago"
  isRead: boolean;
  createdAt: string;
}

// Mock Data:
[
  { id: 1, type: "order", message: "New Order #1045 received", time: "2 min ago" },
  { id: 2, type: "service", message: "Water requested at Seat 6", time: "5 min ago" },
  { id: 3, type: "ready", message: "Order #1042 marked Ready", time: "10 min ago" }
]
```

---

## 5. Admin Dashboard Data

### Stats
```typescript
const stats = [
  { label: "Total Orders", value: 128 },
  { label: "Pending", value: 12 },
  { label: "Preparing", value: 8 },
  { label: "Completed", value: 108 }
];
```

### Quick Actions
```typescript
const actions = [
  { label: "Manage Orders", path: "/screens/admin/order" },
  { label: "Manage Menu", path: "/screens/admin/menu" },
  { label: "Team Members", path: "/screens/admin/team" }
];
```

---

## 6. Staff Dashboard Data

### Live Orders
```typescript
const liveOrders = [
  { id: 101, item: "Coffee", seat: "Seat 6", member: "Rahul", status: "Pending" },
  { id: 102, item: "Sandwich", seat: "Seat 3", member: "Amit", status: "Pending" }
];
```

### Live Service Requests
```typescript
const liveServices = [
  { id: 1, type: "Tea Service", location: "Meeting Room", member: "Neha", status: "Pending" },
  { id: 2, type: "Water Refill", location: "Seat 2", member: "Vikas", status: "Pending" }
];
```

### Order Summary
```typescript
const orderSummary = [
  { label: "Completed Orders", value: 24 },
  { label: "Rejected Orders", value: 2 }
];
```

---

## 7. Customer Menu Categories

```typescript
const categories = [
  { name: "Beverages", icon: "☕" },
  { name: "Food", icon: "🍔" },
  { name: "Special Services", icon: "⭐" }
];

const items = [
  { id: 1, name: "Coffee", category: "Beverages", description: "Fresh brewed coffee", image: "..." },
  { id: 2, name: "Tea", category: "Beverages", description: "Hot refreshing tea", image: "..." },
  { id: 3, name: "Veg Sandwich", category: "Food", description: "Grilled veggie sandwich", image: "..." }
];
```

---

## 8. User Profile Data

```typescript
const userProfile = {
  name: "John Doe",
  email: "john@example.com",
  seat: "Seat 6",
  photo: "https://i.pravatar.cc/150?img=12"
};
```

---

## 9. Order Status Flow

```
Pending → Accepted → Preparing → Ready → Served
                ↓
            Rejected
```

```
Customer View:
Pending → Preparing → Delivered / Completed
```

---

## 10. Color Scheme

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Blue | `#103c7f` | Headers, buttons, active states |
| Accent Green | `#a1db40` | Success states, cart badge, highlights |
| Background | `#f8fafc` (gray-50) | Page backgrounds |
| White | `#ffffff` | Cards, inputs |
| Text Primary | `#1e293b` (gray-800) | Main text |
| Text Secondary | `#64748b` (gray-500) | Secondary text |

---

## 11. Key Features by Role

### Customer Features
- Browse menu by category (Beverages, Food, Special Services)
- Search for items
- Customize beverage options (temperature, type, sugar level)
- Place orders with special instructions
- View order history (My Orders)
- View order details
- Submit reviews (1-5 star rating + comments)
- Submit complaints (reason + description)
- Manage profile (name, seat, photo)

### Staff Features
- View live orders panel
- View live service requests panel
- Update order status (Pending → Accepted → Preparing → Ready → Served)
- Reject orders with reason
- Process service requests
- Reject service requests with reason
- View notifications
- Order completion/rejection statistics

### Admin Features
- Dashboard with order statistics (Total, Pending, Preparing, Completed)
- Manage orders (view, filter by status, search by name, date range)
- Manage menu:
  - Beverages (add, edit, delete)
  - Food items (add, edit, delete)
  - Special Services (add, edit, delete)
  - Quick Notes (add, delete)
- Manage team members (add, edit, delete)

---

## 12. Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.577.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## 13. Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application runs on `http://localhost:3000`

---

## 14. Important Notes

- This is a **frontend-only implementation** with mock data stored in React component state
- No actual database is connected
- Forms submit data to console (for demo purposes)
- The `lib/`, `services/`, and `app/api/` directories are empty and can be used for backend integration
- All image URLs are external (Unsplash, pravatar.cc)
- The app is designed for mobile-first (max-width: 420px)
- Admin and Staff panels use different mock data than customer-facing pages
- Status flow differs between Staff view (5 steps) and Customer view (3 states)
