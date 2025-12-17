import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Site, BIMEquipment, FourDStatus, ColorScheme } from '../types/bim';
import { DEFAULT_COLOR_SCHEME } from '../types/bim';
import { generateSyntheticSites } from '../data/syntheticData';

interface LayerVisibility {
  'existing-retained': boolean;
  'existing-removed': boolean;
  'proposed': boolean;
  'future': boolean;
  'modified': boolean;
}

type ColorMode = 'fourDStatus' | 'customer' | 'powerConsumption';

interface BIMStore {
  sites: Site[];
  currentSite: Site | null;
  selectedEquipmentId: string | null;
  layerVisibility: LayerVisibility;
  colorMode: ColorMode;
  colorScheme: ColorScheme;
  buildingVisible: boolean;
  
  loadSites: () => void;
  selectSite: (siteId: string) => void;
  selectEquipment: (equipmentId: string | null) => void;
  toggleLayer: (status: FourDStatus) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleBuilding: () => void;
  
  addEquipment: (equipment: BIMEquipment) => void;
  removeEquipment: (equipmentId: string) => void;
  updateEquipmentStatus: (equipmentId: string, status: FourDStatus) => void;
  moveEquipment: (equipmentId: string, newRackId: string, newRackUnit: number) => void;
  
  applyDesignChanges: () => void;
  refreshSite: () => void;
}

export const useBIMStore = create<BIMStore>()(
  persist(
    (set, get) => ({
      sites: [],
      currentSite: null,
      selectedEquipmentId: null,
      layerVisibility: {
        'existing-retained': true,
        'existing-removed': true,
        'proposed': true,
        'future': true,
        'modified': true,
      },
      colorMode: 'fourDStatus',
      colorScheme: DEFAULT_COLOR_SCHEME,
      buildingVisible: true,

      loadSites: () => {
        // Only generate sites if they don't exist
        const existingSites = get().sites;
        if (existingSites.length === 0) {
          const sites = generateSyntheticSites();
          set({ sites });
        }
      },

  selectSite: (siteId: string) => {
    const site = get().sites.find(s => s.id === siteId);
    set({ currentSite: site, selectedEquipmentId: null });
  },

  selectEquipment: (equipmentId: string | null) => {
    set({ selectedEquipmentId: equipmentId });
  },

  toggleLayer: (status: FourDStatus) => {
    set(state => ({
      layerVisibility: {
        ...state.layerVisibility,
        [status]: !state.layerVisibility[status]
      }
    }));
  },

  setColorMode: (mode: ColorMode) => {
    set({ colorMode: mode });
  },

  toggleBuilding: () => {
    set(state => ({ buildingVisible: !state.buildingVisible }));
  },

  addEquipment: (equipment: BIMEquipment) => {
    set(state => {
      if (!state.currentSite) return state;
      
      const updatedSite = {
        ...state.currentSite,
        equipment: [...state.currentSite.equipment, equipment]
      };
      
      const updatedSites = state.sites.map(site =>
        site.id === updatedSite.id ? updatedSite : site
      );
      
      return {
        sites: updatedSites,
        currentSite: updatedSite
      };
    });
  },

  removeEquipment: (equipmentId: string) => {
    set(state => {
      if (!state.currentSite) return state;
      
      const equipment = state.currentSite.equipment.find(e => e.id === equipmentId);
      if (!equipment) return state;
      
      const updatedEquipment = state.currentSite.equipment.map(e =>
        e.id === equipmentId
          ? { ...e, fourDStatus: 'existing-removed' as FourDStatus }
          : e
      );
      
      const updatedSite = {
        ...state.currentSite,
        equipment: updatedEquipment
      };
      
      const updatedSites = state.sites.map(site =>
        site.id === updatedSite.id ? updatedSite : site
      );
      
      return {
        sites: updatedSites,
        currentSite: updatedSite
      };
    });
  },

  updateEquipmentStatus: (equipmentId: string, status: FourDStatus) => {
    set(state => {
      if (!state.currentSite) return state;
      
      const updatedEquipment = state.currentSite.equipment.map(e =>
        e.id === equipmentId ? { ...e, fourDStatus: status } : e
      );
      
      const updatedSite = {
        ...state.currentSite,
        equipment: updatedEquipment
      };
      
      const updatedSites = state.sites.map(site =>
        site.id === updatedSite.id ? updatedSite : site
      );
      
      return {
        sites: updatedSites,
        currentSite: updatedSite
      };
    });
  },

  moveEquipment: (equipmentId: string, newRackId: string, newRackUnit: number) => {
    set(state => {
      if (!state.currentSite) return state;
      
      const equipment = state.currentSite.equipment.find(e => e.id === equipmentId);
      const newRack = state.currentSite.racks.find(r => r.id === newRackId);
      
      if (!equipment || !newRack) return state;
      
      const updatedEquipment = state.currentSite.equipment.map(e =>
        e.id === equipmentId
          ? {
              ...e,
              previousPosition: e.position,
              position: {
                x: newRack.position.x,
                y: (newRackUnit - 1) * 0.0445 + 0.5,
                z: newRack.position.z
              },
              rackId: newRackId,
              rackUnit: newRackUnit,
              fourDStatus: 'modified' as FourDStatus
            }
          : e
      );
      
      const updatedSite = {
        ...state.currentSite,
        equipment: updatedEquipment
      };
      
      const updatedSites = state.sites.map(site =>
        site.id === updatedSite.id ? updatedSite : site
      );
      
      return {
        sites: updatedSites,
        currentSite: updatedSite
      };
    });
  },

  applyDesignChanges: () => {
    set(state => {
      if (!state.currentSite) return state;
      
      const updatedEquipment = state.currentSite.equipment
        .filter(e => e.fourDStatus !== 'existing-removed')
        .map(e => {
          if (e.fourDStatus === 'proposed') {
            return { ...e, fourDStatus: 'existing-retained' as FourDStatus, installDate: new Date().toISOString().split('T')[0] };
          }
          if (e.fourDStatus === 'modified') {
            return { ...e, fourDStatus: 'existing-retained' as FourDStatus, previousPosition: undefined };
          }
          return e;
        });
      
      const updatedSite = {
        ...state.currentSite,
        equipment: updatedEquipment
      };
      
      const updatedSites = state.sites.map(site =>
        site.id === updatedSite.id ? updatedSite : site
      );
      
      return {
        sites: updatedSites,
        currentSite: updatedSite
      };
    });
  },

  refreshSite: () => {
    const currentSiteId = get().currentSite?.id;
    if (currentSiteId) {
      get().selectSite(currentSiteId);
    }
  }
}),
    {
      name: 'bim-storage', // localStorage key
      partialize: (state) => ({
        // Only persist sites and layer visibility, not current selections
        sites: state.sites,
        layerVisibility: state.layerVisibility,
        colorMode: state.colorMode,
        buildingVisible: state.buildingVisible,
      })
    }
  )
);