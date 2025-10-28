# ZoneSafe User Journey: Intersection Work

## Work Type Classification
**Intersection Work** - Work at or through intersections

---

## Journey Overview
5-step wizard process culminating in MUTCD-compliant plan generation

---

## Step 1: Location & Intersection Characteristics

### User Actions
1. User clicks/taps on intersection center on map
2. System identifies intersection and all approaches
3. User selects which approaches/legs are affected by work
4. User specifies work location within intersection

### Data Collection
- **Intersection name/ID** (editable)
- **Primary street name** (editable)
- **Cross street name** (editable)
- **Intersection address** (closest address or coordinates)
- **Intersection type** (detected, user can override)
  - 4-way intersection
  - T-intersection
  - Y-intersection
  - Roundabout
  - Multi-leg (>4 approaches)
- **Traffic control present** (detected, user can override)
  - Traffic signal
  - Stop signs (all-way, two-way)
  - Yield signs
  - Uncontrolled
  - Roundabout
- **Approach selection** (visual interface showing all legs)
  - User selects affected approach(es)
  - For each selected: North/South/East/West identification
  - Lane count per approach (editable, with confidence badge)
  - Speed limit per approach (editable, with confidence badge)
- **Work location within intersection**
  - Center of intersection
  - Specific approach(es)
  - Through intersection (affects multiple approaches)
  - Turn lanes only
  - Crosswalk/pedestrian area
- **Lane closures per approach**
  - Visual lane selector for each affected approach
  - Through lanes
  - Turn lanes (left/right)
  - All lanes (approach closed)

### Data Sources & Confidence Weighting
| Source | Confidence | Use Case |
|--------|-----------|----------|
| Google Roads API | 100% | Speed limit, road snapping |
| HERE Maps API | 95% | Intersection geometry, lane counts |
| OpenStreetMap | 85% | Intersection type, traffic control |
| AI + .gov sources | 100% | Web-scraped government data |
| AI + other web sources | 90% | General web search results |
| User manual override | 100% | User edits any field |

### Data Structure
```typescript
interface IntersectionWorkData {
  primaryStreet: string;
  crossStreet: string;
  intersectionAddress: string;
  intersectionType: '4-way' | 't-intersection' | 'y-intersection' | 'roundabout' | 'multi-leg';
  trafficControl: 'signal' | 'all-way-stop' | 'two-way-stop' | 'yield' | 'uncontrolled' | 'roundabout';
  approaches: {
    direction: 'north' | 'south' | 'east' | 'west' | string;
    affected: boolean;
    laneCount: number;
    speedLimit: number;
    closedLanes: number[];
    hasTurnLanes: boolean;
    leftTurnLanes?: number;
    rightTurnLanes?: number;
  }[];
  workLocation: 'center' | 'approach' | 'through' | 'turn-lanes' | 'crosswalk';
  pedestrianFacilitiesPresent: boolean;
  bicycleFacilitiesPresent: boolean;
  sightDistanceRestricted: boolean;
  userModified: boolean;
}
```

### UI Behavior
- Map shows intersection with clear visual overlay
- After intersection selected, all approaches display with directional labels
- User taps/clicks approaches to select (affected approaches highlight in orange)
- Work location selector appears (visual diagram of intersection)
- For each affected approach, lane selector appears
- Traffic control type auto-detected, shown with icon
- Pedestrian crosswalks shown if detected
- All editable fields show confidence badges

### Map Interaction Specifics
- **Click on intersection:** System snaps to nearest intersection
- **Visual overlay:** Shows intersection geometry with all legs
- **Approach selector:** Tap each leg to mark as affected
- **Work area preview:** Shaded area shows extent of work zone

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
- **Peak hour considerations**
  - Allow work during peak hours: Yes/No
  - If No: Specify restricted hours (default: 7-9 AM, 4-7 PM)
- **Traffic signal timing**
  - Signal remains operational
  - Signal requires timing adjustment
  - Temporary signal needed
  - Signal will be dark/covered

### MUTCD Impact
- Nighttime work requires additional lighting and reflectorization
- Peak hour closures trigger queue length warnings
- Signal timing adjustments require coordination with traffic engineering
- Duration affects temporary vs permanent sign specifications
- Long-term work may require signal modifications

