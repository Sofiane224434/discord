// App.jsx
import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Home from './pages/Home.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { lazyPage } from './utils/lazyPage.js';
import ForcePasswordChange from './components/ForcePasswordChange.jsx';

// Pages chargées à la demande : le premier chargement du site est plus léger
const Login = lazyPage(() => import('./pages/Login.jsx'));
const Register = lazyPage(() => import('./pages/Register.jsx'));
const Dashboard = lazyPage(() => import('./pages/Dashboard.jsx'));
const EmailPage = lazyPage(() => import('./pages/EmailPage.jsx'));
const DiscordCallback = lazyPage(() => import('./pages/DiscordCallback.jsx'));
const PublicServers = lazyPage(() => import('./pages/PublicServers.jsx'));
const Status = lazyPage(() => import('./pages/Status.jsx'));
const CommandHistory = lazyPage(() => import('./pages/CommandHistory.jsx'));
const GuildConfig = lazyPage(() => import('./pages/GuildConfig.jsx'));
const Feedback = lazyPage(() => import('./pages/Feedback.jsx'));
const Settings = lazyPage(() => import('./pages/Settings.jsx'));
const Docs = lazyPage(() => import('./pages/Docs.jsx'));
const Admin = lazyPage(() => import('./pages/Admin.jsx'));
const Privacy = lazyPage(() => import('./pages/Privacy.jsx'));
const Legal = lazyPage(() => import('./pages/Legal.jsx'));
const NotFound = lazyPage(() => import('./pages/NotFound.jsx'));

function App() {
  const { loading, user } = useAuth();
  if (loading) return <LoadingScreen fullScreen />;
  // Mot de passe trop faible (règle rétroactive) : à changer avant tout le reste
  if (user?.mustChangePassword) return <ForcePasswordChange />;
  return (
    <ErrorBoundary>
    <Suspense fallback={<LoadingScreen fullScreen />}>
    <Routes>
      {/* Routes AVEC Header + Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/public-servers" element={<PublicServers />} />
        <Route path="/bots" element={<PublicServers />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/accueil" element={<Docs />} />
        <Route path="/docs/:slug" element={<Docs />} />
        <Route path="/modules" element={<Navigate to="/docs/accueil" replace />} />
        <Route path="/commands" element={<Navigate to="/docs/commandes" replace />} />
        <Route path="/help" element={<Navigate to="/docs/faq" replace />} />
        <Route path="/faq" element={<Navigate to="/docs/faq" replace />} />
        <Route path="/status" element={<Status />} />
        <Route path="/confidentialite" element={<Privacy />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cgu" element={<Legal doc="cgu" />} />
        <Route path="/terms" element={<Legal doc="cgu" />} />
        <Route path="/mentions-legales" element={<Legal doc="mentions" />} />
        <Route path="/legal" element={<Legal doc="mentions" />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/parametres" element={<Settings />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/report" element={<Feedback />} />
        <Route path="/suggestions" element={<Feedback />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/dashboard/servers/:guildId/config" element={
          <PrivateRoute><GuildConfig /></PrivateRoute>
        } />
        <Route path="/email" element={
          <PrivateRoute><EmailPage /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute><Admin /></PrivateRoute>
        } />
        <Route path="/command-history" element={
          <PrivateRoute><CommandHistory /></PrivateRoute>
        } />
        {/* Adresse inconnue : page 404 avec l'en-tête et le pied de page du site */}
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* Routes SANS Header (plein écran) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/discord/callback" element={<DiscordCallback />} />
      </Route>
    </Routes>
    </Suspense>
    </ErrorBoundary>
  );
}
export default App;