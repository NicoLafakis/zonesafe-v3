/**
 * PDF Generation Service for ZoneSafe Plans
 * Generates professional MUTCD safety plan PDFs
 */

import { jsPDF } from 'jspdf'
import { PlanDetail } from './api'

const PAGE_WIDTH = 210 // A4 width in mm
const PAGE_HEIGHT = 297 // A4 height in mm
const MARGIN = 20
const LINE_HEIGHT = 7

// ZoneSafe brand colors
const COLORS = {
  primary: '#FF4F0F',
  accent: '#FFDB4C',
  neutral: '#4E4B4B',
  lightGray: '#F5F5F5',
}

export const generatePlanPDF = async (plan: PlanDetail): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  let yPosition = MARGIN

  // Helper function to check page overflow
  const checkPageOverflow = (additionalHeight: number = LINE_HEIGHT) => {
    if (yPosition + additionalHeight > PAGE_HEIGHT - MARGIN) {
      doc.addPage()
      yPosition = MARGIN
      return true
    }
    return false
  }

  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    checkPageOverflow(15)
    doc.setFillColor(COLORS.primary)
    doc.rect(MARGIN, yPosition, PAGE_WIDTH - 2 * MARGIN, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(title, MARGIN + 3, yPosition + 7)
    yPosition += 15
    doc.setTextColor(COLORS.neutral)
  }

  // Helper function to add key-value pair
  const addKeyValue = (key: string, value: string) => {
    checkPageOverflow()
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${key}:`, MARGIN + 5, yPosition)
    doc.setFont('helvetica', 'normal')
    const keyWidth = doc.getTextWidth(`${key}: `)
    doc.text(value, MARGIN + 5 + keyWidth, yPosition)
    yPosition += LINE_HEIGHT
  }

  // Parse equipment and selected lanes
  const equipment = plan.equipment || []
  const selectedLanes = typeof plan.selected_lanes === 'string'
    ? JSON.parse(plan.selected_lanes)
    : plan.selected_lanes
  const calculations = plan.mutcd_calculations

  // ========================================================================
  // HEADER
  // ========================================================================
  doc.setFillColor(COLORS.neutral)
  doc.rect(0, 0, PAGE_WIDTH, 40, 'F')

  // Logo/Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('ZoneSafe', MARGIN, 20)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('MUTCD Safety Plan Report', MARGIN, 30)

  // Date
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, PAGE_WIDTH - MARGIN - 60, 30)

  yPosition = 50

  // ========================================================================
  // PLAN TITLE AND METADATA
  // ========================================================================
  doc.setTextColor(COLORS.neutral)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(plan.title, MARGIN, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Status: ${plan.status.toUpperCase()} | Work Type: ${plan.work_type.replace('_', ' ').toUpperCase()} | Confidence: ${plan.confidence_score}%`, MARGIN, yPosition)
  yPosition += 5
  doc.text(`Created: ${new Date(plan.created_at).toLocaleString()} | Updated: ${new Date(plan.updated_at).toLocaleString()}`, MARGIN, yPosition)
  yPosition += 15

  // ========================================================================
  // ROAD INFORMATION
  // ========================================================================
  addSectionHeader('ROAD INFORMATION')
  addKeyValue('Road Name', plan.road_name)
  addKeyValue('Start Address', plan.start_address)
  addKeyValue('End Address', plan.end_address || 'N/A')
  addKeyValue('Speed Limit', `${plan.speed_limit} mph`)
  addKeyValue('Lane Count', plan.lane_count.toString())
  addKeyValue('Closed Lanes', selectedLanes.join(', '))
  addKeyValue('Work Zone Length', `${plan.work_zone_length_feet} feet`)
  yPosition += 5

  // ========================================================================
  // WORK TIMING
  // ========================================================================
  addSectionHeader('WORK TIMING')
  addKeyValue('Duration', `${plan.duration_value} ${plan.duration_unit}`)
  addKeyValue('Time of Day', plan.time_of_day.replace('_', ' ').toUpperCase())
  addKeyValue('Days of Week', plan.days_of_week)
  yPosition += 5

  // ========================================================================
  // WORK ZONE DETAILS
  // ========================================================================
  addSectionHeader('WORK ZONE DETAILS')
  addKeyValue('Worker Count', plan.worker_count.toString())
  addKeyValue('Flagger Required', plan.has_flagger ? 'Yes' : 'No')
  if (plan.has_flagger) {
    addKeyValue('Flagger Count', plan.flagger_count?.toString() || 'N/A')
  }
  yPosition += 5

  // ========================================================================
  // EQUIPMENT
  // ========================================================================
  addSectionHeader('EQUIPMENT')
  if (equipment.length > 0) {
    equipment.forEach((item: any) => {
      checkPageOverflow()
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`• ${item.name}`, MARGIN + 5, yPosition)
      yPosition += LINE_HEIGHT
    })
  } else {
    doc.setFontSize(10)
    doc.text('No equipment specified', MARGIN + 5, yPosition)
    yPosition += LINE_HEIGHT
  }
  yPosition += 5

  // ========================================================================
  // MUTCD CALCULATIONS
  // ========================================================================
  if (calculations) {
    addSectionHeader('MUTCD CALCULATIONS')

    // Tapers
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    checkPageOverflow()
    doc.text('Taper Lengths', MARGIN + 5, yPosition)
    yPosition += LINE_HEIGHT
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    addKeyValue('  Merging Taper', `${calculations.tapers?.mergingTaperLength || 0} feet`)
    addKeyValue('  Shifting Taper', `${calculations.tapers?.shiftingTaperLength || 0} feet`)
    addKeyValue('  Shoulder Taper', `${calculations.tapers?.shoulderTaperLength || 0} feet`)
    addKeyValue('  One Lane Two-Way Taper', `${calculations.tapers?.oneLaneTwoWayTaperLength || 0} feet`)
    addKeyValue('  Downstream Taper', `${calculations.tapers?.downstreamTaperLength || 0} feet`)
    yPosition += 3

    // Buffer Spaces
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    checkPageOverflow()
    doc.text('Buffer Spaces', MARGIN + 5, yPosition)
    yPosition += LINE_HEIGHT
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    addKeyValue('  Longitudinal Buffer', `${calculations.bufferSpaces?.longitudinalBufferFeet || 0} feet`)
    addKeyValue('  Lateral Buffer', `${calculations.bufferSpaces?.lateralBufferFeet || 0} feet`)
    addKeyValue('  Stopping Sight Distance', `${calculations.bufferSpaces?.stoppingSightDistance || 0} feet`)
    yPosition += 3

    // Sign Placement
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    checkPageOverflow()
    doc.text('Sign Placement', MARGIN + 5, yPosition)
    yPosition += LINE_HEIGHT
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    addKeyValue('  Distance A (First Sign)', `${calculations.signPlacement?.advanceWarningDistances?.A || 0} feet`)
    addKeyValue('  Distance B (Second Sign)', `${calculations.signPlacement?.advanceWarningDistances?.B || 0} feet`)
    addKeyValue('  Distance C (Third Sign)', `${calculations.signPlacement?.advanceWarningDistances?.C || 0} feet`)
    addKeyValue('  Minimum Sign Height', `${calculations.signPlacement?.minimumSignHeight || 0} inches`)
    addKeyValue('  Lateral Offset', `${calculations.signPlacement?.lateralOffset || 0} feet`)
    yPosition += 3

    // Channelizing Devices
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    checkPageOverflow()
    doc.text('Channelizing Devices', MARGIN + 5, yPosition)
    yPosition += LINE_HEIGHT
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    addKeyValue('  Taper Spacing', `${calculations.channelizingDevices?.taperSpacing || 0} feet`)
    addKeyValue('  Tangent Spacing', `${calculations.channelizingDevices?.tangentSpacing || 0} feet`)
    addKeyValue('  Extension Distance', `${calculations.channelizingDevices?.extensionDistance || 0} feet`)
    yPosition += 3

    // Arrow Board (if applicable)
    if (calculations.arrowBoard) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      checkPageOverflow()
      doc.text('Arrow Board Requirements', MARGIN + 5, yPosition)
      yPosition += LINE_HEIGHT
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      addKeyValue('  Type', calculations.arrowBoard.type)
      addKeyValue('  Required', calculations.arrowBoard.required ? 'Yes' : 'No')
      addKeyValue('  Min Legibility Distance', `${calculations.arrowBoard.minLegibilityDistance} feet`)
      addKeyValue('  Mounting Height', `${calculations.arrowBoard.mountingHeightFeet} feet`)
      yPosition += 3
    }

    // Flagger Station (if applicable)
    if (calculations.flaggerStation) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      checkPageOverflow()
      doc.text('Flagger Station', MARGIN + 5, yPosition)
      yPosition += LINE_HEIGHT
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      addKeyValue('  Location', `${calculations.flaggerStation.locationFeet} feet from work zone`)
      addKeyValue('  Illumination Required', calculations.flaggerStation.illuminationRequired ? 'Yes' : 'No')
      addKeyValue('  Stopping Sight Distance', `${calculations.flaggerStation.stoppingSightDistance} feet`)
      yPosition += 3
    }

    // Lane Width Requirements
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    checkPageOverflow()
    doc.text('Lane Width Requirements', MARGIN + 5, yPosition)
    yPosition += LINE_HEIGHT
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    addKeyValue('  Minimum Width', `${calculations.laneWidth?.minimumFeet || 0} feet`)
    addKeyValue('  Measurement Point', calculations.laneWidth?.measurementPoint || 'N/A')
    if (calculations.laneWidth?.exception) {
      addKeyValue('  Exception', calculations.laneWidth.exception)
    }
  }

  // ========================================================================
  // FOOTER
  // ========================================================================
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Page ${i} of ${pageCount}`,
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 10,
      { align: 'center' }
    )
    doc.text(
      'Generated by ZoneSafe - MUTCD Safety Plan Generator',
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 6,
      { align: 'center' }
    )
  }

  // ========================================================================
  // SAVE PDF
  // ========================================================================
  const fileName = `${plan.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
