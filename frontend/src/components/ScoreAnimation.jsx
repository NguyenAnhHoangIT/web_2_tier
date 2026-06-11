import React, { useState, useEffect } from "react";

export default function ScoreAnimation({ scoringResult, onClose }) {
  if (!scoringResult) return null;

  const { handType, finalChips, finalMult, totalScore, breakdown } = scoringResult;

  const [currentStep, setCurrentStep] = useState(0);
  const [chips, setChips] = useState(0);
  const [mult, setMult] = useState(0);
  const [tallyScore, setTallyScore] = useState(0);
  const [currentTrigger, setCurrentTrigger] = useState("Base Hand");
  const [isRolling, setIsRolling] = useState(false);
  const [isSlammed, setIsSlammed] = useState(false);

  useEffect(() => {
    // Start sequence
    if (breakdown && breakdown.length > 0) {
      // Step 0: Set base chips/mult
      const first = breakdown[0];
      setChips(first.chips || 0);
      setMult(first.mult || 0);
      setCurrentTrigger(first.source);
      
      let stepIndex = 1;
      const interval = setInterval(() => {
        if (stepIndex < breakdown.length) {
          const step = breakdown[stepIndex];
          setCurrentTrigger(step.source);
          
          if (step.chips) {
            setChips(step.chips);
          }
          if (step.mult) {
            setMult(step.mult);
          }
          
          // Apply changes incrementally if breakdown only contains delta
          if (step.type === "card-chips" || step.type === "chips") {
            const val = parseInt(step.value.replace("+", "")) || 0;
            setChips(prev => prev + val);
          } else if (step.type === "mult") {
            const val = parseInt(step.value.replace("+", "")) || 0;
            setMult(prev => prev + val);
          } else if (step.type === "xmult") {
            const val = parseFloat(step.value.replace("x", "")) || 1;
            setMult(prev => Math.floor(prev * val));
          }
          
          stepIndex++;
          setCurrentStep(stepIndex);
        } else {
          clearInterval(interval);
          // Start the roll-up tally!
          startTallyRollUp();
        }
      }, 750); // Speed of card/Joker trigger sequence

      return () => clearInterval(interval);
    } else {
      // No breakdown, go straight to roll-up
      setChips(finalChips);
      setMult(finalMult);
      startTallyRollUp();
    }
  }, [breakdown]);

  const startTallyRollUp = () => {
    setIsRolling(true);
    setCurrentTrigger("Calculating Total...");
    
    const finalProduct = finalChips * finalMult;
    let currentVal = 0;
    const duration = 1000; // 1 second rolling
    const stepTime = 30;
    const increment = Math.max(1, Math.floor(finalProduct / (duration / stepTime)));
    
    const rollTimer = setInterval(() => {
      currentVal += increment;
      if (currentVal >= finalProduct) {
        clearInterval(rollTimer);
        setTallyScore(finalProduct);
        setIsRolling(false);
        setIsSlammed(true);
      } else {
        setTallyScore(currentVal);
      }
    }, stepTime);
  };

  return (
    <div className={`scoring-overlay ${isSlammed && totalScore > 1000 ? "shake-effect" : ""}`}>
      
      {/* Hand Label */}
      <div 
        className="pixel-font"
        style={{
          fontSize: "1.5rem",
          color: "white",
          textShadow: "2px 2px 0px #000, 0 0 10px var(--chip-blue)",
          animation: "pulse-glow 1.5s infinite alternate"
        }}
      >
        {handType.toUpperCase()}
      </div>

      {/* Trigger Label */}
      <div 
        style={{ 
          fontSize: "12px", 
          color: "var(--accent-gold)", 
          fontFamily: "var(--font-pixel)",
          textTransform: "uppercase"
        }}
      >
        Trigger: {currentTrigger}
      </div>

      {/* Scoreboard Panel */}
      <div className="scoring-board">
        <div className="scoring-numbers">
          {/* Chips */}
          <div className="chips-box pixel-font">
            {chips.toLocaleString()}
          </div>

          {/* Multiplication Operator */}
          <span 
            className="pixel-font" 
            style={{ 
              color: "white", 
              fontSize: "1.8rem" 
            }}
          >
            ✕
          </span>

          {/* Mult */}
          <div className="mult-box pixel-font">
            {mult.toLocaleString()}
          </div>
        </div>

        {/* Rolling Total Display */}
        <div 
          className="pixel-font"
          style={{
            fontSize: "2rem",
            color: isSlammed ? "var(--accent-gold)" : "white",
            marginTop: "15px",
            textShadow: isSlammed ? "3px 3px 0px black" : "none"
          }}
        >
          {tallyScore.toLocaleString()}
        </div>
      </div>

      {/* Skip/Continue Action button */}
      <button 
        onClick={onClose}
        className="action-btn"
        style={{
          width: "200px",
          height: "40px",
          marginTop: "10px"
        }}
      >
        {isRolling ? "SKIP" : "CONTINUE"}
      </button>
    </div>
  );
}
