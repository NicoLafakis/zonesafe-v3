# ZoneSafe User Journey: Roadside/Utility Work

## Work Type Classification
**Roadside/Utility Work** - Work beyond the shoulder

---

## Journey Overview
5-step wizard process culminating in MUTCD-compliant plan generation

---

## Step 1: Location & Road Characteristics

### User Actions
1. User drops pin on map at primary work location
2. User specifies if work extends linearly (Yes/No)
   - If Yes: Draw line segment showing extent of work
   - If No: System uses circular buffer around pin
3. System retrieves and displays road data

### Data Collection
- **Road name** (editable)
- **Work location address** (closest address/mile marker to pin)
- **End location** (if linear work - closest address to end point)
- **Speed limit** (editable, with confidence badge)
- **Lane count** (display only - for reference)
- **Work extends from roadway (feet)** 
  - Auto-estimated: 15 feet (beyond typical shoulder)
  - User editable with slider (5-100 feet)
- **Work side of road** (user selects: Left / Right / Both)
- **Staging/parking location**
  - On shoulder
  - Off roadway (pull-off/access road)
  - In travel lane (triggers lane closure workflow)

### Data Sources & Confidence Weighting
| Source | Confidence | Use Case |
|--------|-----------|----------|
| Google Roads API | 100% | Speed limit, road snapping |
| HERE Maps API | 95% | Roadway geometry |
| OpenStreetMap | 75% | Fallback data |
| AI + .gov sources | 100% | Web-scraped government data |
| AI + other web sources | 90% | General web search results |
| User manual override | 100% | User edits any field |

### Data Structure
```typescript
interface RoadsideWorkData {
  roadName: string;
  workLocationAddress: string;
  endLocationAddress?: string; // Only if linear work
  speedLimit: number;
  laneCount: number;
  workExtentFeet: number; // Distance from roadway edge
  workSide: 'left' | 'right' | 'both';
  isLinearWork: boolean;
  linearLengthFeet?: number; // Only if linear
  stagingLocation: 'shoulder' | 'off_roadway' | 'travel_lane';
  requiresLaneClosure: boolean; // Auto-set if staging in travel lane
  requiresShoulderClosure: boolean; // Auto-set if staging on shoulder
  userModified: boolean;
  direction: 'northbound' | 'southbound' | 'eastbound' | 'westbound' | 'bidirectional';
}
```

### UI Behavior
- Map starts with instruction: "Drop pin at work location"
- After pin dropped, "Work extends linearly?" appears
- If linear selected, map allows line drawing from pin
- Page scrolls to reveal road data
- Staging location selector appears prominently
- If "travel lane" staging selected, warning appears: "Lane closure workflow will apply"
- All editable fields show confidence badges
- Work extent slider shows visual preview on map

### Map Interaction Specifics
- **Single location:** Pin drop creates 50-foot diameter circle
- **Linear work:** Line extends from pin, shows work zone buffer on both sides
- Visual distinction between:
  - Work area (beyond shoulder)
  - Staging area (on shoulder or roadway)
  - Travel lanes (for reference)

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
- **Access frequency**
  - Continuous presence
  - Intermittent (specify how many trips per day)

### MUTCD Impact
- Nighttime work requires additional lighting and reflectorization
- Intermittent access may allow simplified signage
- Short duration (< 1 hour) may qualify for short-duration procedures
- Duration affects temporary vs permanent sign specifications

---

## Step 3: Work Zone Details

### Data Collection
- **Number of workers** (1-50+)
- **Work zone dimensions**
  - Depth from roadway: Auto-calculated from Step 1, editable
  - Width along roadway: Auto-calculated (linear) or default 50 feet (point)
  - User editable
- **Traffic control personnel**
  - Flaggers required: Yes/No
  - Spotter required: Yes/No (recommended if vehicles back into work area)
  - Number of flaggers (if yes)
- **Vehicle positioning**
  - Number of vehicles staging on/near roadway
  - Vehicles create moving hazard (Yes/No)

### MUTCD Impact
- Worker count affects buffer space requirements
- Work zone dimensions determine sign placement distances
- Spotter requirement triggers additional signage
- Vehicle count affects advance warning sign needs
- Vehicles on shoulder require specific warning signs

---

## Step 4: Equipment Selection

### Equipment Categories
Users can select multiple items across categories:

#### Utility Vehicles
- Bucket trucks (specify boom height)
- Digger derricks
- Utility trucks with equipment racks
- Service vans

#### Heavy Equipment (if work extensive)
- Excavators (for underground utilities)
- Boring machines
- Trenchers
- Backhoes

#### Specialized Equipment
- Pole trailers
- Cable reels
- Generator trailers
- Material handling equipment

#### Traffic Safety Equipment
- Arrow boards (recommended)
- Truck-mounted attenuators (recommended for high-speed roads)
- Advance warning vehicles
- High-level warning devices (flag trees)

