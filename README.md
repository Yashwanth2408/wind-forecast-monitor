# Wind Forecast Monitoring & Analysis Platform

## Overview
This project is a full-stack wind power forecasting analysis platform built using live UK National Grid data from the Elexon BMRS API. 

It combines:
* A real-time interactive dashboard for monitoring forecast accuracy
* A robust backend pipeline for ingesting and aligning forecast data
* Analytical notebooks for deep error analysis and model improvement
* Bias correction techniques with quantified economic impact

The system is designed to simulate real-world operational forecasting scenarios and evaluate forecast performance across different time horizons.

---

## Live Data Integration
All data is fetched dynamically from the BMRS API:
* **`FUELHH`** → Half-hourly actual wind generation
* **`WINDFOR`** → Forecast data with multiple publish times

### Data Engineering Considerations
* Chunked API requests to avoid rate limits
* Automatic retry handling (HTTP `429`)
* Deduplication of records
* Time normalization across datasets
* Handling resolution mismatch (30-min actuals vs hourly forecasts)

---

## System Architecture

### Frontend
* **Next.js** (App Router)
* **TypeScript**
* **Tailwind CSS**
* **Recharts** (data visualization)

### Backend (API Routes)
* **`/api/actuals`**: Fetches `FUELHH` data, filters `WIND` fuel type, and deduplicates by `startTime`.
* **`/api/forecasts`**: Fetches `WINDFOR` data, handles multiple publish times, and deduplicates by (`startTime` + `publishTime`).

### Data Pipeline
1. Fetch chunked data from BMRS
2. Normalize and filter records
3. Deduplicate entries
4. Align forecasts with actuals based on horizon
5. Compute metrics
6. Render visual analytics

---

## Core Technical Insight — Forecast Horizon Alignment
The central challenge in this project is correctly aligning forecasts with actual generation. For each actual timestamp **T**, the system selects:

> The latest forecast published at or before **T − H**
> *(Where **H** = forecast horizon, ranging from 1h to 48h)*

### Implementation Details
* Forecasts are grouped by start time (hourly resolution).
* Actuals (30-min resolution) are floored to the nearest hour.
* Forecast candidates are filtered by:
  * Publish time cutoff
  * Valid horizon window (0–48 hours)
* The most recent valid forecast is selected.

*This logic ensures a realistic simulation of grid operator decision-making.*

---

## Features

### 1. Interactive Dashboard
* Date range selection
* Horizon selection (1h → 48h)
* Real-time data loading
* Live BMRS integration

### 2. Forecast vs Actual Visualization
* Time series comparison
* Error band visualization
* Downsampling for performance
* Custom tooltips with error breakdown

### 3. Performance Metrics
* **MAE** (Mean Absolute Error)
* **RMSE** (Root Mean Squared Error)
* **Bias** (systematic over/under-forecasting)
* **Coverage** (% matched forecasts)

### 4. Horizon Comparison
* Compare two forecast horizons side-by-side
* Visual degradation of accuracy with increasing horizon
* Quantified RMSE difference
* Percentage degradation analysis

### 5. Error Heatmap
* Error distribution across:
  * Day of week
  * Time of day (30-min slots)
* Metrics: MAE, RMSE, Bias
* Interactive tooltips with sample counts

### 6. Statistical Analysis Panel
* Mean, median, percentiles (P5, P95, P99)
* Min/max error
* Distribution insights

### 7. CSV Export
* Export aligned dataset
* Includes: Actual generation, Forecast values, Publish timestamps, and Horizon used

---

## Analytical Work

### Notebook 1 — Forecast Error Analysis
* Baseline error metrics
* Horizon degradation analysis
* Temporal error patterns (hour, day)
* Error distributions
* Extreme event analysis

### Notebook 2 — Wind Generation & Reliability
* Generation percentiles (P50, P90, P95)
* Low generation risk scenarios
* Seasonal and diurnal trends
* Reliability analysis

---

## Model Improvement — Bias Correction
Three correction strategies were evaluated:

| Model | Description |
| :--- | :--- |
| **BC1** | Global bias correction |
| **BC2** | Hour-of-day correction |
| **BC3** | Hour × Month correction |

**Best Model: BC2**
* MAE reduced from **1,752 MW** → **1,084 MW**
* Improvement: **38.1%**

---

## Business Impact
Improved forecast accuracy directly translates to cost savings:
* **Daily savings:** £1,121,097
* **Annual savings:** £409.2M

*This demonstrates the operational importance of reducing forecast error in energy systems.*

---

## Key Engineering Highlights
* Robust handling of API rate limits
* Efficient data alignment algorithm `O(n)`
* Clean separation of concerns: API layer, Data logic, Visualization
* Scalable architecture for real-time use
* Accurate simulation of real-world forecasting workflows

---

## How to Run Locally

```bash
npm install
npm run dev

Open your browser and navigate to: http://localhost:3000

Deployment
The application is designed for deployment on Vercel.

Optional environment variable:

```bash
BMRS_BASE_URL=[https://data.elexon.co.uk/bmrs/api/v1](https://data.elexon.co.uk/bmrs/api/v1)
```

AI Usage Disclosure
AI tools were used for:


Code structuring and debugging assistance

Analytical guidance

Visualization refinement

All core logic, validation, and implementation decisions were independently verified.

Future Improvements
Real-time streaming updates

ML-based forecast correction models

Weather feature integration

Alert system for extreme forecast errors

Multi-region support

Conclusion
This project demonstrates how raw energy data can be transformed into actionable insights through:

Careful data engineering

Correct temporal alignment of forecasts

Robust statistical analysis

Interactive visualization

It highlights both the technical and economic importance of accurate wind power forecasting in modern energy systems.
