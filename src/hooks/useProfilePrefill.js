import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { getProfile } from '../services/profileService';

// When user signs in, pre-fill name/birthdate/birthtime from their saved profile.
// Shared by both the web layout and the native (Android) tab-bar shell.
export function useProfilePrefill() {
  const { user } = useAuth();
  const { setUserDetails } = useUser();

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then(profile => {
      if (!profile) return;
      setUserDetails(prev => ({
        ...prev,
        name:      profile.name      || prev.name,
        birthdate: profile.birthdate || prev.birthdate,
        birthtime: profile.birthtime || prev.birthtime,
        birthCity: profile.birthCity || prev.birthCity,
        birthLat:  profile.birthLat  ?? prev.birthLat,
        birthLon:  profile.birthLon  ?? prev.birthLon,
      }));
    }).catch(() => {});
  }, [user, setUserDetails]);
}