#### Light/Hand Tools Only
- No equipment checkbox

### UI Design
- Visual icons for each equipment type
- Multi-select interface
- **Bucket truck boom height** input if selected (affects overhead clearance)
- Traffic safety equipment section highlighted/recommended
- Each selection shows space requirements
- Real-time calculation of staging area needed

### MUTCD Impact
- Bucket trucks with extended booms may require lane closure
- Large equipment may require shoulder closure even for off-road work
- Traffic attenuator strongly recommended if staging on shoulder
- Arrow board required if shoulder is used and speed ≥ 45 mph
- Equipment extending over travel lane requires specific signage

---

## Step 5: Generation Page

### Loading State
- Progress indicator showing:
  - "Analyzing work location..."
  - "Determining staging requirements..."
  - "Calculating buffer zones..."
  - "Evaluating sign placement..."
  - "Generating MUTCD-compliant plan..."

### Processing
System uses collected data to:
1. Determine if shoulder closure needed (based on staging location)
2. Calculate advance warning distances
3. Determine buffer space from travel lanes
4. Generate required sign list with specific placement
5. Evaluate need for positive protection devices
6. Create work zone configuration diagram
7. Calculate sight distance requirements
8. Apply state-specific variations if applicable
9. Calculate overall plan confidence score

### Special Roadside Work Calculations
- Minimum buffer from travel lane edge: 2 feet
- Advance warning based on approach speed and sight distance
- Shoulder taper calculations if shoulder closure required
- Sign placement considering work extends beyond normal view
- Vehicle positioning to maximize worker protection

---

## Results Page

### Plan Summary Display
- **Plan confidence score** (weighted average of all data sources)
- **Quick summary card:**
  - Road name and location
  - Work side (left/right/both)
  - Staging location type
  - Work zone extent
  - Equipment summary
  - Lane/shoulder closure status

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
  - Staging area configuration
  - Work area boundary
  - Buffer zones
  - Vehicle positioning
  - Equipment placement zones
  - Advance warning area
- Aerial view option (work area + road context)
- Zoom and pan capabilities
- Print-friendly layout

---

## Data Validation Rules

### Step 1
- Pin must be dropped on map
- Work side must be selected
- Staging location must be specified
- If linear work, line must be at least 50 feet
- Work extent must be at least 5 feet

### Step 2
- Duration must be specified
- Time of day must be selected
- If intermittent access, frequency must be specified

### Step 3
- Worker count must be at least 1
- If flaggers required, count must be at least 1
- If spotter required, must have at least 2 workers total

### Step 4
- At least one equipment type OR "hand tools only" must be selected
- If bucket truck selected, boom height must be specified

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

### Location Ambiguity
- If pin dropped far from roadway (>100 feet):
  - Confirm with user: "Work location is X feet from nearest road. Is this correct?"
  - Offer to snap to nearest roadway if < 500 feet away

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

### Pin Dropping
- Long-press to drop pin
- Drag pin to adjust position
- Double-tap to confirm placement
- Visual feedback showing pin drop area

### Work Extent Adjustment
- Touch-friendly slider for distance from road
- Visual preview updates in real-time
- Preset buttons for common distances (10ft, 15ft, 25ft, 50ft)

### Linear Work Drawing
- Touch-and-drag from pin to draw line
- Snap to road alignment
- Undo last segment button
- Length displayed in real-time

---

## Roadside Work Specific Features

### Automatic Hazard Detection
- System flags potential hazards:
  - Curve within 500 feet of work location
  - Crest vertical curve limiting sight distance
  - High-speed roadway (≥55 mph) with shoulder staging
  - Night work with inadequate lighting

### Safety Recommendations
- System automatically recommends:
  - **Traffic attenuator** if staging on shoulder and speed ≥ 45 mph
  - **Arrow board** if shoulder staging and speed ≥ 45 mph
  - **Spotter** if vehicles backing toward roadway
  - **Advance warning vehicle** if intermittent access on high-speed road
  - **High-level warning device** if work extends >25 feet from road

### Sign Sequence Optimization
- Uses "UTILITY WORK AHEAD" or "MAINTENANCE WORK AHEAD" signs
- Adjusts for work beyond normal sight line
- Includes "SHOULDER CLOSED" if applicable
- May include "TRUCKS ENTERING HIGHWAY" if access road used

### Work Types Supported
- **Utility pole work** (single location)
- **Underground utility installation** (linear)
- **Sign installation/maintenance** (single or multiple locations)
- **Guardrail work** (linear)
- **Drainage work** (linear or point)
- **Vegetation management** (linear)
- **Cable/fiber installation** (linear)

---

## Success Metrics

- Plan generation time: < 30 seconds
- Data confidence average: > 90%
- User override rate: < 20% of fields
- Completion rate (Step 1 to Results): > 85%
- Pin placement accuracy: Within 20 feet of actual work location
- Linear work distance accuracy: ±10%