---

## Step 3: Work Zone Details

### Data Collection
- **Number of workers** (1-50+)
- **Work zone dimensions**
  - Width: Auto-calculated based on lane closures, editable
  - Length: Auto-calculated based on intersection size, editable
  - Height: (if overhead work) specify in feet
- **Traffic control personnel**
  - Flaggers required: Yes/No
  - Number of flaggers (if yes) - minimum 2 for intersection control
  - Police control recommended: Yes/No (system recommends for complex closures)
- **Pedestrian accommodations**
  - Crosswalks remain open
  - Crosswalks closed with detour
  - Detour length (if closed): Auto-estimated, editable
  - Accessible route maintained: Yes/No/NA
- **Turn restrictions during work**
  - Prohibit left turns: specify which approaches
  - Prohibit right turns: specify which approaches
  - All turns prohibited (straight through only)
- **Sight distance concerns**
  - Work obstructs sight lines: Yes/No
  - Additional advance warning needed: Yes/No

### MUTCD Impact
- Worker count affects buffer space requirements
- Intersection work requires sight distance triangle maintenance
- Turn restrictions require specific regulatory signs
- Pedestrian detours must maintain ADA compliance
- Multiple flaggers needed for multi-approach control
- Police control often required for major urban intersections

---

## Step 4: Equipment Selection

### Equipment Categories
Users can select multiple items across categories:

#### Heavy Machinery
- Excavators
- Pavers
- Milling machines
- Concrete saws (large)
- Compaction equipment

#### Medium Equipment
- Skid steers
- Small concrete saws
- Jackhammers
- Manhole equipment

#### Vehicles
- Dump trucks
- Concrete trucks
- Utility trucks
- Vacuum trucks (for utility work)

#### Traffic Control Devices
- Arrow boards (specify quantity if multiple approaches)
- Temporary traffic signals
- Portable signal systems
- Message boards
- Truck-mounted attenuators

#### Overhead Work Equipment
- Bucket trucks
- Cranes
- Signal maintenance lifts

#### Light/Hand Tools Only
- No equipment checkbox

### UI Design
- Visual icons for each equipment type
- Multi-select interface
- **Traffic control devices section** prominently displayed
- Arrow board quantity selector
- Overhead equipment triggers clearance warnings
- Each selection shows space requirements within intersection
- Real-time calculation of work zone capacity

### MUTCD Impact
- Heavy equipment determines minimum work zone size
- Overhead work may require full intersection closure
- Multiple arrow boards needed for multi-approach closures
- Temporary signals require electrical permitting
- Equipment blocking sight lines requires additional signage
- Truck positioning affects traffic flow pattern

---

## Step 5: Generation Page

### Loading State
- Progress indicator showing:
  - "Analyzing intersection geometry..."
  - "Calculating sight distance triangles..."
  - "Evaluating approach tapers..."
  - "Determining signal impacts..."
  - "Calculating pedestrian detours..."
  - "Generating MUTCD-compliant plan..."

### Processing
System uses collected data to:
1. Calculate taper lengths for each affected approach
2. Determine advance warning distances for all approaches
3. Calculate sight distance requirements
4. Generate required sign list with specific placement per approach
5. Evaluate turn restrictions and signage needed
6. Create pedestrian detour routes if needed
7. Determine flagger positions for intersection control
8. Calculate signal timing impacts
9. Apply state-specific intersection regulations
10. Calculate overall plan confidence score

### Special Intersection Work Calculations
- Sight distance triangle maintenance per MUTCD
- Taper calculations for each approach independently
- Turn lane taper requirements if turn lanes affected
- Advance warning spacing adjusted for approach speeds
- Queue length estimation for capacity reduction
- Pedestrian crossing time calculations if crosswalks affected

---

## Results Page

### Plan Summary Display
- **Plan confidence score** (weighted average of all data sources)
- **Quick summary card:**
  - Intersection name (streets)
  - Affected approaches (N/S/E/W)
  - Date range
  - Lane closures per approach
  - Turn restrictions
  - Traffic control type
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
  - Overhead view of intersection
  - Sign placement on all approaches with distances
  - Lane closure configuration per approach
  - Taper dimensions for each approach
  - Work zone boundary
  - Buffer zones
  - Flagger station locations
  - Pedestrian detour routes
  - Equipment placement zones
  - Sight distance triangles
