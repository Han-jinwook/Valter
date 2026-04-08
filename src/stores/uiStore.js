import { create } from 'zustand'

export const useUIStore = create((set) => ({
  isUploadOpen: false,
  isCreditModalOpen: false,
  isChatPanelOpen: true,
  isLeftExpanded: true,
  isChartMode: false,

  openUpload: () => set({ isUploadOpen: true }),
  closeUpload: () => set({ isUploadOpen: false }),
  openCreditModal: () => set({ isCreditModalOpen: true }),
  closeCreditModal: () => set({ isCreditModalOpen: false }),
  openChatPanel: () => set({ isChatPanelOpen: true }),
  closeChatPanel: () => set({ isChatPanelOpen: false }),

  openVizMode: () => set({ isLeftExpanded: false, isChartMode: true }),
  restoreTrinityMode: () => set({ isLeftExpanded: true, isChartMode: false }),
}))
