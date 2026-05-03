// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EmailPage from './pages/EmailPage.jsx';
import DiscordCallback from './pages/DiscordCallback.jsx';
import PublicServers from './pages/PublicServers.jsx';
import Commands from './pages/Commands.jsx';
import Help from './pages/Help.jsx';
import Status from './pages/Status.jsx';
import CommandHistory from './pages/CommandHistory.jsx';
function App() {
  const { loading } = useAuth();
  if (loading) return <div><p>Chargement...</p></div>;
  return (
    <Routes>
      {/* Routes AVEC Header + Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/public-servers" element={<PublicServers />} />
        <Route path="/commands" element={<Commands />} />
        <Route path="/help" element={<Help />} />
        <Route path="/status" element={<Status />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/email" element={
          <PrivateRoute><EmailPage /></PrivateRoute>
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
  );
}
export default App;