import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/template';
import { dataService } from '@/services/dataService';

interface Institute {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Batch {
  id: string;
  name: string;
  class_level: string;
  exam_type: string;
  description: string | null;
}

interface UserProfile {
  id: string;
  username: string | null;
  email: string;
  total_xp: number;
  selected_institute_id: string | null;
  selected_batch_id: string | null;
}

interface AppContextType {
  institutes: Institute[];
  batches: Batch[];
  selectedInstitute: Institute | null;
  selectedBatch: Batch | null;
  userProfile: UserProfile | null;
  totalXP: number;
  loading: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
  selectInstitute: (instituteId: string) => Promise<void>;
  selectBatch: (batchId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const THEME_KEY = '@material_hub_theme';

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
    loadInitialData();
  }, [user]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const loadInitialData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: institutesData } = await dataService.getInstitutes();
    if (institutesData) setInstitutes(institutesData);

    const { data: profileData } = await dataService.getUserProfile(user.id);
    if (profileData) {
      setUserProfile(profileData);
      setTotalXP(profileData.total_xp || 0);

      if (profileData.selected_institute_id) {
        const institute = institutesData?.find(i => i.id === profileData.selected_institute_id);
        setSelectedInstitute(institute || null);

        if (institute) {
          const { data: batchesData } = await dataService.getBatchesByInstitute(institute.id);
          if (batchesData) {
            setBatches(batchesData);
            
            if (profileData.selected_batch_id) {
              const batch = batchesData.find(b => b.id === profileData.selected_batch_id);
              setSelectedBatch(batch || null);
            }
          }
        }
      }
    }

    setLoading(false);
  };

  const selectInstitute = async (instituteId: string) => {
    if (!user) return;

    const institute = institutes.find(i => i.id === instituteId);
    if (!institute) return;

    setSelectedInstitute(institute);
    setSelectedBatch(null);

    const { data: batchesData } = await dataService.getBatchesByInstitute(instituteId);
    if (batchesData) setBatches(batchesData);

    await dataService.updateUserProfile(user.id, {
      selected_institute_id: instituteId,
      selected_batch_id: null,
    });
  };

  const selectBatch = async (batchId: string) => {
    if (!user) return;

    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    setSelectedBatch(batch);

    await dataService.updateUserProfile(user.id, {
      selected_batch_id: batchId,
    });
  };

  const refreshProfile = async () => {
    if (!user) return;

    const { data: profileData } = await dataService.getUserProfile(user.id);
    if (profileData) {
      setUserProfile(profileData);
      setTotalXP(profileData.total_xp || 0);
    }
  };

  return (
    <AppContext.Provider
      value={{
        institutes,
        batches,
        selectedInstitute,
        selectedBatch,
        userProfile,
        totalXP,
        loading,
        isDarkMode,
        toggleTheme,
        selectInstitute,
        selectBatch,
        refreshProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
