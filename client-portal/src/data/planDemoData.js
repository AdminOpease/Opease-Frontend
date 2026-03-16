// src/data/planDemoData.js

// ── PM Plan: daily driver assignments grouped by route type / time ──

export const PM_ROUTE_SECTIONS = [
  {
    title: 'Same Day Routes',
    time: '06:10AM',
    color: '#D32F2F',
  },
  {
    title: 'SWA',
    time: '09:50AM',
    color: '#D32F2F',
  },
  {
    title: 'Full Routes',
    time: '10:10AM',
    color: '#D32F2F',
  },
  {
    title: 'Electric Vehicle',
    time: '11:00AM',
    color: '#D32F2F',
  },
  {
    title: 'Ride Along',
    time: '11:00AM',
    color: '#D32F2F',
  },
  {
    title: 'Cycle 2 Route',
    time: '12:40PM',
    color: '#D32F2F',
  },
];

// Demo driver assignments per depot per section
export const PM_PLAN_DATA = {
  Heathrow: [
    {
      section: 'Same Day Routes',
      time: '06:10AM',
      drivers: [
        'Amy Jones',
        'Ben Carter',
        'Dan Okafor',
        'Harry Nguyen',
        'James Patel',
      ],
    },
    {
      section: 'SWA',
      time: '09:50AM',
      drivers: ['Noah Wilson'],
    },
    {
      section: 'Full Routes',
      time: '10:10AM',
      drivers: [
        'Faisal Khan',
        'Isla Brown',
        'Liam O\'Brien',
        'Olivia Fernandez',
        'Kira Mbeki',
        'Elena Rivera',
        'Grace Obi',
        'Mia Zhang',
        'Cara Smith',
        'Amy Jones',
        'Ben Carter',
        'Dan Okafor',
        'Harry Nguyen',
        'James Patel',
        'Noah Wilson',
      ],
    },
    {
      section: 'Electric Vehicle',
      time: '11:00AM',
      drivers: [
        'Cara Smith',
        'Elena Rivera',
        'Grace Obi',
      ],
    },
    {
      section: 'Ride Along',
      time: '11:00AM',
      drivers: [
        'Mia Zhang',
        'Isla Brown',
      ],
    },
    {
      section: 'Cycle 2 Route',
      time: '12:40PM',
      drivers: ['Faisal Khan'],
    },
  ],
  Greenwich: [
    {
      section: 'Same Day Routes',
      time: '06:10AM',
      drivers: [
        'Cara Smith',
        'Faisal Khan',
        'Isla Brown',
        'Liam O\'Brien',
      ],
    },
    {
      section: 'SWA',
      time: '09:50AM',
      drivers: ['Kira Mbeki'],
    },
    {
      section: 'Full Routes',
      time: '10:10AM',
      drivers: [
        'Amy Jones',
        'Ben Carter',
        'Dan Okafor',
        'Elena Rivera',
        'Grace Obi',
        'Harry Nguyen',
        'James Patel',
        'Mia Zhang',
        'Noah Wilson',
        'Olivia Fernandez',
      ],
    },
    {
      section: 'Electric Vehicle',
      time: '11:00AM',
      drivers: [
        'Dan Okafor',
        'Harry Nguyen',
      ],
    },
    {
      section: 'Ride Along',
      time: '11:00AM',
      drivers: ['Ben Carter'],
    },
    {
      section: 'Cycle 2 Route',
      time: '12:40PM',
      drivers: ['Olivia Fernandez'],
    },
  ],
  Battersea: [
    {
      section: 'Same Day Routes',
      time: '06:10AM',
      drivers: [
        'Elena Rivera',
        'Grace Obi',
        'Kira Mbeki',
        'Olivia Fernandez',
      ],
    },
    {
      section: 'SWA',
      time: '09:50AM',
      drivers: ['Mia Zhang'],
    },
    {
      section: 'Full Routes',
      time: '10:10AM',
      drivers: [
        'Amy Jones',
        'Ben Carter',
        'Cara Smith',
        'Dan Okafor',
        'Faisal Khan',
        'Harry Nguyen',
        'Isla Brown',
        'James Patel',
        'Liam O\'Brien',
        'Noah Wilson',
      ],
    },
    {
      section: 'Electric Vehicle',
      time: '11:00AM',
      drivers: [
        'Liam O\'Brien',
        'James Patel',
        'Noah Wilson',
      ],
    },
    {
      section: 'Ride Along',
      time: '11:00AM',
      drivers: [
        'Cara Smith',
        'Faisal Khan',
      ],
    },
    {
      section: 'Cycle 2 Route',
      time: '12:40PM',
      drivers: ['Grace Obi'],
    },
  ],
};

// ── AM Plan: daily route assignments table (driver → van, route, bay, etc.) ──

