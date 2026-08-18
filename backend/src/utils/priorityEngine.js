/**
 * Smart Priority-Based Consultation Engine
 * 
 * Computes urgency score (0-100) and priority level (LOW, MEDIUM, HIGH, VERY_HIGH)
 * based on patient-reported health concern, severity, duration, and clinical risk flags.
 * 
 * IMPORTANT SAFETY NOTE:
 * This system is a consultation-support and urgency-prioritization tool,
 * NOT a medical diagnosis system.
 */

const HIGH_RISK_SYMPTOMS = [
  'chest pain',
  'difficulty breathing',
  'shortness of breath',
  'severe bleeding',
  'sudden numbness',
  'loss of consciousness',
  'fainting',
  'high fever with convulsions',
  'acute severe abdominal pain',
  'sudden vision loss',
  'paralysis',
  'slurred speech',
  'coughing blood',
  'severe allergic reaction',
  'anaphylaxis',
  'poisoning'
];

const MODERATE_RISK_SYMPTOMS = [
  'moderate fever',
  'persistent vomiting',
  'severe headache',
  'dizziness',
  'burns',
  'bone injury / fracture suspected',
  'uncontrolled asthma',
  'irregular heartbeat / palpitations',
  'deep laceration',
  'severe back pain',
  'urinary retention'
];

/**
 * Calculate consultation priority
 * @param {Object} data 
 * @param {string} data.mainConcern
 * @param {string[]} data.symptoms
 * @param {string} data.duration - 'today' | '1-3 days' | '4-7 days' | 'more than 7 days'
 * @param {string} data.severity - 'mild' | 'moderate' | 'severe'
 * @param {string} [data.optionalInformation]
 * @returns {Object} Priority assessment details
 */
function calculatePriority({ mainConcern = '', symptoms = [], duration = 'today', severity = 'mild', optionalInformation = '' }) {
  let score = 0;
  const factors = {
    severityScore: 0,
    durationScore: 0,
    symptomCountScore: 0,
    riskIndicatorScore: 0,
    flaggedHighRisk: [],
    flaggedModerateRisk: []
  };

  const normalizedConcern = `${mainConcern} ${optionalInformation}`.toLowerCase();
  const normalizedSymptoms = symptoms.map(s => s.toLowerCase());
  const allText = `${normalizedConcern} ${normalizedSymptoms.join(' ')}`;

  // 1. Severity Factor
  switch (severity?.toLowerCase()) {
    case 'severe':
      factors.severityScore = 45;
      break;
    case 'moderate':
      factors.severityScore = 25;
      break;
    case 'mild':
    default:
      factors.severityScore = 10;
      break;
  }
  score += factors.severityScore;

  // 2. Duration Factor
  switch (duration?.toLowerCase()) {
    case 'today':
      // Acute onset with severe symptoms is very concerning
      factors.durationScore = severity === 'severe' ? 20 : 8;
      break;
    case '1-3 days':
      factors.durationScore = 12;
      break;
    case '4-7 days':
      factors.durationScore = 16;
      break;
    case 'more than 7 days':
      factors.durationScore = 20;
      break;
    default:
      factors.durationScore = 10;
      break;
  }
  score += factors.durationScore;

  // 3. Number of symptoms (+3 each up to +15)
  const symptomCountBonus = Math.min(symptoms.length * 3, 15);
  factors.symptomCountScore = symptomCountBonus;
  score += symptomCountBonus;

  // 4. Clinical Risk Keyword Matching
  for (const riskSymptom of HIGH_RISK_SYMPTOMS) {
    if (allText.includes(riskSymptom)) {
      factors.flaggedHighRisk.push(riskSymptom);
    }
  }

  for (const modSymptom of MODERATE_RISK_SYMPTOMS) {
    if (allText.includes(modSymptom)) {
      factors.flaggedModerateRisk.push(modSymptom);
    }
  }

  if (factors.flaggedHighRisk.length > 0) {
    // High-risk indicators add major priority
    factors.riskIndicatorScore = Math.min(factors.flaggedHighRisk.length * 20, 35);
  } else if (factors.flaggedModerateRisk.length > 0) {
    factors.riskIndicatorScore = Math.min(factors.flaggedModerateRisk.length * 10, 20);
  }
  score += factors.riskIndicatorScore;

  // Clamp score between 0 and 100
  const priorityScore = Math.min(Math.max(Math.round(score), 5), 100);

  // Classify priority level
  let priorityLevel = 'LOW';
  if (priorityScore >= 76) {
    priorityLevel = 'VERY_HIGH';
  } else if (priorityScore >= 51) {
    priorityLevel = 'HIGH';
  } else if (priorityScore >= 26) {
    priorityLevel = 'MEDIUM';
  } else {
    priorityLevel = 'LOW';
  }

  const isEmergencyAlert = priorityLevel === 'VERY_HIGH' || factors.flaggedHighRisk.length > 0;

  return {
    priorityScore,
    priorityLevel,
    assessmentMethod: 'RULE_BASED',
    modelVersion: 'rule-engine-v1.2',
    factorsSummary: factors,
    isEmergencyAlert,
    emergencyMessage: isEmergencyAlert
      ? '⚠️ Warning: Reported symptoms indicate potentially acute or high-urgency conditions. If this is a life-threatening emergency, please call your local emergency services (e.g. 112 / 911 / 108) or visit the nearest emergency room immediately.'
      : null,
    disclaimer: 'This consultation priority is an automated decision-support estimate to organize medical queues. It is not a medical diagnosis or treatment plan.'
  };
}

module.exports = {
  calculatePriority,
  HIGH_RISK_SYMPTOMS,
  MODERATE_RISK_SYMPTOMS
};
