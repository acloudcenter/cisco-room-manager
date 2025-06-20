import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import SettingsPage from "@/pages/settings";
import TestConnectionPage from "@/pages/test-connection";
import DeviceStatusPage from "@/pages/device-status";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<SettingsPage />} path="/settings" />
      <Route element={<TestConnectionPage />} path="/test" />
      <Route element={<DeviceStatusPage />} path="/status" />
    </Routes>
  );
}

export default App;