export const AM_ROUTE_GROUPS = [
  { title: 'Same Day Routes', time: '06:10', color: '#2E7D32', bg: '#E8F5E9' },
  { title: 'SWA', time: '10:05', color: '#F9A825', bg: '#FFFDE7' },
  { title: 'Electric Vehicle', time: '11:15', color: '#0288D1', bg: '#E1F5FE' },
  { title: 'Full Routes', time: '11:30', color: '#424242', bg: '#FAFAFA' },
  { title: 'Cycle 2 Route', time: '12:00', color: '#6A1B9A', bg: '#F3E5F5' },
];

export const AM_PLAN_DATA = {
  Heathrow: [
    {
      group: 'Same Day Routes',
      time: '06:10',
      rows: [
        { driver: 'Amy Jones', tid: 'AMZN001', van: 'RHX', route: 'SA_A133', bay: 'IN APP', atlas: '' },
        { driver: 'Ben Carter', tid: 'AMZN002', van: 'ETV', route: 'SA_A134', bay: 'IN APP', atlas: '' },
        { driver: 'Dan Okafor', tid: 'AMZN004', van: 'EWE', route: 'SA_A135', bay: 'IN APP', atlas: '' },
        { driver: 'Harry Nguyen', tid: 'AMZN008', van: 'JVJ', route: 'SA_A136', bay: 'IN APP', atlas: '' },
        { driver: 'James Patel', tid: 'AMZN010', van: 'YBM', route: 'SA_A137', bay: 'IN APP', atlas: '' },
      ],
    },
    {
      group: 'SWA',
      time: '10:05',
      rows: [
        { driver: 'Noah Wilson', tid: 'AMZN014', van: 'HBB', route: '15', bay: 'STG-A21.1', atlas: '' },
      ],
    },
    {
      group: 'Electric Vehicle',
      time: '11:15',
      rows: [
        { driver: 'Elena Rivera', tid: 'AMZN005', van: 'GZG', route: '39', bay: 'STG-A18.1', atlas: '' },
        { driver: 'Grace Obi', tid: 'AMZN007', van: 'GNZ', route: '42', bay: 'STG-A17.1', atlas: '3' },
        { driver: 'Kira Mbeki', tid: 'AMZN011', van: 'FME', route: '43', bay: 'STG-A15.1', atlas: '1' },
      ],
    },
    {
      group: 'Full Routes',
      time: '11:30',
      rows: [
        { driver: 'Faisal Khan', tid: 'AMZN006', van: 'OMT', route: '40', bay: 'STG-A3.1', atlas: '' },
        { driver: 'Isla Brown', tid: 'AMZN009', van: 'NYP', route: '44', bay: 'STG-A5.1', atlas: '' },
        { driver: 'Liam O\'Brien', tid: 'AMZN012', van: 'UEG', route: '45', bay: 'STG-A4.1', atlas: '1' },
        { driver: 'Olivia Fernandez', tid: 'AMZN015', van: 'ONB', route: '49', bay: 'STG-A6.1', atlas: '' },
        { driver: 'Noah Wilson', tid: 'AMZN014', van: 'HDC', route: '50', bay: 'STG-A11.1', atlas: '' },
        { driver: 'Amy Jones', tid: 'AMZN001', van: 'YFX', route: '52', bay: 'STG-A8.1', atlas: '' },
        { driver: 'Ben Carter', tid: 'AMZN002', van: 'PYJ', route: '53', bay: 'STG-A18.1', atlas: '1' },
        { driver: 'Harry Nguyen', tid: 'AMZN008', van: 'SYO', route: '54', bay: 'STG-A17.1', atlas: '3' },
      ],
    },
    {
      group: 'Cycle 2 Route',
      time: '12:00',
      rows: [
        { driver: 'Dan Okafor', tid: 'AMZN004', van: 'WMU', route: '46', bay: 'STG-A5.1', atlas: '' },
        { driver: 'James Patel', tid: 'AMZN010', van: 'GVL', route: '47', bay: 'STG-A4.1', atlas: '' },
      ],
    },
  ],
  Greenwich: [
    {
      group: 'Same Day Routes',
      time: '06:10',
      rows: [
        { driver: 'Cara Smith', tid: 'AMZN003', van: 'GWY', route: 'SA_A138', bay: 'IN APP', atlas: '' },
        { driver: 'Faisal Khan', tid: 'AMZN006', van: 'KTD', route: 'SA_A139', bay: 'IN APP', atlas: '' },
        { driver: 'Isla Brown', tid: 'AMZN009', van: 'LXA', route: 'SA_A140', bay: 'IN APP', atlas: '' },
        { driver: 'Liam O\'Brien', tid: 'AMZN012', van: 'UYZ', route: 'SA_A141', bay: 'IN APP', atlas: '' },
      ],
    },
    {
      group: 'SWA',
      time: '10:05',
      rows: [
        { driver: 'Kira Mbeki', tid: 'AMZN011', van: 'FGA', route: '70', bay: 'STG-A22.1', atlas: '' },
      ],
    },
    {
      group: 'Electric Vehicle',
      time: '11:15',
      rows: [
        { driver: 'Dan Okafor', tid: 'AMZN004', van: 'NZD', route: '48', bay: 'STG-A16.1', atlas: '' },
        { driver: 'Harry Nguyen', tid: 'AMZN008', van: 'YGE', route: '61', bay: 'STG-A20.1', atlas: '' },
      ],
    },
    {
      group: 'Full Routes',
      time: '11:30',
      rows: [
        { driver: 'Amy Jones', tid: 'AMZN001', van: 'WLU', route: '55', bay: 'STG-A16.1', atlas: '' },
        { driver: 'Ben Carter', tid: 'AMZN002', van: 'VNP', route: '56', bay: 'STG-A19.1', atlas: '' },
        { driver: 'Elena Rivera', tid: 'AMZN005', van: 'FTF', route: '58', bay: 'STG-A20.1', atlas: '' },
        { driver: 'Grace Obi', tid: 'AMZN007', van: 'RMO', route: '59', bay: 'STG-A14.1', atlas: '1' },
        { driver: 'Olivia Fernandez', tid: 'AMZN015', van: 'NYY', route: '62', bay: 'STG-A21.1', atlas: '' },
        { driver: 'Noah Wilson', tid: 'AMZN014', van: 'OOU', route: '63', bay: 'STG-A22.1', atlas: '4' },
      ],
    },
    {
      group: 'Cycle 2 Route',
      time: '12:00',
      rows: [
        { driver: 'Cara Smith', tid: 'AMZN003', van: 'THX', route: '51', bay: 'STG-A3.1', atlas: '' },
        { driver: 'Isla Brown', tid: 'AMZN009', van: 'NXZ', route: '57', bay: 'STG-A11.1', atlas: '1' },
        { driver: 'Liam O\'Brien', tid: 'AMZN012', van: 'HMD', route: '60', bay: 'STG-A8.1', atlas: '' },
      ],
    },
  ],
  Battersea: [
    {
      group: 'Same Day Routes',
      time: '06:10',
      rows: [
        { driver: 'Elena Rivera', tid: 'AMZN005', van: 'PZB', route: 'SA_A142', bay: 'IN APP', atlas: '' },
        { driver: 'Grace Obi', tid: 'AMZN007', van: 'SYP', route: 'SA_A143', bay: 'IN APP', atlas: '' },
        { driver: 'Kira Mbeki', tid: 'AMZN011', van: 'OEU', route: 'SA_A144', bay: 'IN APP', atlas: '' },
      ],
    },
    {
      group: 'SWA',
      time: '10:05',
      rows: [
        { driver: 'Olivia Fernandez', tid: 'AMZN015', van: 'GWF', route: '67', bay: 'STG-A6.1', atlas: '1' },
      ],
    },
    {
      group: 'Electric Vehicle',
      time: '11:15',
      rows: [
        { driver: 'Liam O\'Brien', tid: 'AMZN012', van: 'UUX', route: '65', bay: 'STG-A19.1', atlas: '' },
        { driver: 'James Patel', tid: 'AMZN010', van: 'UZA', route: '64', bay: 'STG-A22.1', atlas: '' },
      ],
    },
    {
      group: 'Full Routes',
      time: '11:30',
      rows: [
        { driver: 'Amy Jones', tid: 'AMZN001', van: 'PYJ', route: '53', bay: 'STG-A18.1', atlas: '1' },
        { driver: 'Ben Carter', tid: 'AMZN002', van: 'SYO', route: '54', bay: 'STG-A17.1', atlas: '3' },
        { driver: 'Cara Smith', tid: 'AMZN003', van: 'WLU', route: '55', bay: 'STG-A16.1', atlas: '' },
        { driver: 'Dan Okafor', tid: 'AMZN004', van: 'VNP', route: '56', bay: 'STG-A19.1', atlas: '' },
        { driver: 'Faisal Khan', tid: 'AMZN006', van: 'FTF', route: '58', bay: 'STG-A20.1', atlas: '' },
        { driver: 'Harry Nguyen', tid: 'AMZN008', van: 'RMO', route: '59', bay: 'STG-A14.1', atlas: '1' },
        { driver: 'Isla Brown', tid: 'AMZN009', van: 'NYY', route: '62', bay: 'STG-A21.1', atlas: '' },
        { driver: 'Noah Wilson', tid: 'AMZN014', van: 'OOU', route: '63', bay: 'STG-A22.1', atlas: '4' },
      ],
    },
    {
      group: 'Cycle 2 Route',
      time: '12:00',
      rows: [
        { driver: 'Mia Zhang', tid: 'AMZN013', van: 'OAP', route: '69', bay: 'STG-A7.1', atlas: '' },
      ],
    },
  ],
};
