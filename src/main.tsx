import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store";
import App from "./App.tsx";
import "./index.css";

const PersistLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={<PersistLoader />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
