# ZoneSafe User Journey: Shoulder Work

## Work Type Classification
**Shoulder Work** - Work on paved shoulder areas

---

## Journey Overview
5-step wizard process culminating in MUTCD-compliant plan generation

---

## Step 1: Location & Road Characteristics

### User Actions
1. User draws line segment on map along the shoulder where work will occur
2. User selects shoulder side (left/right)
3. System retrieves and displays road data

### Data Collection
- **Road name** (editable)
- **Start address** (display only - closest address/mile marker to start point)
- **End address** (display only - closest address/mile marker to end point)
- **Speed limit** (editable, with confidence badge)
- **Shoulder side** (user selects: Left / Right)
- **Shoulder width** (editable, with confidence badge)
- **Lane count** (display only - for reference)
- **Work encroaches into travel lane?** (Yes/No toggle)
  - If Yes: Shows lane selection interface similar to roadway work
  - If No: Proceeds without lane closure data

### Data Sources & Confidence Weighting
| Source | Confidence | Use Case |
|--------|-----------|----------|
| Google Roads API | 100% | Speed limit, road snapping |
| HERE Maps API | 85% | Shoulder width estimation |
| OpenStreetMap | 70% | Fallback shoulder data |
| AI + .gov sources | 100% | Web-scraped government data |
| AI + other web sources | 90% | General web search results |
| User manual override | 100% | User edits any field |

### Data Structure
```typescript
interface ShoulderRoadData {
  roadName: string;
  startAddress: string;
  endAddress: string;
  speedLimit: number;
  shoulderSide: 'left' | 'right';
  shoulderWidthFeet: number;
  shoulderWidthSource: 'google' | 'here' | 'osm' | 'ai-gov' | 'ai-web' | 'user';
  shoulderWidthConfidence: number; // 70-100%
  laneCount: number;
  encroachesIntoLane: boolean;
  encroachingLanes?: number[]; // Only if encroachesIntoLane is true
  userModified: boolean;
  direction: 'northbound' | 'southbound' | 'eastbound' | 'westbound' | 'bidirectional';
}
```

### UI Behavior
- Nothing displays until line segment is drawn
- After drawing, shoulder side selection appears
- After shoulder side selected, page scrolls down to reveal road data
- "Work encroaches into lane?" toggle appears prominently
- All editable fields show confidence badges
- Confidence badge updates to "User Verified" when edited
- If encroachment selected, lane selection interface appears

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
- High-speed shoulder work may require additional buffer zones
- Duration affects temporary vs permanent sign specifications
- Shoulder work during peak hours may require additional warnings

---

## Step 3: Work Zone Details

### Data Collection
- **Number of workers** (1-50+)
- **Work zone length** 
  - Auto-calculated from drawn line segment
  - User can manually override if needed
- **Work zone depth (into shoulder)**
  - Auto-filled based on shoulder width
  - Editable if work extends beyond shoulder
- **Traffic control personnel**
  - Flaggers required: Yes/No
  - Number of flaggers (if yes)
- **Intrusion detection system**
  - Yes/No (recommended for high-speed roadways)

### MUTCD Impact
- Worker count affects buffer space requirements
- Work zone length determines shoulder taper calculations
- Work extending beyond shoulder triggers additional signage
- High-speed shoulder work (≥45 mph) strongly recommends intrusion detection
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

#### Medium Equipment
- Skid steers
- Small compactors
- Concrete saws
- Jackhammers

#### Vehicles
- Dump trucks
- Pickup trucks
- Utility trucks
- Traffic attenuators (highly recommended for shoulder work)
- Arrow boards

#### Specialized Shoulder Equipment
- Mowers (shoulder/roadside)
- Shoulder graders
- Line painting equipment (if shoulder striping)

#### Light/Hand Tools Only
- No equipment checkbox

### UI Design
- Visual icons for each equipment type
- Multi-select interface
- Each selection shows dimensional requirements
- Hovering shows space impact on work zone
- **Traffic attenuator** option is highlighted/recommended for shoulder work

