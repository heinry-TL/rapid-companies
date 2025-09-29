'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface Director {
  id: string;
  firstName: string;
  lastName: string;
  nationality: string;
  passportNumber: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    county: string;
    postcode: string;
    country: string;
  };
}

export interface Shareholder {
  id: string;
  firstName: string;
  lastName: string;
  nationality: string;
  passportNumber: string;
  sharePercentage: number;
  address: {
    line1: string;
    line2: string;
    city: string;
    county: string;
    postcode: string;
    country: string;
  };
}

export interface CompanyApplication {
  id: string;
  jurisdiction: {
    id: number;
    name: string;
    price: number;
    currency: string;
  };
  companyDetails: {
    proposedName: string;
    alternativeName: string;
    businessActivity: string;
    authorizedCapital: number;
    numberOfShares: number;
  };
  registeredAddress: {
    line1: string;
    line2: string;
    city: string;
    county: string;
    postcode: string;
    country: string;
    useContactAddress: boolean;
  };
  contactDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  directors: Director[];
  shareholders: Shareholder[];
  additionalServices: {
    id: string;
    name: string;
    price: number;
    currency: string;
  }[];
  stepCompleted: number;
  isComplete: boolean;
}

export interface StandaloneService {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
}

export interface PortfolioState {
  applications: CompanyApplication[];
  currentApplicationId: string | null;
  standaloneServices: StandaloneService[];
}

type PortfolioAction =
  | { type: 'ADD_APPLICATION'; payload: CompanyApplication }
  | { type: 'UPDATE_APPLICATION'; payload: { id: string; data: Partial<CompanyApplication> } }
  | { type: 'REMOVE_APPLICATION'; payload: string }
  | { type: 'SET_CURRENT_APPLICATION'; payload: string | null }
  | { type: 'ADD_DIRECTOR'; payload: { applicationId: string; director: Director } }
  | { type: 'UPDATE_DIRECTOR'; payload: { applicationId: string; directorId: string; data: Partial<Director> } }
  | { type: 'REMOVE_DIRECTOR'; payload: { applicationId: string; directorId: string } }
  | { type: 'ADD_SHAREHOLDER'; payload: { applicationId: string; shareholder: Shareholder } }
  | { type: 'UPDATE_SHAREHOLDER'; payload: { applicationId: string; shareholderId: string; data: Partial<Shareholder> } }
  | { type: 'REMOVE_SHAREHOLDER'; payload: { applicationId: string; shareholderId: string } }
  | { type: 'ADD_SERVICE'; payload: { applicationId: string; service: { id: string; name: string; price: number; currency: string } } }
  | { type: 'REMOVE_SERVICE'; payload: { applicationId: string; serviceId: string } }
  | { type: 'ADD_STANDALONE_SERVICE'; payload: StandaloneService }
  | { type: 'REMOVE_STANDALONE_SERVICE'; payload: string }
  | { type: 'CLEAR_PORTFOLIO' }
  | { type: 'LOAD_FROM_STORAGE'; payload: PortfolioState };

const initialState: PortfolioState = {
  applications: [],
  currentApplicationId: null,
  standaloneServices: [],
};

function portfolioReducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
  switch (action.type) {
    case 'ADD_APPLICATION': {
      // Prevent duplicate applications for the same jurisdiction
      const existing = state.applications.find(app => app.jurisdiction.id === action.payload.jurisdiction.id);
      if (existing) {
        return {
          ...state,
          currentApplicationId: existing.id,
        };
      }
      return {
        ...state,
        applications: [...state.applications, action.payload],
        currentApplicationId: action.payload.id,
      };
    }

    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.id
            ? { ...app, ...action.payload.data }
            : app
        ),
      };

    case 'REMOVE_APPLICATION':
      const newApplications = state.applications.filter(app => app.id !== action.payload);
      return {
        ...state,
        applications: newApplications,
        currentApplicationId: state.currentApplicationId === action.payload
          ? (newApplications.length > 0 ? newApplications[0].id : null)
          : state.currentApplicationId,
      };

    case 'SET_CURRENT_APPLICATION':
      return {
        ...state,
        currentApplicationId: action.payload,
      };

    case 'ADD_DIRECTOR':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.applicationId
            ? { ...app, directors: [...app.directors, action.payload.director] }
            : app
        ),
      };

    case 'UPDATE_DIRECTOR':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.applicationId
            ? {
              ...app,
              directors: app.directors.map(director =>
                director.id === action.payload.directorId
                  ? { ...director, ...action.payload.data }
                  : director
              ),
            }
            : app
        ),
      };

    case 'REMOVE_DIRECTOR':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.applicationId
            ? { ...app, directors: app.directors.filter(d => d.id !== action.payload.directorId) }
            : app
        ),
      };

    case 'ADD_SHAREHOLDER':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.applicationId
            ? { ...app, shareholders: [...app.shareholders, action.payload.shareholder] }
            : app
        ),
      };

    case 'UPDATE_SHAREHOLDER':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.applicationId
            ? {
              ...app,
              shareholders: app.shareholders.map(shareholder =>
                shareholder.id === action.payload.shareholderId
                  ? { ...shareholder, ...action.payload.data }
                  : shareholder
              ),
            }
            : app
        ),
      };

    case 'REMOVE_SHAREHOLDER':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.applicationId
            ? { ...app, shareholders: app.shareholders.filter(s => s.id !== action.payload.shareholderId) }
            : app
        ),
      };

    case 'ADD_SERVICE':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.applicationId
            ? { ...app, additionalServices: [...app.additionalServices, action.payload.service] }
            : app
        ),
      };

    case 'REMOVE_SERVICE':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.applicationId
            ? { ...app, additionalServices: app.additionalServices.filter(s => s.id !== action.payload.serviceId) }
            : app
        ),
      };

    case 'ADD_STANDALONE_SERVICE':
      return {
        ...state,
        standaloneServices: [...state.standaloneServices, action.payload],
      };

    case 'REMOVE_STANDALONE_SERVICE':
      return {
        ...state,
        standaloneServices: state.standaloneServices.filter(service => service.id !== action.payload),
      };

    case 'CLEAR_PORTFOLIO':
      return {
        applications: [],
        currentApplicationId: null,
        standaloneServices: [],
      };

    case 'LOAD_FROM_STORAGE':
      return {
        ...action.payload,
        standaloneServices: action.payload.standaloneServices || [],
      };

    default:
      return state;
  }
}

const PortfolioContext = createContext<{
  state: PortfolioState;
  dispatch: React.Dispatch<PortfolioAction>;
} | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('formationPortfolio');
      if (saved) {
        try {
          const parsedState = JSON.parse(saved);
          dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedState });
        } catch (error) {
          console.error('Failed to load portfolio from storage:', error);
        }
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('formationPortfolio', JSON.stringify(state));
    }
  }, [state]);

  return (
    <PortfolioContext.Provider value={{ state, dispatch }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}

// Helper functions
export function createEmptyDirector(): Director {
  return {
    id: Math.random().toString(36).substr(2, 9),
    firstName: '',
    lastName: '',
    nationality: '',
    passportNumber: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      county: '',
      postcode: '',
      country: 'United Kingdom',
    },
  };
}

export function createEmptyShareholder(): Shareholder {
  return {
    id: Math.random().toString(36).substr(2, 9),
    firstName: '',
    lastName: '',
    nationality: '',
    passportNumber: '',
    sharePercentage: 0,
    address: {
      line1: '',
      line2: '',
      city: '',
      county: '',
      postcode: '',
      country: 'United Kingdom',
    },
  };
}

export function createEmptyApplication(jurisdiction: { id: number; name: string; price: number; currency: string }): CompanyApplication {
  return {
    id: Math.random().toString(36).substr(2, 9),
    jurisdiction,
    companyDetails: {
      proposedName: '',
      alternativeName: '',
      businessActivity: '',
      authorizedCapital: 50000,
      numberOfShares: 50000,
    },
    registeredAddress: {
      line1: '',
      line2: '',
      city: '',
      county: '',
      postcode: '',
      country: 'United Kingdom',
      useContactAddress: false,
    },
    contactDetails: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        county: '',
        postcode: '',
        country: 'United Kingdom',
      },
    },
    directors: [createEmptyDirector()],
    shareholders: [createEmptyShareholder()],
    additionalServices: [],
    stepCompleted: 0,
    isComplete: false,
  };
}