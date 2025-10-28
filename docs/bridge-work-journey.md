# ZoneSafe User Journey: Bridge Work

## Work Type Classification
**Bridge Work** - Work on bridge structures

---

## Journey Overview
5-step wizard process culminating in MUTCD-compliant plan generation

---

## Step 1: Location & Bridge Characteristics

### User Actions
1. User draws line segment on map along bridge structure
2. System detects bridge and retrieves bridge data
3. User confirms or manually identifies as bridge work
4. System displays bridge-specific characteristics

### Data Collection
- **Bridge name/ID** (editable)
- **Road name** (editable)
- **Bridge location address** (closest address or mile marker)
- **Bridge length (feet)** (detected, editable with confidence badge)
- **Bridge width (feet)** (detected, editable with confidence badge)
- **Structure type** (detected, user can override)
  - Overpass (road over road/rail)
  - River/water crossing
  - Canyon/ravine crossing
  - Viaduct/elevated structure
- **Number of spans** (detected, editable)
- **Deck type** (detected, user can override)
  - Concrete
  - Steel grid
  - Asphalt over concrete
  - Other
- **Bridge features**
  - Sidewalks present: Yes/No
  - Bicycle lanes present: Yes/No
  - Shoulders present: Yes/No
  - Barrier type: Concrete/Steel/Cable/None
- **Vertical clearance (feet)** (if overpass)
  - Current clearance (detected)
  - Will clearance be reduced during work: Yes/No
  - Temporary clearance if reduced
- **Speed limit** (editable, with confidence badge)
- **Lane count** (editable, with confidence badge)
- **Lane selection** - Visual interface showing lanes on bridge
  - User selects which lanes will be closed/impacted
  - Selected lanes highlight in orange
- **Work location on bridge**
  - Deck surface
  - Structural elements (girders, bearings)
  - Barrier/railing
  - Underneath (access from below)
  - Overhead (lighting, signs)
  - Multiple areas (select all that apply)

### Data Sources & Confidence Weighting
| Source | Confidence | Use Case |
|--------|-----------|----------|
| Google Roads API | 100% | Speed limit, road snapping |
| HERE Maps API | 95% | Lane count, road geometry |
| OpenStreetMap | 85% | Bridge identification, length |
| National Bridge Inventory (NBI) | 100% | Bridge specs, clearances |
| AI + .gov sources | 100% | Web-scraped government data |
| State DOT databases | 100% | Bridge condition, restrictions |
| AI + other web sources | 90% | General web search results |
| User manual override | 100% | User edits any field |

### Data Structure
```typescript
interface BridgeWorkData {
  bridgeName: string;
  bridgeID?: string; // NBI number if available
  roadName: string;
  bridgeLocation: string;
  lengthFeet: number;
  widthFeet: number;
  structureType: 'overpass' | 'water-crossing' | 'canyon' | 'viaduct';
  spanCount: number;
  deckType: 'concrete' | 'steel-grid' | 'asphalt-concrete' | 'other';
  verticalClearanceFeet?: number; // For overpasses
  clearanceReduced: boolean;
  temporaryClearanceFeet?: number;
  speedLimit: number;
  laneCount: number;
  closedLanes: number[];
  hasSidewalks: boolean;
  hasBikeLanes: boolean;
  hasShoulders: boolean;
  barrierType: 'concrete' | 'steel' | 'cable' | 'none';
  workLocation: ('deck' | 'structural' | 'barrier' | 'underneath' | 'overhead')[];
  loadRating?: string; // If available from NBI
  userModified: boolean;
  direction: 'northbound' | 'southbound' | 'eastbound' | 'westbound' | 'bidirectional';
}
```

### UI Behavior
- Map shows bridge structure highlighted after line drawn
- Bridge detection confirmation: "Bridge detected. Confirm bridge work?"
- If confirmed, page scrolls to reveal bridge-specific data
- Bridge cross-section diagram shows lanes, sidewalks, barriers
- Work location selector with visual bridge diagram
- All editable fields show confidence badges with data sources
- NBI data shown in separate info panel if available

### Map Interaction Specifics
- **Line drawing:** Snaps to bridge structure alignment
- **Visual overlay:** Bridge highlighted in distinct color
- **Length calculation:** Auto-measured from drawn segment
- **Approach areas:** Shows bridge approaches for sign placement

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
- **Bridge closure type**
  - Full closure (all traffic detoured)
  - Partial closure (lane closures only)
  - Alternating single lane (one-way traffic control)
  - Off-peak closures only
- **Emergency access**
  - Must maintain emergency vehicle access: Yes/No
  - Fire/EMS routes affected: Yes/No

### MUTCD Impact
- Nighttime work requires enhanced lighting on bridge deck
- Full closure requires detour route planning and signage
- Long-term work may require temporary bridge/shoofly
- Duration affects load restriction signage requirements
- Emergency access requirements affect closure strategies

