import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Site, BIMEquipment, FourDStatus, ColorScheme } from '../types/bim';
import { DEFAULT_COLOR_SCHEME } from '../types/bim';
import { generateSyntheticSites } from '../data/syntheticData';

// Increment this to invalidate old cached data in localStorage (e.g., stale rack labels).
const STORE_VERSION = 2;

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
  // Temporary move preview state (used to highlight target units in 3D while planning a move)
  movePreview: {
    equipmentId: string;
    targetRackId: string;
    targetRackUnit: number;
    // Optional hint from UI validation; viewer can still recompute if absent.
    hasConflict?: boolean;
  } | null;
  layerVisibility: LayerVisibility;
  colorMode: ColorMode;
  colorScheme: ColorScheme;
  buildingVisible: boolean;
  
  loadSites: () => void;
  selectSite: (siteId: string) => void;
  selectEquipment: (equipmentId: string | null) => void;
  setMovePreview: (preview: BIMStore['movePreview']) => void;
  toggleLayer: (status: FourDStatus) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleBuilding: () => void;
  
  addEquipment: (equipment: BIMEquipment) => void;
  removeEquipment: (equipmentId: string) => void;
  updateEquipmentStatus: (equipmentId: string, status: FourDStatus) => void;
  // Plans a move (does not immediately relocate). Apply Design Changes commits the move.
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
      movePreview: null,
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
    // Clear move preview on selection changes
    set({ selectedEquipmentId: equipmentId, movePreview: null });
  },

  setMovePreview: (preview) => {
    set({ movePreview: preview });
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

      const updatedEquipment = state.currentSite.equipment.map(e => {
        if (e.id !== equipmentId) return e;

        const next: any = { ...e, fourDStatus: status };

        // If this equipment has a planned move, preserve the SOURCE snapshot.
        // Status changes should not rebase/overwrite the origin location.
        if (e.plannedMove) {
          next.previousPosition = e.previousPosition ?? e.position;

          // If the user changes the 4D status away from "modified" (move workflow),
          // drop the planned destination so we don't keep showing a move arrow for
          // equipment that is no longer being moved.
          if (status !== 'modified') {
            next.plannedMove = undefined;
          }
        }

        return next;
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
        currentSite: updatedSite,
        // Keep selection even if status becomes 'existing-removed'.
        // Equipment should be removed only when the user clicks Apply Design Changes.
        selectedEquipmentId: state.selectedEquipmentId,
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
              // Store the plan; viewer will use movePreview to display target.
              // Location and status remain editable until Apply Design Changes.
              plannedMove: {
                targetRackId: newRackId,
                targetRackUnit: newRackUnit,
              },
              // Keep a snapshot of the origin so Apply can set a baseline history.
              previousPosition: e.previousPosition ?? e.position,
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
      
      // Apply changes without deleting items.
      // Apply should ONLY save data.
      // - proposed stays proposed
      // - plannedMove commits the relocation (location), but does NOT force a status change
      // - existing-removed remains as-is (visual/removal planning), not deleted
      const updatedEquipment = state.currentSite.equipment.map(e => {
        // Commit planned moves (and treat them as a "modified" action that becomes the new baseline)
        if ((e as any).plannedMove) {
          const plannedMove = (e as any).plannedMove as { targetRackId: string; targetRackUnit: number };
          const newRack = state.currentSite?.racks.find(r => r.id === plannedMove.targetRackId);
          if (!newRack) {
            return { ...(e as any), plannedMove: undefined };
          }

          return {
            ...(e as any),
            rackId: plannedMove.targetRackId,
            rackUnit: plannedMove.targetRackUnit,
            position: {
              x: newRack.position.x,
              y: (plannedMove.targetRackUnit - 1) * 0.0445 + 0.5,
              z: newRack.position.z,
            },
            plannedMove: undefined,
            // Keep whatever status the user selected (e.g., proposed/future/existing-retained/etc)
            fourDStatus: e.fourDStatus,
            previousPosition: undefined,
          };
        }

        // Apply should not rewrite statuses.
        // Keep legacy 'modified' status as-is unless user changes it.

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
      version: STORE_VERSION,
      migrate: (persistedState: any, version) => {
        // If the persisted version is old, drop cached sites so fresh synthetic data is generated.
        if (version < STORE_VERSION) {
          return {
            ...persistedState,
            sites: [],
            currentSite: null,
            selectedEquipmentId: null,
          };
        }
        return persistedState;
      },
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