# 🏫 Thakshila College — Gampaha (Official Web Portal)
### ශ්‍රී ලංකා ගම්පහ තක්ෂිලා විද්‍යාලය නිල වෙබ් අඩවිය

![Thakshila College Banner](public/Pictures/Front%20of%20School.jpeg)

Official modern web portal for **Thakshila College, Gampaha** (1AB Senior Secondary Collegiate School). Built with React, Vite, and Node.js featuring comprehensive institutional history, academic profiles, past principals' chronological timeline, co-curricular achievements, sports portal, Thakshila Diary & announcements, and an integrated administrative management system.

---

## 🌟 Key Features

- **🏛️ Institutional Profile & Heritage (About Page):**
  - **Inauguration & Beginning:** Complete 1992 archival registry, founding moment, and pioneering credentials.
  - **Founding Principal Portrait:** Dedicated honor profile for Mrs. Yapa Dissanayake.
  - **Contemporary 1AB Profile:** Over 2,000 students, 94 teachers, Grade 6–13 study streams in Sinhala & Bilingual mediums.
  - **Distinguished Roll of Past Principals:** Official chronological lineage timeline (1992 – 2024).
  - **National Productivity Laurels:** Second Place Islandwide in Advanced Level Schools at National Productivity Awards 2025/26.
  - **School Environment & Facilities:** Science labs, computer units, smart classrooms, media & aesthetics studios, and eco-friendly waste management.
- **📜 Principal's Desk & Message:**
  - Official welcome address by Principal Mr. T. M. Premawansa with justified typography and paragraph indentation.
- **🏅 Sports & Co-Curricular Portals:**
  - Dedicated Sports page mirroring the Thakshila Diary structure for athletic events, house meets, and championships.
- **📰 Thakshila Diary & News Hub:**
  - School announcements, examination notifications, and collegiate celebrations.
- **🛡️ School Identity & Heritage:**
  - Detailed heraldry: School Crest, Latin & Sinhala Motto (*Knowledge Gives Discipline*), Four Houses (Agra, Advi, Anupa, Anabi), and College Flag.
- **⚙️ Integrated Control Desk (Admin & Developer):**
  - Intuitive modal editors for live updates to the About page, principal photos, news, sports posts, and institutional data without database touching.

---

## 🛠️ Technology Stack

- **Frontend:** [React 18](https://react.dev/), [Vite](https://vitejs.dev/)
- **Icons & UI Elements:** [Lucide React](https://lucide.dev/)
- **Styling:** Modern responsive CSS with custom collegiate color system (Maroon & Gold theme)
- **Backend / Data Store:** Node.js, Express, Local JSON database (`server/data/db.json`)
- **Hosting / Deployment Ready:** Vercel (`vercel.json`), GitHub Pages, or Node server

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production-ready assets will be compiled into the `dist/` directory.

---

## 📁 Project Structure

```text
├── public/                 # Static public assets, photographs & school crest
│   └── Pictures/           # High-resolution campus and leadership imagery
├── server/                 # Express backend server and data storage
│   ├── data/
│   │   └── db.json         # Live school data & settings store
│   └── index.js            # API endpoints & persistence handlers
├── src/                    # React frontend application
│   ├── components/         # Reusable UI components & admin edit modals
│   ├── pages/              # Main view pages (Home, About, Sports, News, etc.)
│   ├── config.js           # Default collegiate configurations & fallback values
│   ├── App.jsx             # Root application router & state controller
│   ├── index.css           # Global theme styling, animations & layout rules
│   └── main.jsx            # Application entry point
├── index.html              # HTML shell & SEO meta configuration
├── package.json            # Project dependencies & scripts
├── vercel.json             # Vercel deployment routing configuration
└── vite.config.js          # Vite build optimization configuration
```

---

## 👨‍💻 Credits & Acknowledgements

- **Designed & Developed by:** MWKR SITHUMINA Volunteer, University of Moratuwa (UOM)
- **Under the Auspices of:** TRCSL Programme & Thakshila College IT Unit
- **Client & Institution:** Thakshila College — Gampaha, Western Province, Sri Lanka

---

## 📄 License

This project is maintained for the official educational and institutional use of **Thakshila College, Gampaha**. All rights reserved.
