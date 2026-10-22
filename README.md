# GPS Plus v1.0

## Overview

**GPS Plus** is an advanced, high-precision GNSS capture, geodetic transformation, stakeout, and spatial data analysis application developed by **BSR Maps**. 

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


## 📄 License

Developed and engineered by **BSR Maps**. All rights reserved. 
Unauthorized duplication, distribution, or commercial use is strictly prohibited.
