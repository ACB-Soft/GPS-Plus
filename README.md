# GPS Plus v5.0

## Overview

**GPS Plus v5.0** is an advanced, high-precision GNSS capture, geodetic transformation, stakeout, and spatial data analysis application developed by **ACB Maps**. 

Integrating state-of-the-art smartphone sensor capabilities with rigorous geodetic engineering mathematics, the system enables surveyors, geophysicists, and civil engineers to perform reliable field measurements directly through a web browser. It features support for the **Turkish National Geoid Model 2020 (TG-20)**, global **EGM96** fallback, 7-Parameter Bursa-Wolf coordinate transformations, and robust statistical filters (Huber M-Estimation, RANSAC, Kalman Filter, and Monte Carlo Particle Filters).

This software represents an active case study in Human-AI co-development, engineered through the synergic partnership of **Google AI Studio** and Geodetic Engineering Domain Specialist **Cihat Başara**.

---

## 🚀 Key Features

*   **High-Precision GNSS Capturing**: Real-time signal reading with dynamic visual satellite count displays, precision indexes, and custom measurement duration controls.
*   **Robust Statistical Filtering**: Sifts out multipath signals and sensor drift using 9 optional advanced filters, including Huber Robust Estimation, RANSAC outlier elimination, Kalman Filtering, and Kernel Density Estimation (KDE).
*   **Geodetic Transform Engine**: Seamless conversions between WGS84, ED50, and ITRF96 coordinate datums using 7-Parameter Bursa-Wolf transformations and Gauss-Krüger Transverse Mercator projections (TM 3° / TM 6°) with automatic Central Meridian identification.
*   **Double-Layer Geoid Interpolation**: Converts ellipsoidal heights ($h$) to orthometric (physical) heights ($H$) via bilinear interpolation over localized 4-node TG-20 and EGM96 grids.
*   **Integrated Stakeout (Aplikasyon) Module**: Guided landmark locator featuring a dynamic 360-degree direction radar and a sensor-driven bubble level (su terazisi) for perfect pole alignment.
*   **Flexible Data Exporters**: One-click exports of captured data in formats optimized for engineering software like Netcad, Google Earth, AutoCAD, and ArcGIS (including specialized Excel sheets, raw TXT, and structured KML/KMZ).
*   **Secure Offline-First State**: Local browser persistence coupled with robust JSON-based backup/restore routines inside Settings.
*   **Automated Technical Reports**: Dynamically generates massive, academic-grade geodetic engineering handbooks, complete with standard deviation matrices, projection parameters, and transformation formulas ready for submission or print.

---

## 📂 Project Directory Structure

The repository is organized following modular *Separation of Concerns* principles, separating calculations from visual layouts:

```text
├── .github/                 	# GitHub workflows & CI/CD configs
├── components/              	# User Interface & Render Modules
│   ├── Dashboard.tsx        	# Dynamic home panel displaying core geodetic statuses
│   ├── GPSCapture.tsx       	# Live GNSS measurement & filtering terminal
│   ├── StakeoutModule.tsx  	# Visual field navigation
│   ├── DataAnalysisView.tsx 	# R&D analysis panel
│   ├── SavedLocationsList.tsx  # Interactive database
│   ├── SettingsView.tsx     	# System settings
│   ├── Onboarding.tsx       	# Technical welcome walkthrough
│   ├── ExcelUtils.ts        	# Engineered Excel exporter
│   ├── KMLUtils.ts          	# High-fidelity CAD & GIS-ready KML file builder
│   ├── TxtUtils.ts          	# Turkish character-safe CAD space exporter (X,Y,Z,No)
│   ├── Header.tsx           	# Global app navigator and connection status indicator
│   ├── GlobalFooter.tsx     	# Version information & brand footer
│   └── Modal.tsx            	# Contextual system alerts and confirmation windows
├── hooks/                   	# Custom React hooks (sensors, geosearch, etc.)
├── services/                	# Geoid grid services & background IO tasks
│   └── GeoidService.ts      	# Handles Bilinear Interpolation for Geoid models
├── utils/                   	# Geodetic Mathematics & Computational Core
│   ├── MathUtils.ts         	# Computational core housing 5 filters
│   ├── CoordinateUtils.ts   	# Projection Math (Gauss-Krüger, Bursa-Wolf,…)
│   ├── GeoidUtils.ts        	# Core parser for height corrections (H=h-N)
│   ├── ReportUtils.ts       	# Dynamic DOC-ready Technical Report generator
│   ├── LanguageContext.tsx  	# Dynamic Language provider supporting EN & TR
│   ├── trtoentranslate.ts   	# Academic geodetic dictionary
│   └── browser.ts           	# Hardware API capability verification hooks
├── App.tsx                  	# Core router and local storage sync
├── types.ts                 	# Strong TypeScript type mappings (GNSS, Filtering,…)
├── version.ts              	# Brand configurations and build metadata
├── index.html               	# Main SPA DOM mount point
└── tsconfig.json            	# Strict TypeScript compilation rules
```

