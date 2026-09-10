import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Pools from './pages/Pools';
import MyBets from './pages/MyBets';
import Claim from './pages/Claim';
import PlayDesk from './pages/PlayDesk';
import CustomToaster from './components/common/CustomToaster';

function App() {
  return (
    <BrowserRouter>
      <CustomToaster />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pools" element={<Pools />} />
          <Route path="/playdesk" element={<PlayDesk />} />
          <Route path="/mybets" element={<MyBets />} />
          <Route path="/claim" element={<Claim />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
