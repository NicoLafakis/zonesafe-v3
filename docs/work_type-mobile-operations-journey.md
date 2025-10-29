# ZoneSafe User Journey: Mobile Operations

## Work Type Classification
**Mobile Operations** - Moving work (striping, mowing, patching)

---

## Journey Overview
5-step wizard process culminating in MUTCD-compliant plan generation

---

## Step 1: Location & Route Characteristics

### User Actions
1. User draws route/path on map showing mobile operation path
2. User specifies operation type
3. System retrieves and displays road data along route

### Data Collection
- **Road name(s)** (editable - may span multiple roads)
- **Route start address** (closest address/mile marker to start point)
- **Route end address** (closest address/mile marker to end point)
- **Route length (miles)** (auto-calculated)
- **Average speed limit along route** (calculated, editable with confidence badge)
- **Road type** (detected for each segment)
  - Urban street
  - Rural highway
  - Expressway/freeway
  - Mixed (multiple types)
- **Lane count** (detected, shows range if varies along route)
- **Operation type** (user selects)
  - Striping/pavement marking
  - Crack sealing
  - Pothole patching
  - Shoulder mowing
  - Sweeping
  - Debris removal
  - Other mobile maintenance
- **Operation location**
  - Center of roadway
  - Edge line/shoulder
  - Multiple lanes
  - Median
- **Traffic control method**
  - Shadow vehicle with arrow board
  - Rolling roadblock
  - Lane closure (moving with operation)
  - Shoulder operation only

### Data Sources & Confidence Weighting
| Source | Confidence | Use Case |
|--------|-----------|----------|
| Google Roads API | 100% | Speed limit, road snapping |
| HERE Maps API | 95% | Lane count, road classification |
| OpenStreetMap | 75% | Fallback data |
| AI + .gov sources | 100% | Web-scraped government data |
| AI + other web sources | 90% | General web search results |
| User manual override | 100% | User edits any field |

### Data Structure
```typescript
interface MobileOperationData {
  roadNames: string[];
  routeStartAddress: string;
  routeEndAddress: string;
  routeLengthMiles: number;
  averageSpeedLimit: number;
  speedLimitRange: { min: number; max: number };
  roadTypes: ('urban' | 'rural' | 'expressway' | 'mixed')[];
  laneCountRange: { min: number; max: number };
  operationType: 'striping' | 'crack-sealing' | 'patching' | 'mowing' | 'sweeping' | 'debris-removal' | 'other';
  operationLocation: 'center' | 'edge-line' | 'multi-lane' | 'median' | 'shoulder';
  trafficControlMethod: 'shadow-vehicle' | 'rolling-roadblock' | 'moving-closure' | 'shoulder-only';
  directionOfTravel: 'northbound' | 'southbound' | 'eastbound' | 'westbound' | 'both-directions';
  userModified: boolean;
}
```

### UI Behavior
- Map shows instruction: "Draw route of mobile operation"
- Route drawing interface with waypoints
- After route drawn, operation type selector appears
- Page scrolls to reveal route data and speed limit variations
- Visual preview shows operation moving along route
- All editable fields show confidence badges
- If route crosses multiple road types, segments shown separately

### Map Interaction Specifics
- **Route drawing:** User places waypoints, system connects with road-snapped path
- **Visual overlay:** Route highlighted with direction arrows
- **Segment indicators:** Different colors for varying speeds/road types
- **Distance markers:** Mile markers shown along route

---

## Step 2: Work Timing & Duration

### Data Collection
- **Operation duration**
  - Hours to complete (1-24)
  - Days (if multi-day operation)
- **Time of day**
  - Daytime only
  - Nighttime only
  - 24-hour operation
- **Days of week**
  - Weekdays only
  - Weekends only
  - All days
- **Operating speed**
  - Speed of mobile operation (mph): User input
  - Typical range: 3-25 mph depending on operation
- **Number of passes**
  - Single pass
  - Multiple passes (specify number)
  - Return trip (Yes/No)
- **Start time** (specific time for coordination)
- **Traffic conditions during operation**
  - Peak hours
  - Off-peak hours
  - Night (minimal traffic)

### MUTCD Impact
- Nighttime operations require enhanced vehicle lighting
- Operating speed determines shadow vehicle spacing
- Multiple passes may require different traffic control each pass
- Peak hour operations may be prohibited or restricted
- Duration affects sign posting requirements (short-duration procedures may apply)

---

## Step 3: Work Zone Details

### Data Collection
- **Number of vehicles in operation**
  - Lead vehicle/work vehicle: 1 (required)
  - Shadow vehicles: 0-3
  - Support vehicles: 0-5
- **Vehicle configuration**
  - Convoy length (feet): Auto-calculated from vehicle count
  - Spacing between vehicles: User input (default based on speed)
- **Number of workers**
  - In/on vehicles: Count
  - On foot: Count (if any)
  - Flaggers: Count (if stationary control points needed)
