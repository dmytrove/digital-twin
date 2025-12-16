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

const equipmentTemplates = [
  { type: 'server', manufacturer: 'Dell', models: ['PowerEdge R740', 'PowerEdge R640', 'PowerEdge R840'], unitHeight: 2, power: 750 },
  { type: 'server', manufacturer: 'HP', models: ['ProLiant DL380 Gen10', 'ProLiant DL360'], unitHeight: 2, power: 800 },
  { type: 'switch', manufacturer: 'Cisco', models: ['Catalyst 9300', 'Nexus 9000', 'Catalyst 2960X'], unitHeight: 1, power: 350 },
  { type: 'router', manufacturer: 'Cisco', models: ['ISR 4451', 'ASR 1001-X'], unitHeight: 2, power: 400 },
  { type: 'firewall', manufacturer: 'Palo Alto', models: ['PA-5220', 'PA-3220'], unitHeight: 1, power: 300 },
  { type: 'storage', manufacturer: 'NetApp', models: ['FAS8200', 'AFF A250'], unitHeight: 4, power: 1200 },
  { type: 'ups', manufacturer: 'APC', models: ['Smart-UPS SRT 3000', 'Smart-UPS SRT 5000'], unitHeight: 3, power: 0 },
  { type: 'pdu', manufacturer: 'APC', models: ['AP8841', 'AP8861'], unitHeight: 0, power: 0 },
  { type: 'patch-panel', manufacturer: 'Panduit', models: ['CP48WSBLY', 'CP24WSBLY'], unitHeight: 1, power: 0 }
];

function createEquipment(
  rackId: string,
  rackUnit: number,
  rackPosition: { x: number, z: number },
  status: BIMEquipment['fourDStatus'] = 'existing-retained'
): BIMEquipment {
  const template = equipmentTemplates[Math.floor(Math.random() * equipmentTemplates.length)];
  const model = template.models[Math.floor(Math.random() * template.models.length)];
  
  return {
    id: generateEquipmentId(),
    name: `${template.manufacturer} ${model}`,
    type: template.type as BIMEquipment['type'],
    manufacturer: template.manufacturer,
    model: model,
    rackId: rackId,
    rackUnit: rackUnit,
    unitHeight: template.unitHeight,
    position: {
      x: rackPosition.x,
      y: (rackUnit - 1) * 0.0445 + 0.5,
      z: rackPosition.z
    },
    dimensions: {
      width: 0.48,
      height: template.unitHeight * 0.0445,
      depth: 0.8
    },
    fourDStatus: status,
    powerConsumption: template.power,
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

    const rackRows = 3;
    const racksPerRow = 5;
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

        const equipmentCount = Math.floor(Math.random() * 10) + 5;
        let currentUnit = 1;

        for (let i = 0; i < equipmentCount && currentUnit < 40; i++) {
          const equipment = createEquipment(
            rackId,
            currentUnit,
            { x: rack.position.x, z: rack.position.z },
            'existing-retained'
          );
          
          if (cityIndex === 0 && rackCount === 1 && i < 2) {
            equipment.fourDStatus = 'existing-removed';
          }
          
          site.equipment.push(equipment);
          currentUnit += equipment.unitHeight + Math.floor(Math.random() * 3) + 1;
        }
      }
    }

    if (cityIndex === 0) {
      const proposedEquipment1 = createEquipment(
        'rack-1-1',
        20,
        { x: -7, z: -5 },
        'proposed'
      );
      proposedEquipment1.name = 'Dell PowerEdge R750 (New)';
      site.equipment.push(proposedEquipment1);

      const proposedEquipment2 = createEquipment(
        'rack-1-1',
        23,
        { x: -7, z: -5 },
        'proposed'
      );
      proposedEquipment2.name = 'Cisco Catalyst 9500 (New)';
      site.equipment.push(proposedEquipment2);

      const proposedEquipment3 = createEquipment(
        'rack-1-2',
        15,
        { x: -4, z: -5 },
        'proposed'
      );
      site.equipment.push(proposedEquipment3);

      const futureRack = createRack(
        'rack-1-future',
        'Rack F1',
        8,
        -5,
        'future'
      );
      site.racks.push(futureRack);

      for (let i = 0; i < 3; i++) {
        const futureEquipment = createEquipment(
          futureRack.id,
          1 + i * 4,
          { x: futureRack.position.x, z: futureRack.position.z },
          'future'
        );
        site.equipment.push(futureEquipment);
      }
    }

    sites.push(site);
  });

  return sites;
};