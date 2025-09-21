import React, { useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { 
  WavingHand, 
  MenuBook, 
  Repeat, 
  Numbers, 
  Person, 
  Logout,
  HourglassTop 
} from '@mui/icons-material';
import './DashboardPage.css';

const DashboardPage = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'guest';
      setRole(role);
      setLoading(false);
    };

    fetchRole();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="dashboard-loading"><HourglassTop sx={{ color: 'var(--primary-400)', mr: 1 }} /> Loading Dashboard...</div>;

  return (
    <div className="dashboard-page">
      <h2><WavingHand sx={{ color: 'var(--primary-400)', mr: 1 }} /> Welcome to the Dashboard!</h2>
      <p>Your role: <strong>{role}</strong></p>

      <div className="dashboard-actions">
        {role === 'teacher' && (
          <button onClick={() => navigate('/teacher')}><MenuBook sx={{ color: 'white', mr: 1 }} /> Go to Problem Manager</button>
        )}
        {role === 'student' && (
          <>
            <button onClick={() => navigate('/iteration')}><Repeat sx={{ color: 'white', mr: 1 }} /> Iteration Page</button>
            <button onClick={() => navigate('/numeration')}><Numbers sx={{ color: 'white', mr: 1 }} /> Numeration Page</button>
          </>
        )}
        {role === 'guest' && (
          <p><Person sx={{ color: 'var(--primary-400)', mr: 1 }} /> Guest access limited — please login for more features.</p>
        )}
      </div>

      <button className="logout-btn" onClick={handleLogout}><Logout sx={{ color: 'white', mr: 1 }} /> Logout</button>
    </div>
  );
};

export default DashboardPage;
