// App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Home from './pages/Home.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

// Pages chargées à la demande : le premier chargement du site est plus léger
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const EmailPage = lazy(() => import('./pages/EmailPage.jsx'));
const DiscordCallback = lazy(() => import('./pages/DiscordCallback.jsx'));
const PublicServers = lazy(() => import('./pages/PublicServers.jsx'));
const Status = lazy(() => import('./pages/Status.jsx'));
const CommandHistory = lazy(() => import('./pages/CommandHistory.jsx'));
const GuildConfig = lazy(() => import('./pages/GuildConfig.jsx'));
const Feedback = lazy(() => import('./pages/Feedback.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Docs = lazy(() => import('./pages/Docs.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen fullScreen />;
  return (
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
      </Route>
      {/* Routes SANS Header (plein écran) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/discord/callback" element={<DiscordCallback />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </Suspense>
  );
}
export default App;