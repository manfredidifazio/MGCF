<<<<<<< HEAD
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AmountVisibilityProvider } from "./context/AmountVisibilityContext";
import MainLayout from "./layouts/MainLayout";
import AccountingPage from "./pages/accounting/AccountingPage";
import AccountingOverviewPage from "./pages/accounting/AccountingOverviewPage";
import AccreditsPage from "./pages/accounting/AccreditsPage";
import StatementsPage from "./pages/accounting/StatementsPage";
import AccountStatementPage from "./pages/accounting/AccountStatementPage";
import BalancesPage from "./pages/accounting/BalancesPage";
import ResocontoContabilePage from "./pages/accounting/ResocontoContabilePage";
import ManagedItemDetailPage from "./pages/catalog/ManagedItemDetailPage";
import Dashboard from "./pages/dashboard/Dashboard";
import LoginPage from "./pages/login/LoginPage";
import SecurityPage from "./pages/security/SecurityPage";
import SettingsPage from "./pages/settings/SettingsPage";
import CatalogSettingsPage from "./pages/settings/CatalogSettingsPage";
import AccountsPage from "./pages/settings/accounts/AccountsPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProfilePage from "./pages/profile/ProfilePage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import VerifyEmailPage from "./pages/login/VerifyEmailPage";
import ResetPasswordPage from "./pages/login/ResetPasswordPage";
import UserMenuPage from "./pages/user/UserMenuPage";

export default function App() {
  return (
    <AmountVisibilityProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-menu" element={<UserMenuPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/accounts" element={<AccountsPage />} />
          <Route path="/settings/taxes" element={<CatalogSettingsPage type="tax" />} />
          <Route path="/settings/properties" element={<CatalogSettingsPage type="property" />} />
          <Route path="/settings/vehicles" element={<CatalogSettingsPage type="vehicle" />} />
          <Route path="/settings/causes" element={<CatalogSettingsPage type="cause" />} />
          <Route path="/taxes/:id" element={<ManagedItemDetailPage type="tax" />} />
          <Route path="/properties/:id" element={<ManagedItemDetailPage type="property" />} />
          <Route path="/vehicles/:id" element={<ManagedItemDetailPage type="vehicle" />} />
          <Route path="/accounting" element={<AccountingOverviewPage />} />
          <Route path="/accounting/accredits" element={<AccreditsPage />} />
          <Route path="/accounting/statements" element={<StatementsPage />} />
          <Route path="/accounting/statements/:accountId" element={<AccountStatementPage />} />
          <Route path="/accounting/balances" element={<BalancesPage />} />
          <Route path="/accounting/resoconto-contabile" element={<ResocontoContabilePage />} />
          <Route path="/accounting/reports" element={<AccountingPage section="reports" title="Resoconto contabile" />} />
          <Route path="/fiscal/reports" element={<AccountingPage section="fiscalReports" title="Resoconto fiscale" />} />
        </Route>
        </Routes>
      </BrowserRouter>
    </AmountVisibilityProvider>
  );
}
=======
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
>>>>>>> be18514bd3ce3df5b6c06f1d6295b5405dc90d3d