---

## 🛠️ Installation & Setup

### Prerequisites

*   **Node.js**: v18.0.0 or higher is highly recommended.
*   **npm** (Node Package Manager) or **yarn**.

### Step 1: Clone the Repository

Clone this project to your local development machine:
```bash
git clone <repository-url>
cd gps-plus
```

### Step 2: Install Dependencies

Since the codebase relies on high-performance geodetic libraries (such as Proj4 for coordinate math and Recharts for scatter plots and statistical curves), run:
```bash
npm install
```

### Step 3: Run the Development Server

Start Vite's optimized development server:
```bash
npm run dev
```
The server binds to port **`3000`** by default. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## ⚙️ Production Deployment

To build a minimized, production-ready static bundle of the Single-Page Application:

```bash
npm run build
```
The optimized assets will be written to the `dist/` directory, ready to be hosted on any static file server or cloud platform (e.g., Cloud Run, Vercel, Netlify).

---

## 📖 Basic Usage Guide

1.  **Grant Permissions**: On first launch, the app-wide Onboarding walkthrough will guide you to grant **Location Services/GPS** and **Device Orientation** permissions. (Crucial for live measurements and bubble level functions).
2.  **Configure Preferences**: Navigate to the **Settings** view to set your coordinate preferences:
    *   Choose between **WGS84**, **ITRF96 (3°/6° TM)**, or **ED50**.
    *   Set your default Measurement Duration (e.g., 15-30 seconds).
    *   Select your preferred Height Conversion (Orthometric via TG-20/EGM96, or raw Ellipsoidal).
    *   Establish your target Accuracy Limit (meters).
3.  **Start Capturing**: Open the **Capture (Ölçüm)** panel. Wait for the accuracy to settle beneath your target threshold. Choose your preferred mathematical filter (e.g., Huber, RANSAC, or No Filter) and start the countdown. Saving the measurement will secure it inside your local point book.
4.  **Point & Level Stakeouts**: Navigate to the **Stakeout (Aplikasyon)** panel. Select a target coordinate from your saved locations or enter one manually. Use the radar to walk in the correct Azimuth direction, and consult the bubble level to make sure your survey pole is perfectly plumb.
5.  **Examine & Export**: Head to the **Data Analysis** panel. Compare statistical scatter plots, trigger complex filtering configurations, and download professional geodetic reports along with Netcad-ready TXT, GIS-ready KML/KMZ, or diagnostic Excel files.
6.  **Secure Your Data**: Under **Settings**, export a physical JSON backup (`.json`) of your local data to safeguard your measurements, and reload it later on any other device seamlessly.

---

## 🤝 Human-AI Collaboration Statement

This project exemplifies a modern model of **Human-AI Collaborative Engineering**. 

It was brought to life through the iterative pairing of **Google AI Studio** and Geodetic/Harita Engineering Specialist **Cihat Başara**:
*   **Domain Expertise** contributed the academic foundations, 7-Parameter Bursa-Wolf conversion conventions, real-world TG-20 bilateral models, and critical error validations for survey pole bubble alignment.
*   **AI Code Co-Pilot** instantly synthesized robust, typed, modular, and responsive frontend architectures, translated complex geodetic equations into high-precision JavaScript/TypeScript, and integrated robust error recovery systems.

---

## 📄 License

Developed and engineered by **ACB Maps**. All rights reserved. 
Unauthorized duplication, distribution, or commercial use is strictly prohibited.