- 3D view option for complex intersections
- Per-approach detail view
- Zoom and pan capabilities
- Print-friendly layout
- Turn restriction diagrams

---

## Data Validation Rules

### Step 1
- Intersection must be selected
- At least one approach must be marked as affected
- If lane closures specified, at least one lane per affected approach
- Traffic control type must be selected
- Work location must be specified

### Step 2
- Duration must be specified
- Time of day must be selected
- If signal timing adjustment selected, must provide justification

### Step 3
- Worker count must be at least 1
- If flaggers required, minimum 2 for intersection control
- If pedestrian crosswalks closed, detour must be specified
- If turn restrictions, at least one approach must have restriction

### Step 4
- At least one equipment type OR "hand tools only" must be selected
- If temporary signal selected, must have qualified technician noted

---

## Error Handling

### API Failures
1. Try Google Roads API first for each approach
2. If fails, try HERE Maps API
3. If fails, try OpenStreetMap
4. If all fail, engage AI model with web search
5. If AI search fails, require manual input per approach

### Low Confidence Scenarios
- Display warning banner: "Some data sources unavailable. Please verify all fields carefully."
- Highlight low-confidence fields in yellow
- Require user to acknowledge before proceeding
- Flag intersections with unusual geometry (>4 legs, skewed angles)

### Intersection Detection Issues
- If click location is >100 feet from known intersection:
  - Confirm: "No intersection detected. Proceed with manual entry?"
  - Allow user to define custom intersection
- If multiple intersections within 50 feet:
  - Show list of candidates
  - User selects correct one

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

### Intersection Selection
- Tap and hold on intersection
- Visual confirmation with highlight
- Zoom in automatically to show detail

### Approach Selection
- Large touch targets for each approach leg
- Visual feedback (orange highlight) on selection
- Swipe to rotate view for better visibility
- Approach labels always readable

### Lane Selection per Approach
- Expandable panel for each affected approach
- Large touch targets for lane selection (min 44px)
- Visual preview of lane closures

---

## Intersection Work Specific Features

### Automatic Hazard Detection
- System flags potential hazards:
  - High-volume intersection (suggests peak hour restrictions)
  - School zone within 500 feet
  - Hospital/emergency services nearby
  - Transit stop at intersection
  - High pedestrian volume
  - Bike lanes present
  - Skewed intersection angle (<60° or >120°)

### Safety Recommendations
- System automatically recommends:
  - **Police control** if all approaches >2 lanes or peak hour work
  - **Multiple arrow boards** if >2 approaches affected
  - **Temporary signal** if existing signal must be dark >1 hour
  - **Advanced warning signs** on all approaches, even unaffected
  - **Pedestrian channelizing devices** if crosswalks remain open through work
  - **Night lighting** if work zone obstructs existing intersection lighting

### Turn Movement Analysis
- Calculates impact of turn restrictions on:
  - Traffic patterns
  - Detour routes
  - Emergency vehicle access
  - Transit routes
- Suggests optimal restriction combination to maintain access

### Sign Sequence Optimization
- Generates approach-specific sign plans
- Accounts for different speeds on each approach
- Adjusts spacing for available sight distance
- Coordinates signs across all approaches for consistency
- Includes turn restriction signage placement

### Pedestrian Detour Planning
- Auto-generates detour routes maintaining:
  - ADA compliance (max 8.33% slope)
  - Maximum detour distance <1,200 feet
  - Crosswalk spacing <500 feet
  - Accessible surface requirements
- Provides detour signage specifications

### Work Types Supported
- **Intersection resurfacing** (full closure possible)
- **Signal work** (overhead, cabinet, detection)
- **Utility work at intersection** (manholes, vaults)
- **Turn lane construction/modification**
- **Curb ramp installation** (ADA upgrades)
- **Intersection geometry changes**
- **Drainage work**
- **Median installation/removal**

---

## Success Metrics

- Plan generation time: < 45 seconds (longer due to complexity)
- Data confidence average: > 88%
- User override rate: < 25% of fields
- Completion rate (Step 1 to Results): > 75%
- Intersection detection accuracy: >95%
- Approach identification accuracy: >90%
