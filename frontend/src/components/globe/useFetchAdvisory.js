import { useEffect, useState } from "react";

const useFetchAdvisory = (country_code) => {
    const [data, setData] = useState(null);
      useEffect(() => {
        if (!country_code) return;

    const fetchAdvisory = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8001/api/advisory/${country_code}`);
        if (!response.ok) throw new Error("Network response did not work");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(`Fetching advisory data for ${country_code} failed:`, error);
        setData(null);
      }
    };
    fetchAdvisory();
  }, [country_code]);
  return data;
};

export default useFetchAdvisory;