---

## Step 3: Work Zone Details

### Data Collection
- **Number of workers** (1-50+)
- **Work zone dimensions**
  - Length along bridge: Auto-filled from Step 1, editable
  - Width: Auto-calculated from lane closures, editable
  - Extends beyond bridge deck: Yes/No
- **Traffic control personnel**
  - Flaggers required: Yes/No
  - Number of flaggers (if yes)
  - Flagger stations on bridge: Yes/No
  - Police control needed: Yes/No
- **Temporary barriers**
  - Concrete barriers required: Yes/No
  - Barrier placement: Edge of work zone / Edge of lanes
  - Barrier tested for bridge deck: Yes/No (critical)
- **Load restrictions during work**
  - Weight restrictions needed: Yes/No
  - Maximum vehicle weight (tons): If restricted
  - Oversized vehicle restrictions: Yes/No
- **Access requirements**
  - Equipment access: On bridge deck / From below / From approaches
  - Crane/lift needed: Yes/No
  - Crane outrigger placement: On bridge / Off bridge
- **Pedestrian/bicycle accommodations**
  - If facilities present:
    - Facilities remain open
    - Facilities closed with detour
    - Detour length/route

### MUTCD Impact
- Temporary barriers must meet crash test standards for bridge installation
- Load restrictions require specific weight limit signage
- Flagger stations on bridge require careful sight distance calculation
- Equipment access affects approach taper requirements
- Crane operations may require full closure
- Pedestrian detours must account for bridge as only crossing

---

## Step 4: Equipment Selection

### Equipment Categories
Users can select multiple items across categories:

#### Heavy Machinery
- Bridge deck milling machines
- Pavers (overlay work)
- Concrete saws
- Excavators (if abutment work)
- Mobile cranes

#### Specialized Bridge Equipment
- Bridge inspection units (snooper trucks)
- Hydro-demolition equipment
- Bridge washing equipment
- Concrete pumps
- Deck finishing machines

#### Vehicles
- Dump trucks (specify max weight if load restricted)
- Concrete trucks
- Flatbed trucks (material delivery)
- Pickup trucks
- Utility trucks

#### Traffic Safety Equipment
- Arrow boards (required for lane closures)
- Truck-mounted attenuators
- Temporary concrete barriers (specify quantity)
- Portable lighting (for night work)
- Message boards

#### Structural Access Equipment
- Scaffolding/platforms (underneath access)
- Aerial lifts
- Rigging equipment

#### Light/Hand Tools Only
- No equipment checkbox

### UI Design
- Visual icons for each equipment type
- Multi-select interface
- **Equipment weight** input for load-restricted bridges
- Temporary barrier quantity calculator
- Each selection shows space requirements on bridge deck
- Real-time calculation of work zone capacity
- Warning if equipment weight exceeds bridge rating

### MUTCD Impact
- Heavy equipment determines minimum lane width requirements
- Crane operations require full closure or significant buffer
- Snooper truck operations affect approach sign placement
- Multiple trucks require staging area (on/off bridge)
- Temporary barriers affect usable bridge width
- Equipment on shoulders affects barrier placement

---

## Step 5: Generation Page

### Loading State
- Progress indicator showing:
  - "Analyzing bridge structure..."
  - "Checking load capacity requirements..."
  - "Calculating approach tapers..."
  - "Determining barrier placement..."
  - "Evaluating clearance restrictions..."
  - "Generating MUTCD-compliant plan..."

### Processing
System uses collected data to:
1. Calculate approach taper lengths (both ends of bridge)
2. Determine advance warning distances with bridge emphasis
3. Calculate buffer space requirements (2-foot minimum + bridge buffer)
4. Generate required sign list including bridge-specific signs
5. Evaluate temporary barrier specifications
6. Calculate load restriction signage if needed
7. Determine vertical clearance signage if reduced
8. Create bridge work zone configuration diagram
9. Calculate sight distance requirements on bridge
10. Apply state-specific bridge work regulations
11. Calculate overall plan confidence score

### Special Bridge Work Calculations
- Approach taper lengths for both bridge approaches
- Lateral buffer increased by 2 feet on bridge structures
- Sight distance accounting for bridge geometry
- Load restriction calculations and posting requirements
- Vertical clearance reduction signage and placement
- Temporary barrier anchorage requirements for bridge deck
- Emergency vehicle turnaround points if bridge closed

---

## Results Page

### Plan Summary Display
- **Plan confidence score** (weighted average of all data sources)
- **Quick summary card:**
  - Bridge name and location
  - Bridge length and structure type
  - Date range
  - Lane closures
  - Closure type (full/partial)
  - Load restrictions
  - Clearance changes
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
  - Bridge structure elevation view
  - Plan view (overhead) of bridge and approaches
  - Sign placement on both approaches with distances
  - Lane closure configuration on bridge
  - Approach taper dimensions (both ends)
  - Work zone boundary
  - Temporary barrier placement
  - Buffer zones
  - Equipment staging areas
  - Detour routes (if full closure)
