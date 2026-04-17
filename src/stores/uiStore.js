import { create } from 'zustand'

export const useUIStore = create((set) => ({
  isUploadOpen: false,
  isUploadModalOpen: false,
  isCreditModalOpen: false,
  isChatPanelOpen: true,
  isLeftExpanded: true,
  isChartMode: false,
  gmailSyncPhase: 'idle',
  gmailSyncStatus: '',
  lastGmailSyncAt: null,

  openUpload: () => set({ isUploadOpen: true, isUploadModalOpen: true }),
  closeUpload: () => set({ isUploadOpen: false, isUploadModalOpen: false }),
  openUploadModal: () => set({ isUploadOpen: true, isUploadModalOpen: true }),
  closeUploadModal: () => set({ isUploadOpen: false, isUploadModalOpen: false }),
  openCreditModal: () => set({ isCreditModalOpen: true }),
  closeCreditModal: () => set({ isCreditModalOpen: false }),
  openChatPanel: () => set({ isChatPanelOpen: true }),
  closeChatPanel: () => set({ isChatPanelOpen: false }),

  openVizMode: () => set({ isLeftExpanded: false, isChartMode: true }),
  restoreTrinityMode: () => set({ isLeftExpanded: true, isChartMode: false }),
  setGmailSyncState: (phase, status = '') =>
    set({
      gmailSyncPhase: phase || 'idle',
      gmailSyncStatus: status || '',
    }),
  setGmailSyncStatus: (status) =>
    set({
      gmailSyncStatus: status || '',
      gmailSyncPhase: status ? 'reading' : 'idle',
    }),
  setLastGmailSyncAt: (timestamp) => set({ lastGmailSyncAt: timestamp || null }),
}))