### MUTCD Impact
- Equipment size determines lateral buffer requirements from travel lanes
- Large equipment may require lane closure even for shoulder work
- Traffic attenuator placement affects sign sequences
- Vehicle count affects internal traffic control plan
- Equipment extending into travel lane automatically flags need for lane closure

---

## Step 5: Generation Page

### Loading State
- Progress indicator showing:
  - "Analyzing road conditions..."
  - "Calculating shoulder taper lengths..."
  - "Determining sign placement..."
  - "Evaluating encroachment requirements..."
  - "Generating MUTCD-compliant plan..."

### Processing
System uses collected data to:
1. Calculate shoulder taper lengths (based on speed + shoulder closure type)
2. Determine buffer space requirements (from travel lanes)
3. Calculate sign placement distances (MUTCD formulas)
4. Generate required sign list with specific placement
5. Determine if lane closure is necessary despite shoulder work
6. Create shoulder closure configuration diagram
7. Calculate lateral offset requirements
8. Apply state-specific variations if applicable
9. Calculate overall plan confidence score

### Special Shoulder Work Calculations
- Shoulder taper = 1/3 L (base taper length)
- Minimum 2-foot lateral buffer from travel lane edge
- Intrusion alarm recommendations for high-speed roadways
- Traffic attenuator placement if required

---

## Results Page

### Plan Summary Display
- **Plan confidence score** (weighted average of all data sources)
- **Quick summary card:**
  - Road name and location
  - Shoulder side (left/right)
  - Date range
  - Lane encroachment status
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
  - Shoulder closure configuration
  - Shoulder taper dimensions
  - Buffer zones from travel lanes
  - Equipment placement zones
  - Traffic attenuator position (if applicable)
- Zoom and pan capabilities
- Print-friendly layout

---

## Data Validation Rules

### Step 1
- Line segment must be at least 50 feet
- Shoulder side must be selected
- Shoulder width must be at least 2 feet
- If encroachment selected, at least one lane must be marked

### Step 2
- Duration must be specified
- Time of day must be selected

### Step 3
- Worker count must be at least 1
- If flaggers required, count must be at least 2
- Work zone depth cannot exceed shoulder width unless encroachment is marked

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
- Highlight low-confidence fields in yellow (especially shoulder width)
- Require user to acknowledge before proceeding

### Shoulder Width Detection Issues
- If shoulder width cannot be detected:
  - Default to 8 feet (typical shoulder width)
  - Flag with low confidence (50%)
  - Require user verification
  - Provide typical widths for reference (6-12 feet)

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
- Touch-friendly line drawing along shoulder edge
- Visual indicator showing shoulder vs travel lanes
- Pinch to zoom
- Long-press to place points
- "Undo last point" button

### Shoulder Side Selection
- Large toggle buttons (Left / Right)
- Visual preview showing which shoulder is selected
- Haptic feedback on selection

### Encroachment Toggle
- Large, clear toggle
- Shows impact on plan requirements when toggled

---

## Shoulder Work Specific Features

### Safety Recommendations
- System automatically recommends traffic attenuator if:
  - Speed limit ≥ 45 mph
  - Work duration > 1 hour
  - Heavy equipment present

### Intrusion Detection Recommendations
- System recommends intrusion alarm if:
  - Speed limit ≥ 55 mph
  - Work within 6 feet of travel lane
  - Duration > 4 hours

### Sign Sequence Differences
- Uses "SHOULDER WORK" (W21-105) sign series instead of lane closure signs
- Shoulder taper signage (1/3 L calculation)
- May include "SHOULDER CLOSED" signs
- If encroachment: adds standard lane closure signs

---

## Success Metrics

- Plan generation time: < 30 seconds
- Data confidence average: > 85% (lower than roadway due to shoulder width uncertainty)
- User override rate: < 25% of fields
- Completion rate (Step 1 to Results): > 80%
- Shoulder width manual verification rate: < 40%
