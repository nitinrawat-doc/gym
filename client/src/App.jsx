import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import Members     from './pages/Members';
import AddMember   from './pages/AddMember';
import MemberDetail from './pages/MemberDetail';
import EditMember  from './pages/EditMember';
import Layout      from './components/Layout';

function PrivateRoute({ children }) {
  const { trainer, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050d1a]">
        <div className="text-blue-400 text-sm">Loading...</div>
      </div>
    );
  }
  return trainer ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index              element={<Dashboard />} />
            <Route path="members"    element={<Members />} />
            <Route path="members/add" element={<AddMember />} />
            <Route path="members/:id" element={<MemberDetail />} />
            <Route path="members/:id/edit" element={<EditMember />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