- Side-by-side view: existing vs. work zone configuration
- 3D view option for complex work
- Load restriction signage details
- Zoom and pan capabilities
- Print-friendly layout

---

## Data Validation Rules

### Step 1
- Line segment must be at least 20 feet (bridge minimum)
- Bridge must be confirmed or manually identified
- At least one lane must be selected as closed OR full closure selected
- Work location must be specified
- If clearance reduced, temporary clearance must be < current clearance

### Step 2
- Duration must be specified
- Time of day must be selected
- Bridge closure type must be selected

### Step 3
- Worker count must be at least 1
- If flaggers on bridge, minimum 2 required
- If temporary barriers, must confirm crash-test certification
- If load restrictions, maximum weight must be specified

### Step 4
- At least one equipment type OR "hand tools only" must be selected
- If load-restricted, all equipment weights must be verified

---

## Error Handling

### API Failures
1. Try Google Roads API first
2. If fails, try HERE Maps API
3. If fails, try OpenStreetMap
4. Try National Bridge Inventory database
5. Try state DOT APIs
6. If all fail, engage AI model with web search
7. If AI search fails, require manual input

### Low Confidence Scenarios
- Display warning banner: "Bridge data incomplete. Please verify all fields carefully."
- Highlight low-confidence fields in yellow
- Require user to acknowledge before proceeding
- Flag bridges without NBI data for manual verification

### Bridge Detection Issues
- If drawn segment not identified as bridge:
  - Confirm: "No bridge detected. Is this bridge work?"
  - If yes, switch to manual bridge data entry
- If multiple bridges within 100 feet:
  - Show list of candidates with names
  - User selects correct one

### Load Rating Warnings
- If equipment weight > bridge load rating:
  - **Critical warning:** "Equipment exceeds bridge load capacity"
  - Require load analysis or equipment change
  - Option to consult structural engineer

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

### Bridge Drawing
- Touch-friendly line drawing along bridge
- Visual snap-to-bridge feedback
- Pinch to zoom for precise alignment
- Long-press to place start/end points

### Bridge Cross-Section View
- Rotatable view of bridge cross-section
- Touch to select lanes
- Swipe to show work location options

### Equipment Weight Entry
- Numeric keypad for weight entry
- Quick-select common equipment weights
- Visual indicator if weight exceeds capacity

---

## Bridge Work Specific Features

### Automatic Hazard Detection
- System flags potential hazards:
  - Bridge load rating < equipment weight
  - Vertical clearance reduced below 14 feet
  - Bridge on emergency vehicle route
  - Bridge is only crossing (no alternate route)
  - Historic bridge (special permits may be required)
  - Bridge in poor condition per NBI rating
  - Seismic region requirements

### Safety Recommendations
- System automatically recommends:
  - **Temporary barriers** for all bridge lane closures
  - **Enhanced lighting** if night work on bridge
  - **Load restrictions** if heavy equipment + bridge rating unknown
  - **Police control** for full bridge closures
  - **Arrow board** for all bridge lane closures
  - **Vertical clearance signage** if clearance reduced >6 inches
  - **Engineer review** if structural work or load concerns

### Bridge-Specific Sign Requirements
- "BRIDGE WORK AHEAD" signs on approaches
- "BRIDGE" advance warning signs
- Load restriction signs if weight limits imposed
- Vertical clearance signs if height reduced
- "NARROW BRIDGE" if lane width reduced
- "ROUGH ROAD" if deck irregularities

### Detour Route Planning
- For full closures, system identifies:
  - Nearest alternate bridge/crossing
  - Detour distance and route
  - Detour signage sequence
  - Emergency vehicle alternate routes
  - Oversized vehicle routing

### Work Types Supported
- **Deck overlay/resurfacing**
- **Deck replacement**
- **Bridge painting/coating**
- **Structural repairs** (girders, bearings, piers)
- **Barrier/railing replacement**
- **Expansion joint work**
- **Drainage improvements**
- **Bridge inspection/testing**
- **Seismic retrofitting**
- **Underwater inspection/repair** (from above)

### Load Analysis Integration
- Links to state DOT load rating databases
- Calculator for equipment load distribution
- Recommendations for load spreading (mats, etc.)
- Contact info for structural engineers if needed

---

## Success Metrics

- Plan generation time: < 45 seconds
- Data confidence average: > 85% (NBI data improves this)
- User override rate: < 30% of fields
- Completion rate (Step 1 to Results): > 70%
- Bridge detection accuracy: >85%
- Load restriction accuracy: >90% when NBI data available
