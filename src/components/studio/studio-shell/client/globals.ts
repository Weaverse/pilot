export type StudioTab = { href: string; inner: string }

declare global {
  interface Window {
    // IDE-like editor tab list — persists across SPA nav, resets on full reload.
    __leohuynhTabs?: StudioTab[]
    // Folder open/closed state, keyed by folder id.
    __leohuynhFolders?: Record<string, boolean>
    // Guards the document-level version-menu listeners to bind only once.
    __leohuynhVersionMenuBound?: boolean
    // Guards the document-level nav-pending transition listeners to bind only once.
    __leohuynhNavPendingBound?: boolean
    // Guards delegated mobile-panel and viewport listeners to bind only once.
    __leohuynhMobilePanelsBound?: boolean
    // Returns focus to the control that opened the active mobile panel.
    __leohuynhMobilePanelTrigger?: HTMLElement
  }
}
