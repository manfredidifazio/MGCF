import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Accrediti from "./pages/Accrediti";
import EstrattoConti from "./pages/EstrattoConti";
import SaldoConti from "./pages/SaldoConti";
import ResocontoContabile from "./pages/ResocontoContabile";
import SpeseTasse from "./pages/SpeseTasse";
import SpeseImmobili from "./pages/SpeseImmobili";
import SpeseAutomobili from "./pages/SpeseAutomobili";
import StampaResoconti from "./pages/StampaResoconti";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route
          path="/accrediti"
          element={
            <MainLayout>
              <Accrediti />
            </MainLayout>
          }
        />

        <Route
          path="/estratto-conti"
          element={
            <MainLayout>
              <EstrattoConti />
            </MainLayout>
          }
        />

        <Route
          path="/saldo-conti"
          element={
            <MainLayout>
              <SaldoConti />
            </MainLayout>
          }
        />

        <Route
          path="/resoconto-contabile"
          element={
            <MainLayout>
              <ResocontoContabile />
            </MainLayout>
          }
        />

        <Route
          path="/spese-tasse"
          element={
            <MainLayout>
              <SpeseTasse />
            </MainLayout>
          }
        />

        <Route
          path="/spese-immobili"
          element={
            <MainLayout>
              <SpeseImmobili />
            </MainLayout>
          }
        />

        <Route
          path="/spese-automobili"
          element={
            <MainLayout>
              <SpeseAutomobili />
            </MainLayout>
          }
        />

        <Route
          path="/stampa-resoconti"
          element={
            <MainLayout>
              <StampaResoconti />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}