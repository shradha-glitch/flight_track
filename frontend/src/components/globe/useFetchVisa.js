import { useState, useEffect } from "react";

const useFetchVisa = (countryCode) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!countryCode) return;

    const fetchVisa = async () => {
      try {
        const response = await fetch(`https://flight-track.onrender.com/api/visa/${countryCode}`);
        if (!response.ok) throw new Error("Network response did not work");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(`Fetching visa data for ${countryCode} failed:`, error);
        setData(null);
      }
    };

    fetchVisa();
  }, [countryCode]);

  return data;
};

export default useFetchVisa;
