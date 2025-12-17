# Rack Visibility Fix

## 🔴 Issue
Not all racks visible in 3D viewer.

## 🔍 Root Causes Identified

### 1. **Camera Position**
- **Before:** Camera at `[15, 10, 15]` - far to the side
- **After:** Camera at `[0, 15, 20]` - centered above, looking down
- Racks span X: -7 to 2, Z: -5 to -1
- New position provides better overview

### 2. **Line Width Too Thin**
- Browser line rendering is limited to 1px in WebGL
- `linewidth` parameter often ignored by GPU
- Wireframe racks might be invisible or too thin

### 3. **No Visual Reference**
- No grid or axes to orient in 3D space
- Hard to see where racks are positioned

## 🔧 Fixes Applied

### 1. **Improved Camera Position** ✅
```typescript
// BEFORE
position={[15, 10, 15]}  // Side view
fov={60}

// AFTER  
position={[0, 15, 20]}   // Top-front view
fov={50}                 // Tighter FOV for focus
```

### 2. **Added Visual Helpers** ✅
```typescript
// Grid for spatial reference
<gridHelper args={[30, 30, '#cccccc', '#eeeeee']} />

// Axes for orientation (Red=X, Green=Y, Blue=Z)
<axesHelper args={[5]} />
```

### 3. **Enhanced Rack Visibility** ✅
```typescript
// Added semi-transparent box mesh for better visibility
<mesh>
  <boxGeometry args={[0.6, 2, 1]} />
  <meshStandardMaterial 
    color="#94a3b8" 
    transparent 
    opacity={0.1}
  />
</mesh>

// Made wireframe darker
<lineBasicMaterial color="#1a202c" linewidth={2} />
```

### 4. **Added Debug Logging** ✅
```typescript
console.log('Total racks:', currentSite.racks.length);
console.log('Visible racks:', filtered.length);
console.log('Rendering rack:', rack.id, 'at position:', rack.position);
```

## 📊 Expected Results

### Rack Layout (2 rows × 4 columns = 8 racks):
```
Row 0 (Z=-5): [A1: X=-7], [A2: X=-4], [A3: X=-1], [A4: X=2]
Row 1 (Z=-1): [B1: X=-7], [B2: X=-4], [B3: X=-1], [B4: X=2]
```

### Camera View:
- Looking from above and front
- All 8 racks visible
- Grid shows spatial layout
- Axes show orientation

## 🧪 Testing

Open browser console and check:

1. **Rack Count:**
   ```
   Total racks: 8
   Visible racks: 8
   ```

2. **Rack Rendering:**
   ```
   Rendering rack: rack-1-1 at position: {x: -7, y: 0, z: -5}
   Rendering rack: rack-1-2 at position: {x: -4, y: 0, z: -5}
   ...
   ```

3. **Visual Check:**
   - ✅ Grid visible (30×30 squares)
   - ✅ Axes visible (RGB arrows)
   - ✅ 8 rack boxes visible
   - ✅ Equipment inside racks

## 🎯 Additional Improvements

### If racks still not visible:

1. **Check Layer Visibility:**
   - All racks have `fourDStatus: 'existing-retained'`
   - Ensure layer is enabled in LayerControls

2. **Clear localStorage:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

3. **Adjust Camera:**
   ```typescript
   // Try different positions
   position={[0, 20, 25]}  // Higher and further
   position={[-3, 12, 15]} // Offset view
   ```

4. **Increase Rack Opacity:**
   ```typescript
   opacity={0.3}  // More visible
   ```

## 📋 Files Modified

1. ✅ `src/components/viewer/BIMViewer.tsx`
   - Changed camera position
   - Added grid helper
   - Added axes helper
   - Added debug logging

2. ✅ `src/components/viewer/SimplifiedRack.tsx`
   - Added semi-transparent mesh
   - Darker wireframe color
   - Increased linewidth (may not work in all browsers)

## ✅ Status

- ✅ No TypeScript errors
- ✅ Camera repositioned
- ✅ Visual helpers added
- ✅ Rack visibility enhanced
- ✅ Debug logging added
- [ ] **Test in browser**

---

*Created: December 17, 2025*
*Issue: Not all racks visible*
*Status: Fixed - Awaiting browser test*