- **Advance warning vehicle**
  - Required: Yes/No (system recommends for high-speed)
  - Distance ahead of operation: Auto-calculated, editable
- **Shadow vehicle(s)**
  - Number: 1-3
  - Distance behind work vehicle: Auto-calculated based on speed
  - Arrow board equipped: Yes (required) / No
- **Buffer space requirements**
  - Lateral buffer from operation: Auto-calculated
  - Merge taper if lane closure: Auto-calculated

### MUTCD Impact
- Shadow vehicle required for most mobile lane closures
- Advance warning vehicle recommended for speeds ≥45 mph
- Multiple shadow vehicles for high-speed or multi-lane operations
- Worker on foot requires additional buffer and control
- Convoy length affects traffic flow and following distance

---

## Step 4: Equipment Selection

### Equipment Categories
Users can select multiple items across categories:

#### Mobile Work Vehicles
- Striping truck
- Crack sealing truck
- Pothole patcher
- Mower (tractor or truck-mounted)
- Street sweeper
- Vacuum truck
- Line removal truck
- Attenuator truck (work vehicle)

#### Shadow/Support Vehicles
- Truck-mounted attenuator (TMA)
- Pickup truck with arrow board
- Dump truck (material transport)
- Water truck
- Support/supervisor vehicle

#### Traffic Control Equipment (Required)
- Arrow boards (specify: truck-mounted or portable)
  - Type B (intermediate) - typical
  - Type C (large) - high-speed operations
  - Type D (arrow shape) - authorized vehicles
- High-intensity warning lights
- Advance warning vehicle with signs
- Flashing warning lights (amber)
- Message board (optional)

#### Specialized Equipment
- Paint/thermoplastic applicator
- Bead dispenser (striping)
- Crack router
- Infrared heater (patching)
- Debris collection system

### UI Design
- Visual icons for each vehicle/equipment type
- Vehicle configuration diagram showing convoy layout
- Arrow board selection with type recommendations
- Real-time convoy length calculation
- Each selection shows spacing requirements
- Warning if configuration unsafe for speed/road type

### MUTCD Impact
- Arrow board required for mobile lane closures
- Truck-mounted attenuator strongly recommended for high-speed
- Advance warning vehicle triggers specific sign sequence
- Equipment size determines lateral buffer requirements
- Multiple vehicles require convoy spacing calculations

---

## Step 5: Generation Page

### Loading State
- Progress indicator showing:
  - "Analyzing route characteristics..."
  - "Calculating vehicle spacing..."
  - "Determining advance warning requirements..."
  - "Evaluating shadow vehicle placement..."
  - "Generating MUTCD-compliant plan..."

### Processing
System uses collected data to:
1. Calculate shadow vehicle distance (4-second following distance at operating speed)
2. Calculate advance warning vehicle distance (typically 8× speed limit in feet)
3. Determine sign placement along route (portable/truck-mounted)
4. Generate vehicle configuration diagram
5. Calculate buffer space requirements
6. Determine arrow board flash pattern and placement
7. Calculate convoy length and impact on traffic
8. Apply mobile operation-specific MUTCD requirements
9. Generate operation timing estimates
10. Calculate overall plan confidence score

### Special Mobile Operation Calculations
- Shadow vehicle distance: Operating speed (mph) × 4 seconds
- Advance warning distance: Speed limit (mph) × 8 feet
- Lateral buffer: Based on operating speed and equipment width
- Arrow board flash rate: 55-75 flashes per minute (sequential)
- Minimum convoy spacing for visibility and safety

---

## Results Page

### Plan Summary Display
- **Plan confidence score** (weighted average of all data sources)
- **Quick summary card:**
  - Route summary (start to end)
  - Route length (miles)
  - Operation type
  - Estimated completion time
  - Vehicle count and configuration
  - Traffic control method

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
  - Route map with operation path
  - Vehicle configuration (convoy layout)
  - Shadow vehicle positioning
  - Advance warning vehicle location
  - Arrow board placement and flash pattern
  - Sign placement (if stationary signs needed)
  - Buffer zones along route
  - Equipment specifications
- Animation showing mobile operation in motion
- Time-lapse view of operation progress
- Print-friendly layout with vehicle spacing diagrams

---

## Data Validation Rules

### Step 1
- Route must be at least 0.25 miles
- Operation type must be selected
- Operation location must be specified
- Traffic control method must be selected

### Step 2
- Operation duration must be specified
- Operating speed must be specified (3-25 mph typical)
- Time of day must be selected
- Operating speed must be < speed limit - 10 mph

### Step 3
- At least 1 work vehicle required
- Shadow vehicle required if lane closure operation
- Worker count must be at least 1
- Vehicle spacing must be specified

### Step 4
- At least one work vehicle must be selected
- Arrow board required for lane closure operations
- If high-speed operation (≥45 mph), TMA strongly recommended

---

## Error Handling

### API Failures
1. Try Google Roads API first for route segments
2. If fails, try HERE Maps API
3. If fails, try OpenStreetMap
4. If all fail, engage AI model with web search
5. If AI search fails, require manual input per segment

