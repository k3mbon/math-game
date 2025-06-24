import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const DashboardRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'guest';

      if (role === 'teacher') navigate('/teacher');
      else if (role === 'student') navigate('/iteration');
      else navigate('/');
    });

    return () => unsubscribe();
  }, [navigate]);

  return <div>🔄 Redirecting to your dashboard...</div>;
};

export default DashboardRedirect;
