import type { IncidentData, RecipientOrg } from '../types/rescue.ts';

// High-fidelity SVG illustration representing an authentic catering hot-holding chafing dish setup
export const SAMPLE_CATERING_IMAGE_DATA_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1329" />
      <stop offset="100%" stop-color="#050a14" />
    </linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#cbd5e1" />
      <stop offset="40%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="food1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>
    <linearGradient id="food2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#15803d" />
      <stop offset="100%" stop-color="#166534" />
    </linearGradient>
    <linearGradient id="food3" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="500" fill="url(#bg)"/>
  
  <!-- Counter surface -->
  <path d="M 0 320 L 800 320 L 800 500 L 0 500 Z" fill="#111827"/>
  <line x1="0" y1="320" x2="800" y2="320" stroke="#1f2937" stroke-width="3"/>

  <!-- Chafing Pan 1: Roasted Chicken & Herb Potatoes -->
  <g filter="url(#shadow)" transform="translate(60, 180)">
    <!-- Stand / Frame -->
    <rect x="0" y="70" width="200" height="90" rx="6" fill="url(#steel)"/>
    <rect x="10" y="80" width="180" height="70" rx="4" fill="#334155"/>
    <circle cx="100" cy="115" r="14" fill="#0d9488" opacity="0.8"/>
    <text x="100" y="119" font-family="monospace" font-size="10" fill="#ffffff" text-anchor="middle">63.2°C</text>
    <!-- Food Insert -->
    <rect x="-10" y="10" width="220" height="75" rx="8" fill="url(#steel)"/>
    <rect x="-4" y="16" width="208" height="63" rx="6" fill="url(#food1)"/>
    <text x="100" y="42" font-family="sans-serif" font-weight="bold" font-size="13" fill="#fef3c7" text-anchor="middle">Herb Roasted Chicken</text>
    <text x="100" y="58" font-family="sans-serif" font-size="11" fill="#fde68a" text-anchor="middle">~60 portions • Pan 1/3</text>
  </g>

  <!-- Chafing Pan 2: Mediterranean Grain Salad -->
  <g filter="url(#shadow)" transform="translate(295, 180)">
    <rect x="0" y="70" width="200" height="90" rx="6" fill="url(#steel)"/>
    <rect x="10" y="80" width="180" height="70" rx="4" fill="#334155"/>
    <circle cx="100" cy="115" r="14" fill="#0d9488" opacity="0.8"/>
    <text x="100" y="119" font-family="monospace" font-size="10" fill="#ffffff" text-anchor="middle">61.8°C</text>
    <rect x="-10" y="10" width="220" height="75" rx="8" fill="url(#steel)"/>
    <rect x="-4" y="16" width="208" height="63" rx="6" fill="url(#food3)"/>
    <text x="100" y="42" font-family="sans-serif" font-weight="bold" font-size="13" fill="#78350f" text-anchor="middle">Mediterranean Quinoa</text>
    <text x="100" y="58" font-family="sans-serif" font-size="11" fill="#92400e" text-anchor="middle">~35 portions • Pan 2/3</text>
  </g>

  <!-- Chafing Pan 3: Steamed Vegetables -->
  <g filter="url(#shadow)" transform="translate(530, 180)">
    <rect x="0" y="70" width="200" height="90" rx="6" fill="url(#steel)"/>
    <rect x="10" y="80" width="180" height="70" rx="4" fill="#334155"/>
    <circle cx="100" cy="115" r="14" fill="#0d9488" opacity="0.8"/>
    <text x="100" y="119" font-family="monospace" font-size="10" fill="#ffffff" text-anchor="middle">64.0°C</text>
    <rect x="-10" y="10" width="220" height="75" rx="8" fill="url(#steel)"/>
    <rect x="-4" y="16" width="208" height="63" rx="6" fill="url(#food2)"/>
    <text x="100" y="42" font-family="sans-serif" font-weight="bold" font-size="13" fill="#dcfce7" text-anchor="middle">Steamed Veggies</text>
    <text x="100" y="58" font-family="sans-serif" font-size="11" fill="#bbf7d0" text-anchor="middle">~25 portions • Pan 3/3</text>
  </g>

  <!-- Catering Manifest Card -->
  <g filter="url(#shadow)" transform="translate(250, 40)">
    <rect width="300" height="90" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <rect x="12" y="12" width="7" height="66" rx="3" fill="#14b8a6"/>
    <text x="32" y="32" font-family="sans-serif" font-weight="bold" font-size="14" fill="#f8fafc">Grand Alumni Gala 2026</text>
    <text x="32" y="50" font-family="sans-serif" font-size="11" fill="#94a3b8">University Hall • Kitchen B1</text>
    <text x="32" y="68" font-family="monospace" font-size="11" fill="#14b8a6">BATCH TEMP: 62.8°C | CLEARANCE: GRANTED</text>
  </g>

  <!-- Overlay Watermark -->
  <text x="780" y="480" font-family="monospace" font-size="10" fill="#475569" text-anchor="end">[SIMULATED OPERATIONAL CATERING PHOTO]</text>
