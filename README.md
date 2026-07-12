# Synapse | Workspace Pipeline Matrix

A high-performance, granular task management matrix built using modern software design methodologies. Synapse provides robust workflow node tracking, persistent state orchestration, and complete forensic audit telemetry mapping with dynamic analytical feedback.

**🌐 Live Production Deployment:** [https://aryan740.github.io/kanban-project/](https://aryan740.github.io/kanban-project/)

---

## 🛠️ Core System Architecture & Engineering

The interface is engineered around a deterministic state engine that models task cards as system nodes mutating across predefined lifecycle steps.

* **State Orchestration Platform:** Leverages a strict React Context API architecture driven by formal transaction reducers (`TaskContext.jsx`), preventing race conditions and unexpected state hydration drops.
* **Asset Performance Modularity:** Complete static bundle generation via Vite with structural relative asset mapping (`base: './'`), completely bypassing infrastructure subdirectory routing capitalization errors.
* **Database Integration Layer:** Real-time event persistence and authorization streaming maps directly to a decoupled Supabase authentication core.
* **Forensic Audit Trails:** Every user-initiated action—creation, lane transition, description updates, and deletions—is tracked with precise immutable transaction logging containing timestamps, operator signatures, and action metadata.

---

## 🎛️ Feature Matrix Specs

### 1. Granular Dynamic Analytics
* Provides real-time mathematical parameter validation tracking active metrics (Total Tasks, Urgency Thresholds, Completed Nodes, Efficiency Vector rates).
* Automatic state sanitization filters out soft-deleted structural entities from the primary counters instantly upon deletion.

### 2. Advanced Soft-Delete & Retention Matrix
* Deleted nodes are excluded from the core Kanban viewport layout but retained in the `GlobalLogCenter` buffer.
* Implements a continuous **48-Hour Retention Lease Window** calculated dynamically from the UTC deletion timestamp.
* Visual separation paradigm maps archived entries with custom high-contrast states (`border-dashed`, reduced line-weight opacity, and dynamic typographical strikethroughs).

### 3. Glassmorphic 3D Identity Guard
* A responsive, highly optimized login vector layout (`Auth.jsx`) featuring clean linear gradients, high-density SVG micro-icons, ambient blur layering, and real-time email dispatch verification logic.

---

## 💻 Technical Stack Matrix

| Layer | Technology | Operational Context |
| :--- | :--- | :--- |
| **Frontend Core** | React 18 / JavaScript ES6+ | Declarative layout generation and lifecycle control |
| **Styling Architecture** | Tailwind CSS | Utility-first high-density grid interfaces |
| **State Machinery** | React Context + useReducer | Immutable data processing pipeline |
| **Backend / Auth** | Supabase Engine | Real-time identity tracking & session tokens |
| **Iconography** | Lucide React | High-contrast structural vector paths |

---

## ⚙️ Installation & Local Replication

To spin up a local development instance of the execution environment, execute the following parameters inside your root terminal:

### 1. Clone the Node Repository
```bash
git clone [https://github.com/aryan740/kanban-project.git](https://github.com/aryan740/kanban-project.git)
cd kanban-project