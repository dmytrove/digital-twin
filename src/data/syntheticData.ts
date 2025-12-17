import type { Site, Rack, BIMEquipment } from '../types/bim';

function generateEquipmentId(): string {
  return `EQ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function generateSerialNumber(): string {
  return `SN${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
}

function generateAssetTag(): string {
  return `AT${Math.floor(Math.random() * 900000) + 100000}`;
}

// Equipment footprint normalization
// Per demo requirements: only unit height should vary visually.
// Keep a single consistent width/depth for all rack-mounted equipment.
const STANDARD_EQUIPMENT_WIDTH = 0.48;
const STANDARD_EQUIPMENT_DEPTH = 0.8;

const equipmentTemplates = [
  // 1U Servers (blade servers, compact servers) - standard depth
  { type: 'server', manufacturer: 'Dell', models: ['PowerEdge R640', 'PowerEdge R650'], unitHeight: 1, power: 550 },
  { type: 'server', manufacturer: 'HP', models: ['ProLiant DL360 Gen10', 'ProLiant DL365 Gen10 Plus'], unitHeight: 1, power: 500 },
  
  // 2U Servers (standard rack servers) - deeper for more drives
  { type: 'server', manufacturer: 'Dell', models: ['PowerEdge R740', 'PowerEdge R740xd', 'PowerEdge R750'], unitHeight: 2, power: 750 },
  { type: 'server', manufacturer: 'HP', models: ['ProLiant DL380 Gen10', 'ProLiant DL385 Gen10 Plus'], unitHeight: 2, power: 800 },
  { type: 'server', manufacturer: 'Lenovo', models: ['ThinkSystem SR650', 'ThinkSystem SR630'], unitHeight: 2, power: 750 },
  
  // 4U Servers (high-capacity servers) - full depth
  { type: 'server', manufacturer: 'Dell', models: ['PowerEdge R840', 'PowerEdge R940'], unitHeight: 4, power: 1600 },
  { type: 'server', manufacturer: 'HP', models: ['ProLiant DL580 Gen10'], unitHeight: 4, power: 1800 },
  
  // Network Switches (1U) - shallow depth
  { type: 'switch', manufacturer: 'Cisco', models: ['Catalyst 9300', 'Nexus 93180YC-FX'], unitHeight: 1, power: 350 },
  { type: 'switch', manufacturer: 'Arista', models: ['7050SX3-48YC12', '7280SR3-48YC8'], unitHeight: 1, power: 400 },
  { type: 'switch', manufacturer: 'Juniper', models: ['EX4300-48T', 'QFX5120-48Y'], unitHeight: 1, power: 380 },
  
  // Core Switches (2U) - medium depth
  { type: 'switch', manufacturer: 'Cisco', models: ['Nexus 9336C-FX2', 'Catalyst 9500-40X'], unitHeight: 2, power: 650 },
  
  // Routers (2U) - medium depth
  { type: 'router', manufacturer: 'Cisco', models: ['ISR 4451', 'ASR 1001-X', 'ISR 4431'], unitHeight: 2, power: 450 },
  { type: 'router', manufacturer: 'Juniper', models: ['MX204', 'MX150'], unitHeight: 2, power: 500 },
  
  // Firewalls (1U and 2U) - compact depth
  { type: 'firewall', manufacturer: 'Palo Alto', models: ['PA-5220', 'PA-3220'], unitHeight: 1, power: 300 },
  { type: 'firewall', manufacturer: 'Fortinet', models: ['FortiGate 600E', 'FortiGate 1800F'], unitHeight: 1, power: 280 },
  { type: 'firewall', manufacturer: 'Checkpoint', models: ['6600 Appliance', '16600 Appliance'], unitHeight: 2, power: 550 },
  
  // Storage Arrays (2U to 4U) - extra deep for drives
  { type: 'storage', manufacturer: 'NetApp', models: ['FAS8200', 'FAS8300'], unitHeight: 2, power: 800 },
  { type: 'storage', manufacturer: 'Dell EMC', models: ['PowerStore 3200T', 'Unity XT 480'], unitHeight: 2, power: 850 },
  { type: 'storage', manufacturer: 'NetApp', models: ['AFF A800', 'FAS9500'], unitHeight: 4, power: 1600 },
  { type: 'storage', manufacturer: 'Pure Storage', models: ['FlashArray//X90', 'FlashBlade//S'], unitHeight: 3, power: 1400 },
  
  // UPS Systems (2U to 6U) - medium depth
  { type: 'ups', manufacturer: 'APC', models: ['Smart-UPS SRT 2200', 'Smart-UPS SRT 3000'], unitHeight: 2, power: 0 },
  { type: 'ups', manufacturer: 'APC', models: ['Smart-UPS SRT 5000', 'Smart-UPS SRT 6000'], unitHeight: 4, power: 0 },
  { type: 'ups', manufacturer: 'Eaton', models: ['9PX 3000RT', '93PR 6000'], unitHeight: 3, power: 0 },
  
  // PDUs (1U or 0U vertical mount) - very shallow
  { type: 'pdu', manufacturer: 'APC', models: ['AP8841 Metered PDU', 'AP8861 Switched PDU'], unitHeight: 1, power: 0 },
  { type: 'pdu', manufacturer: 'Raritan', models: ['PX3-5466', 'PX3-5776'], unitHeight: 1, power: 0 },
  
  // Patch Panels (1U) - very shallow
  { type: 'patch-panel', manufacturer: 'Panduit', models: ['CP48WSBLY', 'CP24WSBLY'], unitHeight: 1, power: 0 },
  { type: 'patch-panel', manufacturer: 'Leviton', models: ['49255-H48', '49255-H24'], unitHeight: 1, power: 0 }
];

function createEquipment(
  rackId: string,
  rackUnit: number,
  rackPosition: { x: number, z: number },
  status: BIMEquipment['fourDStatus'] = 'existing-retained',
  template?: typeof equipmentTemplates[0]
): BIMEquipment {
  const equipmentTemplate = template || equipmentTemplates[Math.floor(Math.random() * equipmentTemplates.length)];
  const model = equipmentTemplate.models[Math.floor(Math.random() * equipmentTemplate.models.length)];
  
  return {
    id: generateEquipmentId(),
    name: `${equipmentTemplate.manufacturer} ${model}`,
    type: equipmentTemplate.type as BIMEquipment['type'],
    manufacturer: equipmentTemplate.manufacturer,
    model: model,
    rackId: rackId,
    rackUnit: rackUnit,
    unitHeight: equipmentTemplate.unitHeight,
    position: {
      x: rackPosition.x,
      // Rack is 2.0 units tall with 42U, so each U = 2.0/42 ≈ 0.0476
      // Equipment should be centered in its rack unit space
      // Y position = bottom of rack (0) + (rack unit - 1) * unit height + half of equipment height
      y: (rackUnit - 1) * (2.0 / 42) + (equipmentTemplate.unitHeight * (2.0 / 42) / 2),
      z: rackPosition.z
    },
    dimensions: {
      width: STANDARD_EQUIPMENT_WIDTH,
      height: equipmentTemplate.unitHeight * (2.0 / 42), // Each U is 2.0/42 units tall
      depth: STANDARD_EQUIPMENT_DEPTH
    },
    fourDStatus: status,
    powerConsumption: equipmentTemplate.power,
    serialNumber: generateSerialNumber(),
    assetTag: generateAssetTag(),
    installDate: status === 'existing-retained' ? '2023-01-15' : undefined
  };
}

function createRack(id: string, name: string, x: number, z: number, status: Rack['fourDStatus'] = 'existing-retained'): Rack {
  return {
    id,
    name,
    position: { x, y: 0, z },
    dimensions: { width: 0.6, height: 2.0, depth: 1.0 },
    totalUnits: 42,
    fourDStatus: status,
    powerCapacity: 10000
  };
}

export const generateSyntheticSites = (): Site[] => {
  const sites: Site[] = [];
  
  const cities = [
    { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 }
  ];

  cities.forEach((city, cityIndex) => {
    const site: Site = {
      id: `site-${cityIndex + 1}`,
      name: `${city.name} Data Center`,
      address: `${1000 + cityIndex * 100} Tech Park Drive`,
      city: city.name,
      state: city.state,
      coordinates: { lat: city.lat, lng: city.lng },
      building: {
        id: `building-${cityIndex + 1}`,
        name: `Building ${cityIndex + 1}`,
        visible: true,
        position: { x: 0, y: 0, z: 0 },
        dimensions: { width: 20, height: 4, depth: 15 }
      },
      racks: [],
      equipment: []
    };

    // Reduce rack count to improve performance
    const rackRows = 2;
    const racksPerRow = 4;
    let rackCount = 0;

    for (let row = 0; row < rackRows; row++) {
      for (let col = 0; col < racksPerRow; col++) {
        rackCount++;
        const rackId = `rack-${cityIndex + 1}-${rackCount}`;
        const rack = createRack(
          rackId,
          `Rack ${String.fromCharCode(65 + row)}${col + 1}`,
          -7 + col * 3,
          -5 + row * 4,
          'existing-retained'
        );
        site.racks.push(rack);

        // Track occupied units to prevent overlapping
        const occupiedUnits = new Set<number>();
        
        // Helper function to find next available slot
        const findNextAvailableUnit = (startUnit: number, unitHeight: number): number | null => {
          for (let unit = startUnit; unit <= 42 - unitHeight + 1; unit++) {
            let canFit = true;
            for (let u = unit; u < unit + unitHeight; u++) {
              if (occupiedUnits.has(u)) {
                canFit = false;
                break;
              }
            }
            if (canFit) {
              return unit;
            }
          }
          return null;
        };
        
        // Helper function to mark units as occupied
        const markUnitsOccupied = (startUnit: number, unitHeight: number) => {
          for (let u = startUnit; u < startUnit + unitHeight; u++) {
            occupiedUnits.add(u);
          }
        };

        // Start with PDU at bottom (common practice)
        if (Math.random() > 0.3) { // 70% chance of PDU
          const pduTemplate = equipmentTemplates.find(t => t.type === 'pdu' && t.unitHeight === 1);
          if (pduTemplate) {
            const pduUnit = findNextAvailableUnit(1, pduTemplate.unitHeight);
            if (pduUnit !== null) {
              const pdu = createEquipment(rackId, pduUnit, { x: rack.position.x, z: rack.position.z }, 'existing-retained', pduTemplate);
              site.equipment.push(pdu);
              markUnitsOccupied(pduUnit, pduTemplate.unitHeight);
            }
          }
        }

        // Reduce equipment count for better performance
        const equipmentMix = [
          { type: 'server', count: Math.floor(Math.random() * 4) + 3 },      // 3-6 servers (reduced)
          { type: 'switch', count: Math.floor(Math.random() * 2) + 1 },      // 1-2 switches  
          { type: 'storage', count: Math.random() > 0.5 ? 1 : 0 },           // 0-1 storage
          { type: 'firewall', count: Math.random() > 0.6 ? 1 : 0 },         // 40% chance of firewall
          { type: 'patch-panel', count: 1 },                                 // 1 patch panel
          { type: 'ups', count: Math.random() > 0.5 ? 1 : 0 }               // 50% chance of UPS
        ];

        // Reduce rack utilization for better performance
        const rackUtilization = 0.4 + Math.random() * 0.2; // 40-60% (reduced from 60-85%)
        const maxUnitsToOccupy = Math.floor(42 * rackUtilization);
        let totalOccupiedUnits = occupiedUnits.size;

        // Place equipment by type
        for (const mix of equipmentMix) {
          for (let i = 0; i < mix.count && totalOccupiedUnits < maxUnitsToOccupy; i++) {
            const typeTemplates = equipmentTemplates.filter(t => t.type === mix.type);
            if (typeTemplates.length === 0) continue;
            
            const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
            
            // Find next available slot with optional gap
            let searchStart = 1;
            if (occupiedUnits.size > 0) {
              searchStart = Math.max(...Array.from(occupiedUnits)) + 1;
              // Add optional gap for cable management
              if (mix.type === 'switch' || mix.type === 'router') {
                searchStart += Math.floor(Math.random() * 2); // 0-1U gap
              }
            }
            
            const availableUnit = findNextAvailableUnit(searchStart, template.unitHeight);
            if (availableUnit === null) break; // No more space in rack
            
            const equipment = createEquipment(
              rackId,
              availableUnit,
              { x: rack.position.x, z: rack.position.z },
              'existing-retained',
              template
            );
            
            // Mark some equipment for removal (demo scenario)
            if (cityIndex === 0 && rackCount === 1 && i < 2 && mix.type === 'server') {
              equipment.fourDStatus = 'existing-removed';
            }
            
            site.equipment.push(equipment);
            markUnitsOccupied(availableUnit, template.unitHeight);
            totalOccupiedUnits = occupiedUnits.size;
          }
        }
      }
    }

    if (cityIndex === 0) {
      // Add proposed equipment with realistic specifications
      // Find equipment in first rack and place proposed equipment in empty slots
      const firstRack = site.racks[0];
      const firstRackEquipment = site.equipment.filter(e => e.rackId === firstRack.id).sort((a, b) => a.rackUnit - b.rackUnit);
      
      // Find first available slot that can fit 2U server
      let proposedUnit = 20;
      for (const eq of firstRackEquipment) {
        if (eq.rackUnit >= proposedUnit && eq.rackUnit < proposedUnit + 2) {
          proposedUnit = eq.rackUnit + eq.unitHeight + 1; // Place after existing equipment
        }
      }
      
      if (proposedUnit + 2 <= 42) {
        const serverTemplate = equipmentTemplates.find(t => t.manufacturer === 'Dell' && t.models.includes('PowerEdge R750'));
        if (serverTemplate) {
          const proposedServer = createEquipment(
            firstRack.id,
            proposedUnit,
            { x: firstRack.position.x, z: firstRack.position.z },
            'proposed',
            serverTemplate
          );
          proposedServer.name = 'Dell PowerEdge R750 (New)';
          site.equipment.push(proposedServer);
        }
      }

      // Add proposed switch
      const switchTemplate = equipmentTemplates.find(t => t.manufacturer === 'Cisco' && t.type === 'switch' && t.unitHeight === 2);
      if (switchTemplate && firstRack) {
        // Find available slot for switch
        let switchUnit = 26;
        const rackEquipment = site.equipment.filter(e => e.rackId === firstRack.id).sort((a, b) => a.rackUnit - b.rackUnit);
        for (const eq of rackEquipment) {
          if (eq.rackUnit >= switchUnit && eq.rackUnit < switchUnit + 2) {
            switchUnit = eq.rackUnit + eq.unitHeight + 1;
          }
        }
        
        if (switchUnit + 2 <= 42) {
          const proposedSwitch = createEquipment(
            firstRack.id,
            switchUnit,
            { x: firstRack.position.x, z: firstRack.position.z },
            'proposed',
            switchTemplate
          );
          proposedSwitch.name = 'Cisco Nexus 9336C-FX2 (New)';
          site.equipment.push(proposedSwitch);
        }
      }

      // Add proposed storage in second rack
      const secondRack = site.racks[1];
      if (secondRack) {
        const storageTemplate = equipmentTemplates.find(t => t.manufacturer === 'NetApp' && t.type === 'storage' && t.unitHeight === 2);
        if (storageTemplate) {
          // Find available slot in second rack
          let storageUnit = 15;
          const rack2Equipment = site.equipment.filter(e => e.rackId === secondRack.id).sort((a, b) => a.rackUnit - b.rackUnit);
          for (const eq of rack2Equipment) {
            if (eq.rackUnit >= storageUnit && eq.rackUnit < storageUnit + 2) {
              storageUnit = eq.rackUnit + eq.unitHeight + 1;
            }
          }
          
          if (storageUnit + 2 <= 42) {
            const proposedStorage = createEquipment(
              secondRack.id,
              storageUnit,
              { x: secondRack.position.x, z: secondRack.position.z },
              'proposed',
              storageTemplate
            );
            proposedStorage.name = 'NetApp FAS8300 (New)';
            site.equipment.push(proposedStorage);
          }
        }
      }

      const futureRack = createRack(
        'rack-1-future',
        'Rack F1',
        8,
        -5,
        'future'
      );
      site.racks.push(futureRack);

      // Add realistic future equipment
      let futureUnit = 1;
      
      // Add future server
      const futureServerTemplate = equipmentTemplates.find(t => t.manufacturer === 'HP' && t.type === 'server' && t.unitHeight === 2);
      if (futureServerTemplate) {
        const futureServer = createEquipment(
          futureRack.id,
          futureUnit,
          { x: futureRack.position.x, z: futureRack.position.z },
          'future',
          futureServerTemplate
        );
        futureServer.name = 'HP ProLiant DL380 Gen10 (Future)';
        site.equipment.push(futureServer);
        futureUnit += futureServerTemplate.unitHeight + 1;
      }
      
      // Add future switch
      const futureSwitchTemplate = equipmentTemplates.find(t => t.manufacturer === 'Arista' && t.type === 'switch');
      if (futureSwitchTemplate) {
        const futureSwitch = createEquipment(
          futureRack.id,
          futureUnit,
          { x: futureRack.position.x, z: futureRack.position.z },
          'future',
          futureSwitchTemplate
        );
        futureSwitch.name = 'Arista 7050SX3 (Future)';
        site.equipment.push(futureSwitch);
        futureUnit += futureSwitchTemplate.unitHeight + 1;
      }
      
      // Add future storage
      const futureStorageTemplate = equipmentTemplates.find(t => t.manufacturer === 'Pure Storage' && t.type === 'storage');
      if (futureStorageTemplate) {
        const futureStorage = createEquipment(
          futureRack.id,
          futureUnit,
          { x: futureRack.position.x, z: futureRack.position.z },
          'future',
          futureStorageTemplate
        );
        futureStorage.name = 'Pure Storage FlashArray (Future)';
        site.equipment.push(futureStorage);
      }
    }

    sites.push(site);
  });

  return sites;
};