</svg>
`);

export const COMMUNITY_KITCHEN_HERO_IMAGE = '/src/assets/images/community_kitchen_warm_1792397153468.jpg';
export const FRESH_MEAL_PREP_IMAGE = '/src/assets/images/fresh_meal_prep_boxes_1792397131117.jpg';

export const DEFAULT_DEMO_INCIDENT: IncidentData = {
  id: 'INC-2026-0891',
  title: 'Campus Gala Prepared Meal Surplus',
  venueType: 'college_event',
  locationAddress: 'University Hall - Catering Loading Dock B, West Campus',
  isSimulatedData: true,
  contactName: 'Executive Chef Marcus Vance',
  contactPhone: '+1 (555) 234-8900',
  reportedPortions: 120,
  reportedWeightKg: 50.4,
  preparationTime: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  pickupDeadline: new Date(Date.now() + 1000 * 60 * 95).toISOString(),
  storageMethod: 'hot_hold',
  storageTempC: 62.8,
  temperatureVerified: true,
  venueSafetyClearanceGranted: true,
  venueSafetyOfficerName: 'Dr. Elena Rostova (Campus Food Safety Lead)',
  declaredAllergens: ['Gluten', 'Sesame'],
  dietaryTags: ['halal', 'vegetarian-options'],
  rawDescription:
    '120 individual prepared fresh bento boxes from the university gala. Each container features seasoned sliced grilled chicken breast over fluffy quinoa and chickpeas, fresh cucumber rounds, crisp carrot batons, and fresh blueberries. Maintained in insulated thermal transport Cambros at 62.8°C. Inspected and approved by campus food safety coordinator.',
  imageUrl: FRESH_MEAL_PREP_IMAGE,
  imageFileName: 'fresh_meal_prep_boxes.jpg',
};

export const DEFAULT_DEMO_RECIPIENTS: RecipientOrg[] = [
  {
    id: 'REC-01',
    name: 'Hope Community Kitchen & Pantry',
    type: 'community_kitchen',
    address: '412 Elm Street, Downtown District',
    distanceKm: 2.3,
    declaredCapacityPortions: 70,
    allocatedPortions: 0,
    operatingHours: 'Open daily until 10:00 PM',
    acceptsHotFood: true,
    acceptsChilledFood: true,
    dietaryRequirements: ['halal', 'vegetarian-options'],
    contactPerson: 'David Miller (Kitchen Director)',
    contactPhone: '+1 (555) 301-8899',
    isSimulatedData: true,
  },
  {
    id: 'REC-02',
    name: 'Valley Family Emergency Shelter',
    type: 'homeless_shelter',
    address: '880 Pine Avenue, South Ward',
    distanceKm: 4.8,
    declaredCapacityPortions: 50,
    allocatedPortions: 0,
    operatingHours: '24/7 Intake & Dining Room',
    acceptsHotFood: true,
    acceptsChilledFood: true,
    dietaryRequirements: [],
    contactPerson: 'Sarah Jenkins (Intake Supervisor)',
    contactPhone: '+1 (555) 744-1234',
    isSimulatedData: true,
  },
  {
    id: 'REC-03',
    name: 'Westside Youth Center Dinner Program',
    type: 'youth_center',
    address: '150 River Road, Westside Arts Park',
    distanceKm: 8.5,
    declaredCapacityPortions: 40,
    allocatedPortions: 0,
    operatingHours: 'Dinner service 6:00 PM - 8:30 PM',
    acceptsHotFood: false, // Requires cold or reheat-capable intake
    acceptsChilledFood: true,
    dietaryRequirements: ['nut-free'],
    contactPerson: 'Jordan Lee (Program Lead)',
    contactPhone: '+1 (555) 902-5511',
    isSimulatedData: true,
  },
  {
    id: 'REC-04',
    name: 'St. Jude Food Pantry & Senior Meals',
    type: 'food_pantry',
    address: '1020 Cathedral Way, Midtown',
    distanceKm: 11.2,
    declaredCapacityPortions: 80,
    allocatedPortions: 0,
    operatingHours: 'Cold storage intake until 9:00 PM',
    acceptsHotFood: false,
    acceptsChilledFood: true,
    dietaryRequirements: ['low-sodium'],
    contactPerson: 'Sister Beatrice (Coordinator)',
    contactPhone: '+1 (555) 812-4400',
    isSimulatedData: true,
  },
];

export const ALTERNATIVE_SCENARIOS: { label: string; incident: IncidentData }[] = [
  {
    label: 'Standard Demo: University Gala (120 Hot Portions)',
    incident: DEFAULT_DEMO_INCIDENT,
  },
  {
    label: 'Conference Boxed Lunches (80 Chilled Servings)',
    incident: {
      id: 'INC-2026-0442',
      title: 'Biotech Summit Deli Box Surplus',
      venueType: 'cafeteria',
      locationAddress: 'Science Center Atrium - Service Gate 1',
      isSimulatedData: true,
      contactName: 'Catering Lead Brenda Ramos',
      contactPhone: '+1 (555) 932-1144',
      reportedPortions: 80,
      reportedWeightKg: 33.6,
      preparationTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      pickupDeadline: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
      storageMethod: 'refrigerated',
      storageTempC: 3.8,
      temperatureVerified: true,
      venueSafetyClearanceGranted: true,
      venueSafetyOfficerName: 'Brenda Ramos (Lead Caterer)',
      declaredAllergens: ['Gluten', 'Eggs (Mayonnaise)'],
      dietaryTags: ['vegetarian-options', 'halal'],
      rawDescription:
        '80 individual gourmet boxed lunches in sealed eco-cartons. 50 roasted turkey & provolone baguettes, 30 grilled portobello & hummus ciabattas (vegan). Stored in walk-in cooler at 3.8°C.',
      imageUrl: SAMPLE_CATERING_IMAGE_DATA_URI,
      imageFileName: 'boxed_lunches.svg',
    },
  },
  {
    label: 'Safety Flag Demo: Unsafe Temp Warning (60 Portions)',
    incident: {
      id: 'INC-2026-0909',
      title: 'Buffet Stew Pan - Left Ambient',
      venueType: 'restaurant',
      locationAddress: 'Oasis Banquet Hall - Service Entrance',
      isSimulatedData: true,
      contactName: 'Supervisor Kenji Sato',
      contactPhone: '+1 (555) 344-9988',
      reportedPortions: 60,
      reportedWeightKg: 25.2,
      preparationTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      storageMethod: 'ambient',
      storageTempC: 38.5,
      temperatureVerified: true,
      venueSafetyClearanceGranted: false,
      venueSafetyOfficerName: '',
      declaredAllergens: ['Shellfish'],
      dietaryTags: [],
      rawDescription:
        'Leftover beef stew and rice held on side tables without chafing burners for approximately 3 hours. Internal temperature logged at 38.5°C.',
      imageUrl: SAMPLE_CATERING_IMAGE_DATA_URI,
      imageFileName: 'ambient_stew.svg',
    },
  },
];

export const CUSTOM_INITIAL_INCIDENT: IncidentData = {
  id: 'INC-CUSTOM-001',
  title: '',
  venueType: 'college_event',
  locationAddress: '',
  isSimulatedData: false,
  contactName: '',
  contactPhone: '',
  reportedPortions: 50,
  reportedWeightKg: 21,
  preparationTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  pickupDeadline: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
  storageMethod: 'hot_hold',
  storageTempC: 62.5,
  temperatureVerified: true,
  venueSafetyClearanceGranted: true,
  venueSafetyOfficerName: '',
  declaredAllergens: [],
  dietaryTags: ['vegetarian-options'],
  rawDescription: '',
  imageUrl: '',
  imageFileName: '',
};


