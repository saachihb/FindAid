import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/colleges";

function App() {
  const [displayedUniversities, setDisplayedUniversities] = useState([]);
  const [remainingUniversities, setRemainingUniversities] = useState([]);
  const [savedUniversities, setSavedUniversities] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const initialDisplayed = data.slice(0, 3);
        const remaining = data.slice(3);
        setDisplayedUniversities(initialDisplayed);
        setRemainingUniversities(remaining);
      })
      .catch((err) => console.error("Error fetching colleges:", err));
  }, []);

  const saveUniversity = (name) => {
    if (!savedUniversities.includes(name)) {
      setSavedUniversities([...savedUniversities, name]);

      const newDisplayed = displayedUniversities.filter((uni) => uni.name !== name);
      let newRemaining = [...remainingUniversities];

      if (newRemaining.length > 0) {
        newDisplayed.push(newRemaining[0]);
        newRemaining = newRemaining.slice(1);
      }

      setDisplayedUniversities(newDisplayed);
      setRemainingUniversities(newRemaining);

      fetch("http://localhost:8080/save_college", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: "user123",
          college_name: name
        })
      });
    }
  };

  const skipUniversity = (name) => {
    const skippedUni = displayedUniversities.find((uni) => uni.name === name);
    const newDisplayed = displayedUniversities.filter((uni) => uni.name !== name);
    let newRemaining = [...remainingUniversities];

    if (newRemaining.length > 0) {
      newDisplayed.push(newRemaining[0]);
      newRemaining = newRemaining.slice(1);
    }

    newRemaining.push(skippedUni);
    setDisplayedUniversities(newDisplayed);
    setRemainingUniversities(newRemaining);
  };

  const removeUniversity = (name) => {
    setSavedUniversities(savedUniversities.filter((uni) => uni !== name));

    const removedUni = [...displayedUniversities, ...remainingUniversities].find(
      (uni) => uni.name === name
    );

    if (removedUni && !displayedUniversities.some((uni) => uni.name === name)) {
      setRemainingUniversities([...remainingUniversities, removedUni]);
    }
  };

  return (
    <div className="container">
      <div className="top-half">
        {displayedUniversities.map((uni) => (
          <div key={uni.name} className="university">
            <h1>
              <a href={uni.school_url || "#"} target="_blank" rel="noopener noreferrer">
                {uni.name}
              </a>
            </h1>
            <h3>{uni.location} • {uni.public_private} • {uni.degree_type}</h3>
            <h4>
              <a href={uni.average_net_price_pub || uni.price_calculator_url} target="_blank" rel="noopener noreferrer">
                Net Price Calculator
              </a>
            </h4>
            <ul>
              <li>🔍&nbsp;<strong>Acceptance Rate:</strong> {uni.admission_rate}</li>
              <li>🔍&nbsp;<strong># of Undergraduate Students:</strong> {uni.number_of_undergraduate_students}</li>
              <li>🔍&nbsp;<strong>Average Annual Cost after Aid:</strong> ${uni.average_cost_of_attendance}</li>
              <li>🔍&nbsp;<strong>% Receiving Federal Loans:</strong> {uni.percent_of_undergraduates_receiving_federal_loans}</li>
              <li>🔍&nbsp;<strong>% Pell Students:</strong> {uni.percent_of_pell_students}</li>
              <li>🔍&nbsp;<strong>Median Debt:</strong> ${uni.cumulative_median_student_debt}</li>
            </ul>
            <div className="button-group">
              <button onClick={() => saveUniversity(uni.name)}>Save</button>
              <button onClick={() => skipUniversity(uni.name)}>Skip</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-half">
        <h2>Saved Universities</h2>
        <ul>
          {savedUniversities.map((uni) => (
            <li key={uni} onClick={() => removeUniversity(uni)} className="saved-item">
              {uni}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
