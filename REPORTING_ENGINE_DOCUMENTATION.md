# Reporting Engine Documentation

## Overview

The reporting engine provides three comprehensive report types that can be generated on-demand via API endpoints. All reports support portfolio-wide or project-specific views and include role-based access control.

## API Endpoints

### 1. Weekly PDF Report

**Endpoint:** `GET /api/reports/weekly-pdf`

**Query Parameters:**
- `projectId` (optional): Filter report to specific project

**Response:** PDF file download

**Description:** Generates a comprehensive weekly PDF report including:
- Portfolio summary (project counts, budgets, performance metrics)
- RAG status distribution (Red/Amber/Green projects)
- Top 10 risks by score
- Recent change orders with cost and time impact
- Cashflow summary
- 30/60/90 day milestone timelines

**Example:**
```bash
# Generate portfolio-wide weekly report
curl -X GET "http://localhost:3000/api/reports/weekly-pdf" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o weekly-report.pdf

# Generate project-specific weekly report
curl -X GET "http://localhost:3000/api/reports/weekly-pdf?projectId=PROJECT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o project-weekly-report.pdf
```

### 2. XLSX Data Pack

**Endpoint:** `GET /api/reports/data-pack`

**Query Parameters:**
- `projectId` (optional): Filter report to specific project

**Response:** XLSX file download

**Description:** Generates a comprehensive Excel workbook with multiple sheets:
- **Portfolio Summary**: Key metrics (project counts, budgets, performance)
- **Projects**: Detailed project list with budget, cost, variance, SPI, CPI
- **Top Risks**: All risks with scores, status, mitigation plans
- **Change Orders**: Change impacts with cost and time analysis
- **Cashflow**: Forecast vs actual with variance analysis
- **Resource Utilization**: Resource allocation with color-coded heatmap
  - Red: Over-utilized (≥90%)
  - Amber: High utilization (70-89%)
  - Green: Optimal (40-69%)
  - Blue: Under-utilized (<40%)
- **Milestones**: Upcoming milestones with timeline information

**Example:**
```bash
# Generate portfolio-wide data pack
curl -X GET "http://localhost:3000/api/reports/data-pack" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o data-pack.xlsx

# Generate project-specific data pack
curl -X GET "http://localhost:3000/api/reports/data-pack?projectId=PROJECT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o project-data-pack.xlsx
```

### 3. PPTX Executive Deck

**Endpoint:** `GET /api/reports/executive-deck`

**Query Parameters:**
- `projectId` (optional): Filter report to specific project

**Response:** PPTX file download

**Description:** Generates a professional PowerPoint presentation with charts and visualizations:
- **Slide 1**: Title slide with date
- **Slide 2**: Portfolio summary with key metrics cards and RAG status distribution
- **Slide 3**: Top risks table (up to 10 highest-scoring risks)
- **Slide 4**: Change impact summary with total cost/time and detailed table
- **Slide 5**: Cashflow summary with metrics and category breakdown
- **Slide 6**: Resource utilization heatmap (8 weeks, top 6 resources per week)
  - Color-coded by utilization level (same as XLSX)
- **Slide 7**: 30/60/90 day milestone timeline

**Example:**
```bash
# Generate portfolio-wide executive deck
curl -X GET "http://localhost:3000/api/reports/executive-deck" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o executive-deck.pptx

# Generate project-specific executive deck
curl -X GET "http://localhost:3000/api/reports/executive-deck?projectId=PROJECT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o project-executive-deck.pptx
```

## Authentication

All reporting endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

To obtain a JWT token, use the login endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

## Role-Based Access Control

Reports respect the existing RBAC system:
- **ADMIN**: Access to all projects
- **PM**: Access to assigned projects
- **QS**: Access to assigned projects
- **SITE**: Access to assigned projects
- **VIEWER**: Read-only access to assigned projects

When generating reports, users will only see data from projects they have access to based on their role and project assignments.

## Performance Metrics

The reports use simplified performance metrics:
- **SPI (Schedule Performance Index)**: Earned Value / Planned Value
- **CPI (Cost Performance Index)**: Earned Value / Actual Cost
- **RAG Status**: Based on SPI and CPI thresholds
  - Green: SPI ≥ 0.95 AND CPI ≥ 0.95
  - Red: SPI < 0.85 OR CPI < 0.85
  - Amber: All other cases

## Milestone Timeframes

Milestones are categorized into three timeframes:
- **Next 30 Days**: 0-30 days from today
- **31-60 Days**: 31-60 days from today
- **61-90 Days**: 61-90 days from today

Only milestones with status `PENDING` or `IN_PROGRESS` are included in reports.

## Resource Heatmap

The resource utilization heatmap shows:
- Next 8 weeks starting from today
- Top 6 resources per week (by utilization)
- Color-coded utilization levels:
  - Red (≥90%): Over-allocated
  - Amber (70-89%): High utilization
  - Green (40-69%): Optimal
  - Blue (<40%): Under-utilized

## File Naming

Generated files are automatically named with timestamps:
- Weekly PDF: `weekly-report-DD-MM-YYYY.pdf`
- Data Pack: `data-pack-YYYY-MM-DD.xlsx`
- Executive Deck: `executive-deck-YYYY-MM-DD.pptx`

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK`: Report generated successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error during report generation

Error responses include a JSON body with error details:
```json
{
  "error": "Error message"
}
```

## Implementation Details

### Libraries Used
- **jspdf** + **jspdf-autotable**: PDF generation with tables
- **exceljs**: Excel workbook generation with styling and formatting
- **pptxgenjs**: PowerPoint presentation generation with charts and tables

### Data Aggregation
Reports aggregate data from multiple Prisma models:
- `Project`: Base project information and budgets
- `Risk`: Risk register with probability × impact scoring
- `ChangeOrder`: Change requests with cost and time impacts
- `Cashflow`: Financial forecasts and actuals
- `ResourceAllocation`: Resource assignments and utilization
- `Milestone`: Project milestones and timelines

### Performance Considerations
- Reports fetch data using optimized Prisma queries with includes
- Large datasets are limited (e.g., top 10-15 risks, recent changes)
- Resource heatmap shows only top 6 resources per week
- All data is aggregated in-memory before generation

## Future Enhancements

Possible improvements for future versions:
- Scheduled report generation (daily/weekly/monthly)
- Email delivery of reports
- Custom report templates
- Additional chart types (bar charts, pie charts, trend lines)
- Historical comparison (week-over-week, month-over-month)
- Export to additional formats (CSV, JSON)
- Report caching for frequently accessed reports
- Asynchronous report generation for large datasets
