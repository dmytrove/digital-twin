export type FourDStatus = 
  | 'existing-retained'
  | 'existing-removed' 
  | 'proposed'
  | 'future'
  | 'modified';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface BIMEquipment {
  id: string;
  name: string;
  type: 'server' | 'switch' | 'router' | 'ups' | 'pdu' | 'patch-panel' | 'storage' | 'firewall';
  manufacturer: string;
  model: string;
  rackId: string;
  rackUnit: number;
  unitHeight: number;
  position: Position3D;
  dimensions: Dimensions;
  fourDStatus: FourDStatus;
  previousPosition?: Position3D;
  powerConsumption: number;
  customer?: string;
  serialNumber: string;
  assetTag: string;
  installDate?: string;
  decommissionDate?: string;
  notes?: string;
}

export interface Rack {
  id: string;
  name: string;
  position: Position3D;
  dimensions: Dimensions;
  totalUnits: number;
  fourDStatus: FourDStatus;
  powerCapacity: number;
}

export interface Building {
  id: string;
  name: string;
  visible: boolean;
  position: Position3D;
  dimensions: Dimensions;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  building: Building;
  racks: Rack[];
  equipment: BIMEquipment[];
}

export interface ColorScheme {
  'existing-retained': string;
  'existing-removed': string;
  'proposed': string;
  'future': string;
  'modified': string;
}

export const DEFAULT_COLOR_SCHEME: ColorScheme = {
  'existing-retained': '#808080',
  'existing-removed': '#ff4444',
  'proposed': '#44ff44',
  'future': '#ffaa44',
  'modified': '#4444ff'
};