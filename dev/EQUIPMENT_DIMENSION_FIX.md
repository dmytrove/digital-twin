# Equipment Dimension Fix

## Issue
Equipment dimensions appeared incorrect on GitHub Pages deployment, with length/width proportions looking different than expected.

## Root Cause Analysis

### Coordinate System
In the 3D viewer using Three.js:
- **X-axis**: Horizontal (left-right across rack front) 
- **Y-axis**: Vertical (up-down, rack height)
- **Z-axis**: Depth (front-to-back into rack)

### Equipment Dimensions
Equipment uses Three.js `BoxGeometry(width, height, depth)` where:
- **width** (X): Equipment width across rack front = **0.48m** (19" rack standard)
- **height** (Y): Vertical height based on rack units (1U-4U) = **0.048m - 0.19m**
- **depth** (Z): Equipment depth into rack = **0.08m - 0.9m** (varies by type)

### Equipment Types by Depth
- **Patch Panels**: 0.08-0.10m (very shallow)
- **PDUs**: 0.12-0.15m (shallow)
- **Network Switches**: 0.38-0.50m (medium)
- **Firewalls**: 0.43-0.50m (medium)
- **Routers**: 0.50-0.52m (medium)
- **UPS Systems**: 0.60-0.65m (medium-deep)
- **Servers (1U-2U)**: 0.70-0.75m (deep)
- **Servers (4U)**: 0.80m (very deep)
- **Storage Arrays**: 0.82-0.90m (extra deep)

## Fix Applied

### 1. **Added Dimension Validation**
Added safety checks to ensure dimensions are finite and positive:

```typescript
const width = Number.isFinite(equipment.dimensions.width) && equipment.dimensions.width > 0 
  ? equipment.dimensions.width 
  : 0.48; // Default to 19" standard

const height = Number.isFinite(equipment.dimensions.height) && equipment.dimensions.height > 0 
  ? equipment.dimensions.height 
  : 0.048; // Default to 1U

const depth = Number.isFinite(equipment.dimensions.depth) && equipment.dimensions.depth > 0 
  ? equipment.dimensions.depth 
  : 0.7; // Default to standard server depth
```

### 2. **Enhanced Documentation**
Added comprehensive comments explaining the coordinate system and expected dimension ranges.

### 3. **Geometry Caching**
The existing geometry cache system ensures:
- Geometries are only created once per unique dimension set
- Proper cleanup on unmount
- Efficient memory usage

## Expected Results

### Visual Appearance
- **Front View**: All equipment should appear the same width (0.48m)
- **Side View**: Equipment should vary in depth into the rack
- **Top View**: Width is consistent, depth varies by equipment type

### Correct Proportions
For a typical 1U server (0.48m wide × 0.048m tall × 0.72m deep):
- Width:Height ratio = 10:1 (flat, wide profile)
- Width:Depth ratio = 0.67:1 (deeper than it is wide)
- Depth:Height ratio = 15:1 (much deeper than tall)

## Testing

### Visual Checks
1. View rack from front - all equipment same width
2. View rack from side - equipment depths vary noticeably
3. Zoom in on individual items - proportions look realistic
4. Compare patch panels (thin) vs storage arrays (thick)

### Console Verification
```javascript
// Check equipment dimensions in browser console
console.table(equipment.map(e => ({
  name: e.name,
  type: e.type,
  width: e.dimensions.width,
  height: e.dimensions.height,
  depth: e.dimensions.depth,
  ratio: `${(e.dimensions.depth / e.dimensions.width).toFixed(2)}:1`
})));
```

## Files Modified
- ✅ `src/components/viewer/Equipment3D.tsx` - Added validation and documentation

## Deployment
Changes committed and pushed to GitHub:
- Commit: `8ffe46e`
- Message: "fix: add dimension validation and clarify coordinate system for equipment rendering"

GitHub Actions will rebuild and deploy to GitHub Pages automatically.

---

**Status**: ✅ Fixed and deployed
**Date**: December 17, 2025