### Low Confidence Scenarios
- Display warning banner: "Route data incomplete. Please verify all fields carefully."
- Highlight low-confidence fields in yellow
- Require user to acknowledge before proceeding
- Flag route segments with varying speeds/geometries

### Route Drawing Issues
- If route >50 miles: Warn about long-duration operation, suggest segmenting
- If route crosses multiple jurisdictions: Flag for permit requirements
- If route includes freeway: Require advance warning vehicle confirmation

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

### Route Drawing
- Touch-friendly waypoint placement
- Drag waypoints to adjust route
- Pinch to zoom along route
- "Undo last waypoint" button
- Snap-to-road with visual feedback

### Vehicle Configuration
- Swipeable vehicle cards to add/remove
- Drag vehicles to reorder in convoy
- Visual spacing preview with touch sliders

### Operation Speed Input
- Slider with common speed presets
- Visual indicator showing speed vs. speed limit

---

## Mobile Operations Specific Features

### Automatic Hazard Detection
- System flags potential hazards:
  - High-speed route segments (≥55 mph)
  - Sharp curves along route
  - Vertical curves limiting sight distance
  - School zones along route
  - Heavy traffic corridors
  - Tunnels or bridges requiring special procedures
  - Work zones or construction along route

### Safety Recommendations
- System automatically recommends:
  - **Truck-mounted attenuator** if speed limit ≥45 mph
  - **Advance warning vehicle** if speed limit ≥45 mph or route >5 miles
  - **Multiple shadow vehicles** if multi-lane operation or speed ≥60 mph
  - **Police escort** if full lane closure on freeway during peak hours
  - **Night operation** for striping work (less traffic disruption)
  - **Flashing lights on all vehicles** (minimum Type B warning lights)

### Vehicle Spacing Calculations
- **Shadow vehicle distance:** 
  - Formula: Operating speed (mph) × 1.47 × 4 seconds
  - Example: 15 mph operation = 88 feet behind
- **Advance warning vehicle distance:**
  - Formula: Speed limit (mph) × 8 feet
  - Example: 55 mph road = 440 feet ahead
- **Convoy spacing:**
  - Minimum 50 feet between vehicles in convoy
  - Maximum based on maintaining visual continuity

### Arrow Board Requirements
- **Type:** Type B for most operations, Type C for high-speed
- **Mode:** Sequential arrow/chevron (pointing around operation)
- **Flash rate:** 55-75 flashes per minute
- **Placement:** On shadow vehicle, visible from 0.75-1.0 miles
- **Dimming:** 50% nighttime dimming required

### Sign Requirements for Mobile Operations
- "ROAD WORK AHEAD" on advance warning vehicle
- "SHOULDER WORK" (if shoulder only operation)
- Operating speed differential sign (optional): "SLOW MOVING VEHICLE"
- Supplemental distance plaque (optional): "1 MILE" on advance vehicle

### Operation Types Supported

#### Striping/Pavement Marking
- Operating speed: 3-8 mph
- Typical configuration: Work truck + shadow vehicle with TMA
- Peak traffic avoidance: Strongly recommended
- Nighttime operation: Preferred

#### Crack Sealing
- Operating speed: 2-5 mph
- Typical configuration: Crack sealing truck + shadow vehicle
- Lane closure: Usually required
- Best conditions: Dry, warm weather

#### Pothole Patching
- Operating speed: 5-15 mph (intermittent stops)
- Typical configuration: Patcher truck + material truck + shadow vehicle
- Multiple passes: Often required
- Traffic control: Shadow vehicle with arrow board

#### Shoulder Mowing
- Operating speed: 5-12 mph
- Typical configuration: Mower + shadow vehicle (if high-speed road)
- Shoulder closure: Typically yes
- Lane closure: Usually not required

#### Sweeping
- Operating speed: 8-15 mph
- Typical configuration: Sweeper alone (low-speed) or with shadow vehicle (high-speed)
- Lane closure: Depends on debris type and road speed
- Multiple passes: Common

### Coordination Requirements
- **Law enforcement notification:** 24-48 hours advance for freeway work
- **Traffic management center:** Real-time updates for freeway operations
- **Adjacent jurisdiction notification:** If route crosses boundaries
- **Emergency services notification:** If route affects response times
- **Media notification:** For large-scale or extended operations

### Weather Considerations
- **Striping:** Cannot operate in rain, temperature <50°F typically
- **Crack sealing:** Requires dry conditions, optimal temps 70-90°F
- **Mowing:** Avoid wet grass (clumping/slipping)
- **All operations:** High wind affects traffic control devices

---

## Success Metrics

- Plan generation time: < 40 seconds
- Data confidence average: > 88%
- User override rate: < 25% of fields
- Completion rate (Step 1 to Results): > 80%
- Route distance accuracy: ±5%
- Vehicle spacing accuracy: ±10 feet
