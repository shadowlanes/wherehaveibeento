import { useState, useEffect } from 'react';

/**
 * Custom hook to load user travel data (flights and visits)
 * @param {string} username - Username from query parameter
 * @returns {Object} - { flights, airports, visits, loading, error }
 */
export const useUserData = (username) => {
  const [data, setData] = useState({
    flights: [],
    airports: {},
    visits: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Load airports data (common for all users)
        const airportsResponse = await fetch('/data/flights/airports.json');
        if (!airportsResponse.ok) throw new Error('Failed to load airports data');
        const airportsData = await airportsResponse.json();

        // Load user flight data
        let flightsData = [];
        try {
          const flightsResponse = await fetch(`/data/flights/${username}.json`);
          if (flightsResponse.ok) {
            flightsData = await flightsResponse.json();
          }
        } catch (err) {
          console.warn(`No flight data found for user: ${username}`);
        }

        // Load user visit data
        let visitsData = [];
        try {
          const visitsResponse = await fetch(`/data/visits/${username}_countriesTravelled.json`);
          if (visitsResponse.ok) {
            visitsData = await visitsResponse.json();
          }
        } catch (err) {
          console.warn(`No visit data found for user: ${username}`);
        }

        setData({
          flights: flightsData,
          airports: airportsData,
          visits: visitsData,
          loading: false,
          error: null
        });
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    if (username) {
      loadData();
    }
  }, [username]);

  return data;
};

/**
 * Extract username from URL query parameters
 * @param {string} defaultUser - Default username if not provided
 * @returns {string} - Username
 */
export const useUsername = (defaultUser = 'sd') => {
  const [username, setUsername] = useState(defaultUser);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      setUsername(userParam);
    }
  }, []);

  return username;
};
