import React, { PropsWithChildren } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Discovery from './pages/Discovery';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Events from './pages/Events';
import Connections from './pages/Connections';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

const RequireAuth: React.FC<PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={
                <RequireAuth>
                    <Layout />
                </RequireAuth>
            }>
                <Route index element={<Home />} />
                <Route path="discovery" element={<Discovery />} />
                <Route path="events" element={<Events />} />
                <Route path="connections" element={<Connections />} />
                <Route path="groups" element={<Groups />} />
                <Route path="groups/:groupId" element={<GroupDetails />} />
                <Route path="messages" element={<Messages />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/:userId" element={<PublicProfile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
};

const App = () => {
  return (
    <HashRouter>
        <AuthProvider>
            <DataProvider>
                <AppRoutes />
            </DataProvider>
        </AuthProvider>
    </HashRouter>
  );
};

export default App;