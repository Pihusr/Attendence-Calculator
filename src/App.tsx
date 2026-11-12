import AppShell from './components/AppShell';
import { StoreProvider } from './state/store';
import './styles/tokens.css';
import './styles/layout.css';
import './styles/settings.css';
import './styles/main.css';

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
