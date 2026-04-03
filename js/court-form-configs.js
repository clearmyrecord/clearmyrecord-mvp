<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>How It Works - ClearMyRecord</title>
  <style>
    * {
      box-sizing: border-box;
    }

    :root {
      --blue: #123d8f;
      --blue-dark: #0d2f71;
      --bg: #f3f7fc;
      --card: #ffffff;
      --line: #d9e2ec;
      --text: #1b2430;
      --muted: #5b6b7f;
      --soft-blue: #eef4ff;
      --green-bg: #e8f7ee;
      --green-border: #b7e4c7;
      --green-text: #1f7a3e;
      --yellow-bg: #fff8e1;
      --yellow-border: #f0d98a;
      --yellow-text: #8a6d1f;
    }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    .topbar {
      background: var(--blue);
      color: white;
      padding: 18px 0;
    }

    .topbar-inner {
      width: min(1100px, 92%);
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .logo {
      font-size: 22px;
      font-weight: 800;
    }

    .nav {
      display: flex;
      gap: 18px;
      flex-wrap: wrap;
    }

    .nav a {
      color: white;
      text-decoration: none;
      font-weight: 700;
    }

    .page {
      width: min(1100px, 92%);
      margin: 28px auto 60px;
    }

    .hero,
    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
      margin-bottom: 18px;
    }

    .eyebrow {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--blue);
      margin-bottom: 8px;
    }

    h1 {
      margin: 0 0 12px;
      font-size: 38px;
      line-height: 1.1;
      color: var(--blue-dark);
    }

    .hero p,
    .card p {
      color: var(--muted);
      line-height: 1.65;
      margin-top: 0;
    }

    h2 {
      margin: 0 0 12px;
      font-size: 24px;
      color: var(--blue-dark);
    }

    h3 {
      margin: 0 0 10px;
      font-size: 18px;
      color: var(--blue-dark);
    }

    .grid-2,
    .grid-3 {
      display: grid;
      gap: 16px;
    }

    .grid-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .grid-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .step-card,
    .feature-card,
    .info-box {
      background: #fbfdff;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 18px;
    }

    .step-number {
      display: inline-block;
      width: 34px;
      height: 34px;
      line-height: 34px;
      text-align: center;
      border-radius: 999px;
      background: var(--blue);
      color: white;
      font-weight: 800;
      margin-bottom: 12px;
    }

    .pill-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 10px;
    }

    .pill {
      display: inline-block;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
      border: 1px solid transparent;
    }

    .pill.blue {
      background: var(--soft-blue);
      color: var(--blue-dark);
      border-color: #cfe0ff;
    }

    .pill.green {
      background: var(--green-bg);
      color: var(--green-text);
      border-color: var(--green-border);
    }

    .pill.yellow {
      background: var(--yellow-bg);
      color: var(--yellow-text);
      border-color: var(--yellow-border);
    }

    ul {
      margin: 10px 0 0 18px;
      padding: 0;
      line-height: 1.7;
      color: var(--muted);
    }

    li {
      margin-bottom: 6px;
    }

    .highlight {
      background: var(--soft-blue);
      border: 1px solid var(--line);
      border-left: 5px solid var(--blue);
      border-radius: 12px;
      padding: 16px;
      color: var(--text);
      line-height: 1.65;
    }

    .cta-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .btn {
      display: inline-block;
      text-decoration: none;
      font-weight: 800;
      border-radius: 10px;
      padding: 12px 16px;
    }

    .btn-primary {
      background: var(--blue);
      color: white;
    }

    .btn-secondary {
      background: #e8eef7;
      color: var(--text);
    }

    .small-note {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.6;
      margin-top: 12px;
    }

    @media (max-width: 900px) {
      .grid-3 {
        grid-template-columns: 1fr;
      }

      .grid-2 {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      h1 {
        font-size: 30px;
      }

      .cta-row {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <div class="logo">ClearMyRecord</div>
      <nav class="nav">
        <a href="index.html">Home</a>
        <a href="record-details.html">Record Details</a>
        <a href="results.html">Results</a>
        <a href="packet.html">Packet</a>
      </nav>
    </div>
  </header>

  <main class="page">
    <section class="hero">
      <div class="eyebrow">How It Works</div>
      <h1>ClearMyRecord turns record details into a real filing roadmap.</h1>
      <p>
        ClearMyRecord helps users organize Ohio criminal record information, estimate sealing and expungement timing, identify likely blockers, and generate a printable action plan. It is built to handle multiple charges, different outcomes, offense levels, exclusions, and mixed-record scenarios.
      </p>

      <div class="pill-row">
        <span class="pill blue">Multi-offense input</span>
        <span class="pill blue">Charge-based analysis</span>
        <span class="pill blue">Sealing + expungement dates</span>
        <span class="pill green">Printable packet</span>
        <span class="pill yellow">Confidence scoring</span>
      </div>
    </section>

    <section class="card">
      <h2>The flow</h2>

      <div class="grid-3">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3>Enter the record</h3>
          <p>
            Users add each offense one by one and select the actual charge, outcome, category, level, and discharge date.
          </p>
          <ul>
            <li>Multiple offenses supported</li>
            <li>Misdemeanors and felonies supported</li>
            <li>Charge picker with Ohio-specific classifications</li>
            <li>Optional clump-group input for related convictions</li>
          </ul>
        </div>

        <div class="step-card">
          <div class="step-number">2</div>
          <h3>Run the rules engine</h3>
          <p>
            The app checks the entered record against Ohio-specific logic for sealing and expungement.
          </p>
          <ul>
            <li>Different waiting periods by offense level</li>
            <li>Different timing for sealing vs expungement</li>
            <li>Pending-charge and discharge checks</li>
            <li>Mixed-record and count-limit checks</li>
          </ul>
        </div>

        <div class="step-card">
          <div class="step-number">3</div>
          <h3>Show the result</h3>
          <p>
            Users get a result page with dates, blockers, confidence score, conviction summary, and offense-by-offense breakdown.
          </p>
          <ul>
            <li>Estimated sealing date</li>
            <li>Estimated expungement date</li>
            <li>Likely blocker or reason returned</li>
            <li>Printable packet and next steps</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>What users can enter now</h2>

      <div class="grid-2">
        <div class="feature-card">
          <h3>Charge-level record details</h3>
          <ul>
            <li>Specific charge selection</li>
            <li>Outcome: conviction, dismissed, not guilty, or no billed</li>
            <li>Offense category: misdemeanor or felony</li>
            <li>Offense level: MM, M1-M4, F1-F5</li>
            <li>Discharge or final disposition date</li>
          </ul>
        </div>

        <div class="feature-card">
          <h3>Ohio-specific legal inputs</h3>
          <ul>
            <li>Pending criminal charges</li>
            <li>Sentence fines and fees paid</li>
            <li>Chapter 2950 registry flag</li>
            <li>Victim-under-13 flag</li>
            <li>Clump-group support for related convictions</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>What the calculator evaluates</h2>

      <div class="grid-3">
        <div class="feature-card">
          <h3>Waiting periods</h3>
          <p>
            The system calculates dates using Ohio waiting periods rather than a single generic timeline.
          </p>
          <ul>
            <li>Minor misdemeanor timing</li>
            <li>Misdemeanor timing</li>
            <li>F4 / F5 felony timing</li>
            <li>F3 timing</li>
            <li>Separate sealing and expungement paths</li>
          </ul>
        </div>

        <div class="feature-card">
          <h3>Eligibility blockers</h3>
          <p>
            The rules engine checks for issues that can stop relief even when the dates look good.
          </p>
          <ul>
            <li>Pending charges</li>
            <li>Incomplete discharge</li>
            <li>Charge exclusions</li>
            <li>Count limits and mixed-record limits</li>
            <li>Higher-level felony restrictions</li>
          </ul>
        </div>

        <div class="feature-card">
          <h3>Record complexity</h3>
          <p>
            The system does not just look at one charge in isolation. It evaluates the record as a whole.
          </p>
          <ul>
            <li>Multiple convictions</li>
            <li>Multiple misdemeanors</li>
            <li>Felony + misdemeanor combinations</li>
            <li>Third-degree felony special limits</li>
            <li>Conviction clumping logic support</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>What appears on the results page</h2>

      <div class="grid-2">
        <div class="info-box">
          <h3>Clear outcome display</h3>
          <ul>
            <li>Eligible now</li>
            <li>Not yet eligible</li>
            <li>Currently blocked</li>
            <li>Sealing path found / not found</li>
            <li>Expungement path found / not found</li>
          </ul>
        </div>

        <div class="info-box">
          <h3>Detailed analysis</h3>
          <ul>
            <li>Estimated sealing date</li>
            <li>Estimated expungement date</li>
            <li>Primary blocker or explanation</li>
            <li>Conviction summary</li>
            <li>Offense-by-offense table</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Likelihood score</h2>
      <p>
        ClearMyRecord also shows a confidence estimate based on the information entered and the strength of the current rule match.
      </p>

      <div class="grid-3">
        <div class="feature-card">
          <h3>Green</h3>
          <p>High likelihood based on current information.</p>
          <ul>
            <li>Strong rule match</li>
            <li>Fewer blockers</li>
            <li>Cleaner record structure</li>
          </ul>
        </div>

        <div class="feature-card">
          <h3>Yellow</h3>
          <p>Moderate likelihood with issues that need review.</p>
          <ul>
            <li>Mixed record complexity</li>
            <li>Possible missing facts</li>
            <li>Closer legal review needed</li>
          </ul>
        </div>

        <div class="feature-card">
          <h3>Red</h3>
          <p>Low likelihood based on the current inputs.</p>
          <ul>
            <li>Known blockers returned</li>
            <li>Missing required data</li>
            <li>Excluded charge or count problem</li>
          </ul>
        </div>
      </div>

      <div class="small-note">
        The percentage is a rule-based confidence estimate. It is not legal advice or a guaranteed court outcome.
      </div>
    </section>

    <section class="card">
      <h2>Printable packet</h2>
      <p>
        After the results are generated, the packet page converts the analysis into a more practical filing roadmap.
      </p>

      <div class="grid-2">
        <div class="feature-card">
          <h3>What the packet includes</h3>
          <ul>
            <li>Sealing and expungement timing</li>
            <li>Basic filing instructions</li>
            <li>Document checklist</li>
            <li>Offense breakdown table</li>
            <li>Printable action plan</li>
          </ul>
        </div>

        <div class="feature-card">
          <h3>Why it matters</h3>
          <ul>
            <li>Turns analysis into next steps</li>
            <li>Helps users organize what they need</li>
            <li>Makes the process easier to understand</li>
            <li>Creates a cleaner handoff for later form automation</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>What still requires review</h2>
      <div class="highlight">
        ClearMyRecord now handles a lot more than a simple one-charge calculator, but certain issues still need careful legal or court-specific review, including exact statute-level exclusions, court discretion, rehabilitation findings, and whether convictions should be clumped and counted as one.
      </div>

      <ul>
        <li>Statute-specific exclusions still need continued expansion in the charge library</li>
        <li>Some offenses require more detailed legal classification than broad charge labels</li>
        <li>Court discretion and rehabilitation are not fully machine-decidable</li>
        <li>Form automation and filing logistics are the next major build layer</li>
      </ul>
    </section>

    <section class="card">
      <h2>What ClearMyRecord does right now</h2>

      <div class="pill-row">
        <span class="pill blue">Record intake</span>
        <span class="pill blue">Ohio rule logic</span>
        <span class="pill blue">Charge exclusions</span>
        <span class="pill blue">Mixed-record analysis</span>
        <span class="pill blue">Confidence scoring</span>
        <span class="pill blue">Results page</span>
        <span class="pill blue">Packet page</span>
      </div>

      <div class="cta-row">
        <a class="btn btn-primary" href="record-details.html">Start Record Review</a>
        <a class="btn btn-secondary" href="results.html">View Results Page</a>
        <a class="btn btn-secondary" href="packet.html">View Packet Page</a>
      </div>
    </section>
  </main>
</body>
</html>
