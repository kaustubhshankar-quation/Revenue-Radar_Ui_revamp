import React, { useEffect, useMemo, useRef, useState } from "react";

function LoaderCustom({ text = "Preparing insights...", onElapsed }) {
  const jokes = useMemo(
    () => [
      "Loading… because good things take time, and approvals take longer.",
      "Data is getting approval from 3 managers and 2 Excel sheets.",
      "Just adding some ‘as per discussion’ insights.",
      "Waiting for data… like we wait for salary credit.",
      "Numbers are being adjusted to match expectations.",
      "Running late, but calling it ‘in progress’.",
      "Converting confusion into a presentation.",
      "Data is aligning with what leadership already believes.",
      "Adding ‘strategic’ before everything.",
      "Making the dashboard look expensive.",
      "This delay is part of the process. Trust the process.",
      "Currently blaming the backend… please wait.",
      "Data is under review… again.",
      "Trying to make last quarter look like a strategy.",
      "Polishing insights until they sound like a promotion.",
      "Preparing answers for questions that will never be asked.",
      "Making sure charts look confident, even if we aren’t.",
      "Applying ‘best practices’ randomly.",
      "Turning ‘we don’t know’ into ‘early signals suggest’.",
      "Loading… buying time before someone asks ‘why is this down?’",
      "Data is being carefully adjusted to avoid difficult conversations.",
      "If this loads fast, expectations will increase. So… slow is strategic.",
      "Waiting for numbers that won’t survive the meeting anyway.",
      "Making sure the data supports the narrative, not the other way around.",
      "This delay is sponsored by unclear requirements.",
      "Refreshing… because maybe the problem fixes itself.",
      "Preparing data that will be questioned regardless.",
      "Turning accountability into a loading spinner.",
      "Data is correct. The expectations are wrong.",
      "Buying time before someone says ‘this doesn’t look right’.",
      "Aligning results with what leadership already decided.",
      "If numbers look bad, we call it ‘market conditions’.",
      "Optimizing excuses while the data loads.",
      "This insight will definitely be ignored in the final decision.",
      "Waiting… so the meeting gets shorter.",
      "Confidence level: high. Data quality: negotiable.",
      "Making charts look stronger than the strategy.",
      "If it loads slow enough, maybe nobody will ask for details.",
      "This dashboard is 50% data, 50% damage control.",
      "Explaining variance before understanding it.",
      "Loading… because reality needs formatting.",
      "Turning problems into bullet points.",
      "The slower this loads, the less questions we get.",
      "Finalizing numbers that will change after approval.",
      "Waiting for the one guy who knows what’s happening.",
      "Reusing last month’s logic with more confidence.",
      "Adding filters nobody will use.",
      "Making things complex so they look important.",
      "Justifying numbers before showing them.",
      "Finalizing… which means changing everything last minute."
    ],
    []
  );

  const [currentJoke, setCurrentJoke] = useState(jokes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentJoke((prev) => {
        const filtered = jokes.filter((item) => item !== prev);
        return filtered[Math.floor(Math.random() * filtered.length)];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [jokes]);

  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => {
      clearInterval(timer);
      if (onElapsed) onElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    };
  }, [onElapsed]);

  const formatElapsed = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="rr-loader-shell">
      <div className="rr-loader-card">
        <div className="rr-loader-animation-wrap">
          <div className="rr-loader-orbit rr-loader-orbit-1"></div>
          <div className="rr-loader-orbit rr-loader-orbit-2"></div>
          <div className="rr-loader-core">
            <div className="rr-loader-dot rr-loader-dot-1"></div>
            <div className="rr-loader-dot rr-loader-dot-2"></div>
            <div className="rr-loader-dot rr-loader-dot-3"></div>
          </div>
        </div>

        <h3 className="rr-loader-title">{text}</h3>

        <p className="rr-loader-subtitle">
          Please wait while we prepare your results.
        </p>

        <p className="rr-loader-elapsed">
          Elapsed: {formatElapsed(elapsed)}
        </p>

        <div className="rr-loader-joke-box">
          <span className="rr-loader-joke-label">While we work</span>
          <p className="rr-loader-joke-text mb-0">{currentJoke}</p>
        </div>
      </div>
    </div>
  );
}

export default LoaderCustom;