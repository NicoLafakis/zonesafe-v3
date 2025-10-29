# ZoneSafe User Journey: Roadway/Pavement Work

## Work Type Classification
**Roadway/Pavement Work** - Work within traveled lanes

---

## Journey Overview
5-step wizard process culminating in MUTCD-compliant plan generation

---

## Step 1: Location & Road Characteristics

### User Actions
1. User sets start and end pins on map to indicate work zone location
2. System retrieves and displays road data

### Data Collection
- **Road name** (editable)
- **Start address** (display only - closest address/mile marker to start point)
- **End address** (display only - closest address/mile marker to end point)
- **Speed limit** (editable, with confidence badge)
- **Lane count** (editable, with confidence badge)
- **Lane selection** - Visual interface with rectangles representing each lane
  - User taps/clicks to select which lanes will be closed/impacted
  - Selected lanes highlight in orange
  - Open lanes remain white

### Data Sources & Confidence Weighting
| Source | Confidence | Use Case |
|--------|-----------|----------|
| Google Roads API | 100% | Speed limit, road snapping |
| HERE Maps API | 95% | Lane count (TO_REF_NUM_LANES, FROM_REF_NUM_LANES) |
| OpenStreetMap | 75% | Fallback lane data |
| AI + .gov sources | 100% | Web-scraped government data |
| AI + other web sources | 90% | General web search results |
| User manual override | 100% | User edits any field |

### Data Structure
```typescript
interface RoadData {
  roadName: string;
  startAddress: string;
  endAddress: string;
  speedLimit: number;
  laneCount: number;
  laneCountSource: 'google' | 'here' | 'osm' | 'ai-gov' | 'ai-web' | 'user';
  laneCountConfidence: number; // 75-100%
  userModified: boolean;
  direction: 'northbound' | 'southbound' | 'eastbound' | 'westbound' | 'bidirectional';
  selectedLanes: number[]; // Array of lane indices that are closed
}
```

### UI Behavior
- Nothing displays until line segment is drawn
- After drawing, page scrolls down to reveal road data
- All editable fields show confidence badges
- Confidence badge updates to "User Verified" when edited

---

## Step 2: Work Timing & Duration

### Data Collection
- **Work duration**
  - Hours (1-24)
  - Days (1-365)
  - Weeks (1-52)
- **Time of day**
  - Daytime only
  - Nighttime only
  - 24-hour operation
- **Days of week**
  - Weekdays only
  - Weekends only
  - All days

### MUTCD Impact
- Nighttime work requires additional lighting and reflectorization
- Peak hour closures trigger additional traffic control requirements
- Duration affects temporary vs permanent sign specifications

---

## Step 3: Work Zone Details

### Data Collection
- **Number of workers** (1-50+)
- **Work zone length** 
  - Auto-calculated from drawn line segment
  - User can manually override if needed
- **Traffic control personnel**
  - Flaggers required: Yes/No
  - Number of flaggers (if yes)

### MUTCD Impact
- Worker count affects buffer space requirements
- Work zone length determines taper calculations
- Flagger requirement triggers specific sign sequences

---

## Step 4: Equipment Selection

### Equipment Categories
Users can select multiple items across categories:

#### Heavy Machinery
- Excavators
- Pavers
- Graders
- Rollers/Compactors (large)
- Milling machines

#### Medium Equipment
- Skid steers
- Small compactors
- Concrete saws
- Jackhammers

#### Vehicles
- Dump trucks
- Pickup trucks
- Utility trucks
- Traffic attenuators
- Arrow boards

#### Mobile Equipment
- Striping trucks
- Street sweepers
- Crack sealing equipment

#### Light/Hand Tools Only
- No equipment checkbox

### UI Design
- Visual icons for each equipment type
- Multi-select interface
- Each selection shows dimensional requirements
- Hovering shows space impact on work zone

### MUTCD Impact
- Equipment size determines lateral buffer requirements
- Heavy equipment requires increased taper lengths
- Mobile equipment triggers different sign sequences
- Vehicle count affects internal traffic control plan

---

## Step 5: Generation Page

### Loading State
- Progress indicator showing:
  - "Analyzing road conditions..."
  - "Calculating taper lengths..."
  - "Determining sign placement..."
  - "Generating MUTCD-compliant plan..."

### Processing
System uses collected data to:
1. Calculate taper lengths (based on speed + lane closure type)
2. Determine buffer space requirements (based on equipment)
3. Calculate sign placement distances (MUTCD formulas)
4. Generate required sign list with specific placement
5. Create lane closure configuration diagram
6. Apply state-specific variations if applicable
7. Calculate overall plan confidence score

---

## Results Page

### Plan Summary Display
- **Plan confidence score** (weighted average of all data sources)
- **Quick summary card:**
  - Road name and location
  - Date range
  - Lane closures
  - Equipment summary

### Primary Actions
Large, prominent buttons:
- **View Plan** - Opens interactive plan viewer/preview
- **Download Plan** - Generates and downloads PDF
- **Email Plan** - Opens modal for email input
- **Save Plan** - Triggers account creation if guest, auto-saves if logged in

### Secondary Actions
- **Edit Plan** - Returns to Step 1 with all data preserved
- **Create New Plan** - Starts fresh wizard

### Plan Viewer Features
- Interactive diagram showing:
  - Sign placement with distances
  - Lane closure configuration
  - Taper dimensions
  - Buffer zones
  - Equipment placement zones
- Zoom and pan capabilities
- Print-friendly layout

---

## Data Validation Rules

### Step 1
- Line segment must be at least 50 feet
- Lane count must be 1-8
- At least one lane must be selected as closed

### Step 2
- Duration must be specified
- Time of day must be selected

### Step 3
- Worker count must be at least 1
- If flaggers required, count must be at least 2

### Step 4
- At least one equipment type OR "hand tools only" must be selected

---

## Error Handling

### API Failures
1. Try Google Roads API first
2. If fails, try HERE Maps API
3. If fails, try OpenStreetMap
4. If all fail, engage AI model with web search
5. If AI search fails, require manual input

### Low Confidence Scenarios
- Display warning banner: "Some data sources unavailable. Please verify all fields carefully."
- Highlight low-confidence fields in yellow
- Require user to acknowledge before proceeding

---

## Guest User Flow

### Save Behavior
When guest user clicks "Save Plan" on results page:
1. Show modal: "Create Free Account"
2. Options:
   - Create account (Google OAuth)
   - Continue without saving
3. If continue without saving:
   - Allow download/email
   - Show reminder that plan won't be accessible later

---

## Logged-In User Flow

### Auto-Save
- Plan automatically saves to user account upon generation
- Appears in "My Plans" with thumbnail and metadata
- Can be accessed, edited, or duplicated later

---

## Mobile Considerations

### Map Drawing
- Touch-friendly line drawing
- Pinch to zoom
- Long-press to place points
- "Undo last point" button

### Lane Selection
- Large touch targets (min 44px)
- Clear visual feedback on selection
- Swipe gestures to toggle multiple lanes

---

## Success Metrics

- Plan generation time: < 30 seconds
- Data confidence average: > 90%
- User override rate: < 20% of fields
- Completion rate (Step 1 to Results): > 85%
