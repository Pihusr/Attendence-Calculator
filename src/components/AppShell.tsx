import { useStore } from '../state/store';
import MainPanel from './main/MainPanel';
import Sidebar from './sidebar/Sidebar';

export default function AppShell() {
  const { state, toggleSidebar } = useStore();
  return (
    <div className={`app-shell${state.sidebarOpen ? '' : ' sidebar-is-closed'}`}>
      {!state.sidebarOpen && (
        <button className="mobile-menu-button" type="button" onClick={toggleSidebar} aria-label="Open settings">
          Settings
        </button>
      )}
      <Sidebar />
      <MainPanel />
      {state.sidebarOpen && <button className="mobile-backdrop" type="button" aria-label="Close settings" onClick={toggleSidebar} />}
    </div>
  );
}
