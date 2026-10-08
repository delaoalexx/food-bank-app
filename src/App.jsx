import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import NetworkInventory from "./pages/NetworkInventory";
import Request from "./pages/requests/Request";
import Donation from "./pages/donations/donation";
import Beneficiary from "./pages/beneficiaries/Beneficiaries";
import History from "./pages/History";

function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/inventory"
          element={<Inventory />}
        />

        <Route
          path="/network"
          element={<NetworkInventory />}
        />

        <Route
          path="/requests"
          element={<Request />}
        />
        <Route
         path="/donations"
         element={<Donation />}
        />
        <Route
         path="/beneficiaries"
         element={<Beneficiary />}
        />
        <Route
          path="/history"
          element={<History />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;