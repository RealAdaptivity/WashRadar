/**
 * WashRadar State Management
 * Handles local storage persistence and reactive state updates for carwashes,
 * traffic metrics, new construction, and active promotions.
 */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


const DEFAULT_WASHES = [
  {
    id: "wash-1",
    name: "Tommy Terrific's Car Wash",
    lat: 33.01392,
    lng: -96.76656,
    status: "open",
    traffic: "moderate",
    waitTime: 10,
    address: "1101 Coit Road, Plano, TX 75075",
    phone: "(972) 555-0101",
    hours: "Mon-Sat: 8AM-7PM, Sun: 9AM-6PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [5, 2, 0, 0, 0, 0, 10, 25, 45, 60, 50, 55, 65, 70, 75, 80, 85, 70, 50, 30, 15, 10, 5, 5],
    closureReason: ""
  },
  {
    id: "wash-2",
    name: "Carnation Auto Spa",
    lat: 33.02778,
    lng: -96.838314,
    status: "open",
    traffic: "high",
    waitTime: 25,
    address: "6445 W. Park Blvd, Plano, TX 75093",
    phone: "(972) 555-0102",
    hours: "Mon-Sat: 8AM-8PM, Sun: 8AM-7PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [2, 0, 0, 0, 0, 5, 20, 40, 60, 75, 80, 85, 90, 88, 85, 92, 95, 88, 70, 55, 40, 25, 10, 5],
    closureReason: ""
  },
  {
    id: "wash-3",
    name: "Vibe Car Wash",
    lat: 33.056632,
    lng: -96.708739,
    status: "open",
    traffic: "low",
    waitTime: 4,
    address: "801 W Spring Creek Pkwy, Plano, TX 75023",
    phone: "(972) 555-0103",
    hours: "Mon-Sat: 7AM-9PM, Sun: 8AM-8PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 8, 15, 22, 28, 30, 35, 42, 40, 38, 45, 50, 42, 30, 18, 10, 5, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-4",
    name: "QwikWash America!",
    lat: 33.1555,
    lng: -96.8060,
    status: "open",
    traffic: "moderate",
    waitTime: 15,
    address: "3300 N. Preston Road, Frisco, TX 75034",
    phone: "(469) 555-0104",
    hours: "Mon-Sat: 8AM-6PM, Sun: 9AM-5PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [1, 0, 0, 0, 0, 2, 12, 22, 35, 48, 52, 58, 60, 58, 55, 62, 68, 60, 48, 32, 20, 12, 5, 2],
    closureReason: ""
  },
  {
    id: "wash-5",
    name: "Legacy Car Wash & Detail Center",
    lat: 33.105387,
    lng: -96.840733,
    status: "open",
    traffic: "moderate",
    waitTime: 12,
    address: "3232 Legacy Drive, Frisco, TX 75034",
    phone: "(469) 555-0105",
    hours: "Mon-Sat: 8AM-7PM, Sun: 9AM-5:30PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 18, 30, 45, 55, 60, 62, 58, 65, 70, 75, 65, 50, 35, 20, 10, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-6",
    name: "Clean Getaway Car Wash",
    lat: 33.153631,
    lng: -96.859134,
    status: "open",
    traffic: "moderate",
    waitTime: 8,
    address: "3520 Main St., Frisco, TX 75034",
    phone: "(469) 555-0106",
    hours: "Mon-Sat: 8AM-7PM, Sun: 8AM-6PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 18, 30, 45, 55, 60, 62, 58, 65, 70, 75, 65, 50, 35, 20, 10, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-7",
    name: "Parkway Auto Spa",
    lat: 33.1722,
    lng: -96.6963,
    status: "open",
    traffic: "low",
    waitTime: 2,
    address: "3850 W. Eldorado Parkway, McKinney, TX 75070",
    phone: "(972) 555-0107",
    hours: "Mon-Sat: 8AM-8PM, Sun: 9AM-6PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 2, 5, 10, 15, 20, 25, 30, 28, 25, 30, 35, 32, 20, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-8",
    name: "ZIPS Car Wash - Custer",
    lat: 33.146114,
    lng: -96.733082,
    status: "open",
    traffic: "moderate",
    waitTime: 9,
    address: "1590 S. Custer Road, McKinney, TX 75072",
    phone: "(972) 555-0108",
    hours: "Mon-Sat: 8AM-8PM, Sun: 8AM-8PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [3, 1, 0, 0, 0, 5, 15, 30, 42, 50, 55, 58, 60, 58, 55, 62, 65, 58, 45, 32, 22, 15, 8, 4],
    closureReason: ""
  },
  {
    id: "wash-9",
    name: "ZIPS Car Wash - Stacy",
    lat: 33.150408,
    lng: -96.698443,
    status: "closed",
    traffic: "low",
    waitTime: 0,
    address: "6102 Stacy Road, McKinney, TX 75070",
    phone: "(972) 555-0109",
    hours: "Mon-Sat: 8AM-8PM, Sun: 8AM-8PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 8, 15, 25, 35, 40, 45, 50, 48, 45, 50, 55, 48, 35, 25, 15, 8, 2, 0],
    closureReason: "Upgrading payment kiosk. Reopening tomorrow at 8 AM."
  },
  {
    id: "wash-10",
    name: "Oasis Auto Spa",
    lat: 33.14977,
    lng: -96.681353,
    status: "open",
    traffic: "low",
    waitTime: 3,
    address: "5001 Collin McKinney Pkwy, McKinney, TX 75070",
    phone: "(972) 555-0110",
    hours: "Mon-Sat: 8AM-7PM, Sun: 9AM-5PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 4, 10, 18, 25, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-11",
    name: "DFW Express Car Wash",
    lat: 32.809734,
    lng: -96.801223,
    status: "open",
    traffic: "moderate",
    waitTime: 10,
    address: "3411 Lemmon Ave, Dallas, TX 75204",
    phone: "(214) 555-0101",
    hours: "Mon-Sat: 7AM-8PM, Sun: 8AM-6PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [5, 2, 0, 0, 0, 0, 10, 25, 45, 60, 50, 55, 65, 70, 75, 80, 85, 70, 50, 30, 15, 10, 5, 5],
    closureReason: ""
  },
  {
    id: "wash-12",
    name: "Fort Worth Auto Spa",
    lat: 32.751084,
    lng: -97.341689,
    status: "open",
    traffic: "high",
    waitTime: 25,
    address: "1500 W 7th St, Fort Worth, TX 76102",
    phone: "(817) 555-0102",
    hours: "Mon-Sat: 8AM-9PM, Sun: 9AM-7PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [2, 0, 0, 0, 0, 5, 20, 40, 60, 75, 80, 85, 90, 88, 85, 92, 95, 88, 70, 55, 40, 25, 10, 5],
    closureReason: ""
  },
  {
    id: "wash-13",
    name: "Arlington Wave Express",
    lat: 32.7292,
    lng: -97.114716,
    status: "open",
    traffic: "moderate",
    waitTime: 12,
    address: "800 S Cooper St, Arlington, TX 76013",
    phone: "(817) 555-0104",
    hours: "Mon-Sun: 7AM-8PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 18, 30, 45, 55, 60, 62, 58, 65, 70, 75, 65, 50, 35, 20, 10, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-14",
    name: "Irving Laser Wash",
    lat: 32.854189,
    lng: -96.958997,
    status: "open",
    traffic: "moderate",
    waitTime: 8,
    address: "2200 N MacArthur Blvd, Irving, TX 75062",
    phone: "(972) 555-0106",
    hours: "Mon-Sat: 8AM-8PM, Sun: 9AM-6PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 18, 30, 45, 55, 60, 62, 58, 65, 70, 75, 65, 50, 35, 20, 10, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-15",
    name: "Metroplex Detailing & Wash",
    lat: 32.863346,
    lng: -96.645288,
    status: "open",
    traffic: "low",
    waitTime: 2,
    address: "1205 Northwest Hwy, Garland, TX 75041",
    phone: "(214) 555-0107",
    hours: "Mon-Sat: 8AM-7PM, Sun: Closed",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 2, 5, 10, 15, 20, 25, 30, 28, 25, 30, 35, 32, 20, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-16",
    name: "Mister Car Wash",
    lat: 32.6775,
    lng: -97.0210,
    status: "open",
    traffic: "high",
    waitTime: 20,
    address: "2980 I-20 W, Grand Prairie, TX 75052",
    phone: "(972) 555-0116",
    hours: "Mon-Sat: 7:30AM-8PM, Sun: 8AM-6PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 10, 25, 45, 65, 70, 75, 80, 85, 80, 75, 85, 90, 80, 65, 45, 30, 15, 5, 0],
    closureReason: ""
  },
  {
    id: "wash-17",
    name: "University Car Wash",
    lat: 33.229803,
    lng: -97.159162,
    status: "open",
    traffic: "low",
    waitTime: 5,
    address: "2215 W University Dr, Denton, TX 76201",
    phone: "(940) 555-0117",
    hours: "Mon-Sat: 8AM-7PM, Sun: 10AM-5PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 12, 18, 22, 25, 28, 30, 28, 25, 28, 32, 28, 20, 12, 5, 2, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-18",
    name: "Carrollton Express Car Wash",
    lat: 32.983908,
    lng: -96.909691,
    status: "open",
    traffic: "moderate",
    waitTime: 11,
    address: "2601 Old Denton Rd, Carrollton, TX 75007",
    phone: "(972) 555-0118",
    hours: "7:30 AM - 7:30 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 2, 10, 20, 35, 45, 50, 55, 58, 55, 50, 58, 62, 55, 40, 25, 12, 5, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-19",
    name: "Richardson Auto Spa",
    lat: 32.981784,
    lng: -96.768046,
    status: "open",
    traffic: "low",
    waitTime: 3,
    address: "1400 Coit Rd, Richardson, TX 75080",
    phone: "(972) 555-0119",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 4, 10, 18, 24, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-20",
    name: "Grapevine Express Wash",
    lat: 32.928357,
    lng: -97.085746,
    status: "open",
    traffic: "moderate",
    waitTime: 14,
    address: "1201 William D Tate Ave, Grapevine, TX 76051",
    phone: "(817) 555-0120",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 1, 8, 18, 30, 45, 50, 55, 58, 55, 52, 58, 65, 58, 45, 30, 18, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-21",
    name: "Southlake Detail & Suds",
    lat: 32.941378,
    lng: -97.122549,
    status: "open",
    traffic: "moderate",
    waitTime: 12,
    address: "2100 E Southlake Blvd, Southlake, TX 76092",
    phone: "(817) 555-0121",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 6, 15, 25, 35, 40, 45, 48, 45, 42, 48, 52, 45, 35, 25, 15, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-22",
    name: "Mansfield Wave Wash",
    lat: 32.568238,
    lng: -97.116381,
    status: "open",
    traffic: "low",
    waitTime: 5,
    address: "1600 Broad St, Mansfield, TX 76063",
    phone: "(817) 555-0122",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 3, 8, 15, 22, 25, 28, 30, 28, 25, 28, 32, 28, 20, 12, 5, 2, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-23",
    name: "Keller Touchless Car Wash",
    lat: 32.932168,
    lng: -97.228142,
    status: "closed",
    traffic: "low",
    waitTime: 0,
    address: "1000 Keller Pkwy, Keller, TX 76248",
    phone: "(817) 555-0123",
    hours: "Open 24 Hours",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [10, 8, 5, 2, 1, 4, 12, 22, 30, 35, 38, 40, 42, 40, 38, 42, 45, 40, 30, 22, 15, 12, 10, 8],
    closureReason: "Hydraulic pump replacement. Reopening Saturday morning."
  },
  {
    id: "wash-24",
    name: "Lewisville Auto Bath",
    lat: 33.038113,
    lng: -97.001232,
    status: "open",
    traffic: "low",
    waitTime: 2,
    address: "800 S Stemmons Fwy, Lewisville, TX 75067",
    phone: "(972) 555-0124",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 2, 6, 12, 18, 22, 25, 28, 25, 22, 25, 30, 25, 18, 10, 5, 2, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-25",
    name: "White Rock Lake Car Wash",
    lat: 32.819582,
    lng: -96.717649,
    status: "open",
    traffic: "moderate",
    waitTime: 10,
    address: "7100 Garland Rd, Dallas, TX 75218",
    phone: "(214) 555-0125",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 2, 8, 18, 30, 42, 48, 52, 55, 52, 48, 52, 58, 52, 40, 28, 15, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-26",
    name: "Longhorn Car Wash",
    lat: 33.084766,
    lng: -97.296501,
    status: "open",
    traffic: "low",
    waitTime: 3,
    address: "1096 FM 156, Justin, TX 76247",
    phone: "(940) 555-0201",
    hours: "Mon-Sat: 8AM-7PM, Sun: 8AM-5PM",
    ownership: "Family-owned and operated",
    openedDate: "Established",
    chemicals: "Reverse osmosis spot-free rinse, tri-color polish",
    equipment: "Recycled water system (70%)",
    trafficHistory: [0, 0, 0, 0, 0, 0, 2, 6, 12, 18, 20, 22, 25, 22, 20, 25, 30, 25, 18, 10, 4, 1, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-27",
    name: "Carnation Auto Spa - Roanoke",
    lat: 33.015872,
    lng: -97.218017,
    status: "open",
    traffic: "moderate",
    waitTime: 12,
    address: "1310 N. US Hwy 377, Roanoke, TX 76262",
    phone: "(817) 555-0202",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 1, 6, 15, 25, 35, 42, 45, 48, 45, 42, 48, 52, 45, 32, 22, 12, 5, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-28",
    name: "Clean Streak Auto Spa",
    lat: 33.004624,
    lng: -97.227049,
    status: "open",
    traffic: "high",
    waitTime: 22,
    address: "106 E Byron Nelson Blvd, Roanoke, TX 76262",
    phone: "(817) 555-0203",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [1, 0, 0, 0, 0, 5, 12, 25, 42, 55, 62, 68, 70, 68, 65, 72, 78, 70, 55, 38, 25, 15, 5, 2],
    closureReason: ""
  },
  {
    id: "wash-29",
    name: "Rocket Carwash",
    lat: 33.025294,
    lng: -97.273265,
    status: "open",
    traffic: "moderate",
    waitTime: 10,
    address: "8120 Gasoline Alley Dr, Northlake, TX 76262",
    phone: "(817) 555-0204",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 2, 8, 18, 30, 42, 48, 52, 55, 52, 48, 52, 58, 52, 40, 28, 15, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-30",
    name: "WhiteWater Express Car Wash",
    lat: 32.998607,
    lng: -97.049515,
    status: "open",
    traffic: "moderate",
    waitTime: 8,
    address: "2800 Spinks Rd, Flower Mound, TX 75028",
    phone: "(972) 555-0205",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 1, 8, 18, 30, 45, 50, 55, 58, 55, 52, 58, 65, 58, 45, 30, 18, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-31",
    name: "Landshark Car Wash",
    lat: 33.020194,
    lng: -97.070911,
    status: "open",
    traffic: "low",
    waitTime: 4,
    address: "2517 Long Prairie Rd, Flower Mound, TX 75022",
    phone: "(972) 555-0206",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 4, 10, 18, 24, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-32",
    name: "Raceway Car Wash",
    lat: 33.07151,
    lng: -97.057863,
    status: "open",
    traffic: "low",
    waitTime: 5,
    address: "1900 Justin Rd, Flower Mound, TX 75028",
    phone: "(972) 555-0207",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 3, 8, 15, 22, 25, 28, 30, 28, 25, 28, 32, 28, 20, 12, 5, 2, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-33",
    name: "ZIPS Car Wash - Flower Mound",
    lat: 33.034123,
    lng: -97.059836,
    status: "closed",
    traffic: "low",
    waitTime: 0,
    address: "2111 Cross Timbers Rd, Flower Mound, TX 75028",
    phone: "(972) 555-0208",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 8, 15, 25, 35, 40, 45, 50, 48, 45, 50, 55, 48, 35, 25, 15, 8, 2, 0],
    closureReason: "Electrical panel maintenance. Reopening tomorrow morning."
  },
  {
    id: "wash-34",
    name: "Tommy's Express Car Wash",
    lat: 33.150048,
    lng: -97.105225,
    status: "open",
    traffic: "moderate",
    waitTime: 7,
    address: "4530 Teasley Ln, Denton, TX 76210",
    phone: "(940) 555-0301",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 1, 10, 20, 32, 45, 52, 58, 62, 58, 55, 62, 68, 60, 48, 32, 20, 12, 5, 2],
    closureReason: ""
  },
  {
    id: "wash-35",
    name: "Wash Guys Car Wash",
    lat: 33.189228,
    lng: -97.102353,
    status: "open",
    traffic: "low",
    waitTime: 3,
    address: "2112 Sadau Ct, Denton, TX 76210",
    phone: "(940) 555-0302",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 12, 18, 25, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-36",
    name: "Kwik Kar Lube & Car Wash",
    lat: 33.229853,
    lng: -97.161237,
    status: "open",
    traffic: "moderate",
    waitTime: 15,
    address: "2303 W. University Dr., Denton, TX 76201",
    phone: "(940) 555-0303",
    hours: "8:00 AM - 6:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 8, 15, 25, 35, 42, 45, 48, 45, 42, 48, 52, 45, 32, 22, 12, 5, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-37",
    name: "Super Star Car Wash",
    lat: 33.230356,
    lng: -97.182064,
    status: "open",
    traffic: "moderate",
    waitTime: 9,
    address: "3200 W University Dr, Denton, TX 76207",
    phone: "(940) 555-0304",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 2, 8, 18, 30, 42, 48, 52, 55, 52, 48, 52, 58, 52, 40, 28, 15, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-38",
    name: "Wash Guys Car Wash - Frisco Preston",
    lat: 33.117396,
    lng: -96.806424,
    status: "open",
    traffic: "moderate",
    waitTime: 10,
    address: "4677 Preston Road, Frisco, TX 75034",
    phone: "(972) 555-0305",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 1, 6, 12, 22, 35, 42, 48, 50, 48, 45, 50, 55, 48, 35, 25, 15, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-39",
    name: "Wash Guys Car Wash - Frisco Lakes",
    lat: 33.142923,
    lng: -96.803953,
    status: "open",
    traffic: "low",
    waitTime: 4,
    address: "7740 Preston Road, Frisco, TX 75034",
    phone: "(972) 555-0306",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 4, 10, 18, 25, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-40",
    name: "Wash Guys Car Wash - Dallas Preston",
    lat: 32.996738,
    lng: -96.799406,
    status: "open",
    traffic: "moderate",
    waitTime: 8,
    address: "17931 Preston Road, Dallas, TX 75252",
    phone: "(214) 555-0307",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 2, 8, 18, 30, 42, 48, 52, 55, 52, 48, 52, 58, 52, 40, 28, 15, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-41",
    name: "Wash Guys Car Wash - Lewisville",
    lat: 33.057958,
    lng: -96.904702,
    status: "open",
    traffic: "high",
    waitTime: 22,
    address: "5000 TX-121, Lewisville, TX 75056",
    phone: "(972) 555-0308",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [1, 0, 0, 0, 0, 5, 12, 25, 42, 55, 62, 68, 70, 68, 65, 72, 78, 70, 55, 38, 25, 15, 5, 2],
    closureReason: ""
  },
  {
    id: "wash-42",
    name: "Wash Guys Car Wash - Little Elm",
    lat: 33.2205,
    lng: -96.9150,
    status: "open",
    traffic: "low",
    waitTime: 5,
    address: "26780 E US 380, Little Elm, TX 75068",
    phone: "(972) 555-0309",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 3, 8, 15, 22, 25, 28, 30, 28, 25, 28, 32, 28, 20, 12, 5, 2, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-43",
    name: "Wash Guys Car Wash - McKinney",
    lat: 33.131299,
    lng: -96.732408,
    status: "open",
    traffic: "moderate",
    waitTime: 12,
    address: "7249 Custer Rd, McKinney, TX 75070",
    phone: "(972) 555-0310",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 1, 6, 15, 25, 35, 42, 45, 48, 45, 42, 48, 52, 45, 32, 22, 12, 5, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-44",
    name: "Wash Guys Car Wash - The Colony",
    lat: 33.072086,
    lng: -96.89218,
    status: "open",
    traffic: "moderate",
    waitTime: 9,
    address: "4173 Main Street, The Colony, TX 75056",
    phone: "(972) 555-0311",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 1, 8, 18, 30, 45, 50, 55, 58, 55, 52, 58, 65, 58, 45, 30, 18, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-45",
    name: "Wash Guys Car Wash - Fort Worth",
    lat: 32.925039,
    lng: -97.317304,
    status: "open",
    traffic: "low",
    waitTime: 3,
    address: "8600 North Freeway, Fort Worth, TX 76177",
    phone: "(817) 555-0312",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 2, 6, 12, 18, 22, 25, 28, 25, 22, 25, 30, 25, 18, 10, 5, 2, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-46",
    name: "ZIPS Car Wash - Dallas NW",
    lat: 32.858379,
    lng: -96.861186,
    status: "open",
    traffic: "moderate",
    waitTime: 11,
    address: "3505 W Northwest Hwy, Dallas, TX 75220",
    phone: "(214) 555-0401",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 2, 10, 20, 35, 45, 50, 55, 58, 55, 50, 58, 62, 55, 40, 25, 12, 5, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-47",
    name: "ZIPS Car Wash - Lemmon",
    lat: 32.82355,
    lng: -96.818624,
    status: "open",
    traffic: "high",
    waitTime: 25,
    address: "5006 Lemmon Ave, Dallas, TX 75209",
    phone: "(214) 555-0402",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [2, 0, 0, 0, 0, 5, 20, 40, 60, 75, 80, 85, 90, 88, 85, 92, 95, 88, 70, 55, 40, 25, 10, 5],
    closureReason: ""
  },
  {
    id: "wash-48",
    name: "ZIPS Car Wash - Forest",
    lat: 32.909497,
    lng: -96.860213,
    status: "open",
    traffic: "moderate",
    waitTime: 10,
    address: "3541 Forest Ln, Dallas, TX 75234",
    phone: "(214) 555-0403",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 2, 8, 18, 30, 42, 48, 52, 55, 52, 48, 52, 58, 52, 40, 28, 15, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-49",
    name: "ZIPS Car Wash - Ross",
    lat: 32.808,
    lng: -96.77469,
    status: "open",
    traffic: "moderate",
    waitTime: 8,
    address: "5021 Ross Ave, Dallas, TX 75206",
    phone: "(214) 555-0404",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 1, 8, 18, 30, 45, 50, 55, 58, 55, 52, 58, 65, 58, 45, 30, 18, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-50",
    name: "ZIPS Car Wash - Frisco",
    lat: 33.17771,
    lng: -96.864657,
    status: "open",
    traffic: "low",
    waitTime: 4,
    address: "2835 Eldorado Pkwy, Frisco, TX 75033",
    phone: "(469) 555-0405",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 4, 10, 18, 24, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-51",
    name: "ZIPS Car Wash - Josey",
    lat: 33.06509,
    lng: -96.888427,
    status: "open",
    traffic: "low",
    waitTime: 3,
    address: "6100 N Josey Ln, The Colony, TX 75056",
    phone: "(972) 555-0406",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 3, 8, 15, 22, 25, 28, 30, 28, 25, 28, 32, 28, 20, 12, 5, 2, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-52",
    name: "ZIPS Car Wash - Westworth",
    lat: 32.76107,
    lng: -97.414088,
    status: "open",
    traffic: "low",
    waitTime: 2,
    address: "6705 Westworth Blvd, Westworth Village, TX 76114",
    phone: "(817) 555-0407",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 2, 6, 12, 18, 22, 25, 28, 25, 22, 25, 30, 25, 18, 10, 5, 2, 0, 0],
    closureReason: ""
  },
  {
    id: "wash-53",
    name: "Club Car Wash - Plano Preston",
    lat: 33.091537,
    lng: -96.804602,
    status: "open",
    traffic: "moderate",
    waitTime: 10,
    address: "8300 Preston Rd, Plano, TX 75024",
    phone: "(972) 555-0501",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 1, 10, 20, 32, 45, 52, 58, 62, 58, 55, 62, 68, 60, 48, 32, 20, 12, 5, 2],
    closureReason: ""
  },
  {
    id: "wash-54",
    name: "Club Car Wash - Frisco Eldorado",
    lat: 33.174627,
    lng: -96.825397,
    status: "open",
    traffic: "moderate",
    waitTime: 9,
    address: "4200 Eldorado Pkwy, Frisco, TX 75034",
    phone: "(469) 555-0502",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 2, 8, 18, 30, 42, 48, 52, 55, 52, 48, 52, 58, 52, 40, 28, 15, 8, 2, 0],
    closureReason: ""
  },
  {
    id: "wash-55",
    name: "Club Car Wash - McKinney Lake Forest",
    lat: 33.224728,
    lng: -96.679098,
    status: "open",
    traffic: "low",
    waitTime: 5,
    address: "2001 Lake Forest Dr, McKinney, TX 75071",
    phone: "(972) 555-0503",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 12, 18, 25, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-56",
    name: "Club Car Wash - Dallas Forest",
    lat: 32.9066,
    lng: -96.895151,
    status: "open",
    traffic: "high",
    waitTime: 20,
    address: "11800 Forest Ln, Dallas, TX 75234",
    phone: "(214) 555-0504",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 10, 25, 45, 65, 70, 75, 80, 85, 80, 75, 85, 90, 80, 65, 45, 30, 15, 5, 0],
    closureReason: ""
  },
  {
    id: "wash-57",
    name: "Club Car Wash - Fort Worth Hulen",
    lat: 32.677542,
    lng: -97.397275,
    status: "open",
    traffic: "moderate",
    waitTime: 12,
    address: "4800 S Hulen St, Fort Worth, TX 76132",
    phone: "(817) 555-0505",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 1, 6, 15, 25, 35, 42, 45, 48, 45, 42, 48, 52, 45, 32, 22, 12, 5, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-58",
    name: "Club Car Wash - Denton Loop 288",
    lat: 33.190692,
    lng: -97.09622,
    status: "open",
    traffic: "low",
    waitTime: 4,
    address: "1800 Brinker Rd, Denton, TX 76208",
    phone: "(940) 555-0506",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 4, 10, 18, 24, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-59",
    name: "Club Car Wash - Roanoke Hwy 377",
    lat: 33.010881,
    lng: -97.222402,
    status: "open",
    traffic: "moderate",
    waitTime: 7,
    address: "900 N Hwy 377, Roanoke, TX 76262",
    phone: "(817) 555-0507",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 1, 10, 20, 32, 45, 52, 58, 62, 58, 55, 62, 68, 60, 48, 32, 20, 12, 5, 2],
    closureReason: ""
  },
  {
    id: "wash-60",
    name: "Club Car Wash - Flower Mound Long Prairie",
    lat: 33.015909,
    lng: -97.070584,
    status: "open",
    traffic: "low",
    waitTime: 3,
    address: "2200 Long Prairie Rd, Flower Mound, TX 75022",
    phone: "(972) 555-0508",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 12, 18, 25, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-61",
    name: "Justin Speedy Wash",
    lat: 33.08472,
    lng: -97.29653,
    status: "open",
    traffic: "low",
    waitTime: 2,
    address: "100 W 1st St, Justin, TX 76247",
    phone: "(940) 555-1234",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 12, 18, 25, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-62",
    name: "Argyle Auto Spa",
    lat: 33.11821,
    lng: -97.18241,
    status: "open",
    traffic: "moderate",
    waitTime: 8,
    address: "410 US-377, Argyle, TX 76226",
    phone: "(940) 555-5678",
    hours: "8:00 AM - 7:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 12, 18, 25, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-63",
    name: "Keller Suds & Shine",
    lat: 32.93051,
    lng: -97.22642,
    status: "open",
    traffic: "high",
    waitTime: 18,
    address: "205 S Main St, Keller, TX 76248",
    phone: "(817) 555-9012",
    hours: "7:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 12, 18, 25, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  },
  {
    id: "wash-64",
    name: "Northlake Express Wash",
    lat: 33.05612,
    lng: -97.26981,
    status: "open",
    traffic: "low",
    waitTime: 5,
    address: "13000 TX-114, Northlake, TX 76262",
    phone: "(940) 555-3456",
    hours: "8:00 AM - 8:00 PM",
    ownership: "Unknown",
    openedDate: "Unknown",
    chemicals: "Unknown",
    equipment: "Unknown",
    trafficHistory: [0, 0, 0, 0, 0, 0, 5, 12, 18, 25, 28, 30, 32, 30, 28, 32, 35, 30, 22, 15, 8, 4, 1, 0],
    closureReason: ""
  }
];

const DEFAULT_CONSTRUCTION = [
  {
    id: "const-1",
    name: "GlowWash Plano West",
    lat: 33.026861,
    lng: -96.792129,
    address: "4900 W Park Blvd, Plano, TX 75093",
    stage: "framing",
    completion: "Q4 2026",
    operator: "GlowWash DFW LLC",
    details: "Next-gen express wash with 40 vacuum spaces and dual detail lanes."
  },
  {
    id: "const-2",
    name: "Clearwater Frisco East",
    lat: 33.138941,
    lng: -96.792522,
    address: "14200 Rolater Rd, Frisco, TX 75035",
    stage: "permitting",
    completion: "Summer 2027",
    operator: "Clearwater Ventures",
    details: "Eco-friendly touchless automatic wash specializing in reclaimed water recycling systems."
  },
  {
    id: "const-3",
    name: "QuickSuds McKinney North",
    lat: 33.217214,
    lng: -96.653156,
    address: "3000 W University Dr, McKinney, TX 75071",
    stage: "excavation",
    completion: "Q2 2027",
    operator: "QuickSuds Southwest",
    details: "Premium express tunnel wash with active underbody sprayers and ceramic coatings."
  },
  {
    id: "const-4",
    name: "Alliance Eco Wash",
    lat: 32.947069,
    lng: -97.311398,
    address: "9800 N Freeway, Fort Worth, TX 76177",
    stage: "permitting",
    completion: "Summer 2027",
    operator: "Clearwater Alliance LLC",
    details: "Dual tunnel touchless design utilizing 100% water reclamation technology."
  },
  {
    id: "const-5",
    name: "Stadium Express Wash",
    lat: 32.759045,
    lng: -97.092508,
    address: "1200 E Copeland Rd, Arlington, TX 76011",
    stage: "excavation",
    completion: "Q1 2027",
    operator: "QuickSuds Southwest",
    details: "Premium express wash with double prep station and dry-and-shine buffing arches."
  },
  {
    id: "const-6",
    name: "GlowWash Roanoke North",
    lat: 33.011918,
    lng: -97.235175,
    address: "1200 Byron Nelson Blvd, Roanoke, TX 76262",
    stage: "excavation",
    completion: "Q2 2027",
    operator: "GlowWash DFW LLC",
    details: "State-of-the-art 110-foot conveyor express tunnel."
  },
  {
    id: "const-7",
    name: "Take 5 Car Wash",
    lat: 32.753177,
    lng: -97.332746,
    address: "Summer Creek Dr & McPherson Blvd, Fort Worth, TX 76123",
    stage: "foundation",
    completion: "Q3 2026",
    operator: "Take 5 DFW",
    details: "Newly approved Take 5 express wash with 24 vacuum lanes."
  },
  {
    id: "const-8",
    name: "WhiteWater Express Car Wash",
    lat: 32.76157,
    lng: -97.165515,
    address: "8668 Cina Creek Parkway, Fort Worth, TX 76120",
    stage: "permitting",
    completion: "Q1 2027",
    operator: "WhiteWater DFW",
    details: "Express tunnel car wash featuring spot-free rinse and vacuum stations."
  },
  {
    id: "const-9",
    name: "Links Car Wash",
    lat: 32.524076,
    lng: -97.349249,
    address: "200 NW John Jones Dr, Burleson, TX 76028",
    stage: "framing",
    completion: "Q4 2026",
    operator: "Links Car Wash Burleson",
    details: "Brand new express wash replacing a former detail center, featuring 32 free vacuums."
  },
  {
    id: "const-10",
    name: "Caliber Car Wash",
    lat: 33.056313,
    lng: -96.713928,
    address: "1000 W Spring Creek Pkwy, Plano, TX 75023",
    stage: "equipment",
    completion: "Q3 2026",
    operator: "Caliber Car Wash DFW",
    details: "Premium express wash installing its new conveyor tunnel and ceramic protectant arch."
  },
  {
    id: "const-11",
    name: "Beach Club Car Wash",
    lat: 33.230421,
    lng: -97.183506,
    address: "3600 W University Dr, Denton, TX 76207",
    stage: "permitting",
    completion: "Q2 2027",
    operator: "Beach Club DFW LLC",
    details: "Planning phase for a new multi-lane touchless automatic wash facility."
  }
];

const DEFAULT_OFFERS = [
  {
    id: "offer-1",
    washId: "wash-1",
    title: "50% Off Ceramic Shield",
    description: "Get our absolute best exterior wash including Ceramic Shield and wheel glow coating for half price.",
    type: "discount",
    code: "CERAMIC50",
    expires: "2026-07-15"
  },
  {
    id: "offer-2",
    washId: "wash-2",
    title: "First Month Unlimited for $9.99",
    description: "Join the VIP Club today. Get unlimited washes for your first month for only $9.99. No lock-in contracts.",
    type: "subscription",
    code: "VIP999",
    expires: "2026-08-01"
  },
  {
    id: "offer-3",
    washId: "wash-3",
    title: "Eco Wash + Vacuum Combo",
    description: "Save $5 on our Premium Eco Wash which includes 30 minutes of high-suction vacuum usage.",
    type: "combo",
    code: "ECOSAVE5",
    expires: "2026-06-30"
  },
  {
    id: "offer-4",
    washId: "wash-5",
    title: "Free Rain Repellent Coating",
    description: "Upgrade any single wash with our hydrophobic rain repellent treatment completely free.",
    type: "freebie",
    code: "RAINFREE",
    expires: "2026-07-04"
  },
  {
    id: "offer-5",
    washId: "wash-7",
    title: "10% Senior & Veteran Discount",
    description: "Parkway Auto Spa honors seniors and military veterans with 10% off any single wash package.",
    type: "discount",
    code: "HONOR10",
    expires: "2026-12-31"
  },
  {
    id: "offer-6",
    washId: "wash-10",
    title: "Family Plan Wash Special",
    description: "Add a second vehicle to your Oasis Auto Spa monthly membership for just $14.99/mo.",
    type: "subscription",
    code: "OASISFAM",
    expires: "2026-09-01"
  },
  {
    id: "offer-7",
    washId: "wash-11",
    title: "Dallas VIP Special",
    description: "Get 30% off our Signature Exterior Detail wash package on Lemmon Ave.",
    type: "discount",
    code: "LEMMON30",
    expires: "2026-08-15"
  },
  {
    id: "offer-8",
    washId: "wash-12",
    title: "Fort Worth Unlimited Offer",
    description: "Enjoy your first 2 months of Fort Worth Auto Spa VIP Club for just $14.99/mo.",
    type: "subscription",
    code: "FTWVIP2",
    expires: "2026-07-31"
  },
  {
    id: "offer-9",
    washId: "wash-13",
    title: "Arlington Wave Coupon",
    description: "Get a free interior vacuum token with any Wave wash package.",
    type: "freebie",
    code: "ARLWAVE",
    expires: "2026-07-10"
  },
  {
    id: "offer-10",
    washId: "wash-21",
    title: "Southlake Detailing $15 Off",
    description: "Save $15 on any full service interior/exterior detailing package.",
    type: "discount",
    code: "SLKDET15",
    expires: "2026-08-31"
  },
  {
    id: "offer-11",
    washId: "wash-26",
    title: "Longhorn Grand Opening Special",
    description: "Save $5 on our Premium Longhorn wash including ceramic sealant.",
    type: "discount",
    code: "LONGHORN5",
    expires: "2026-07-31"
  },
  {
    id: "offer-12",
    washId: "wash-29",
    title: "Rocket Unlimited Club $9.99",
    description: "Get unlimited washes for your first month of Rocket Club membership.",
    type: "subscription",
    code: "ROCKET999",
    expires: "2026-08-15"
  }
];

function populateWashDetails(w) {
  const name = w.name.toLowerCase();

  // 1. Deterministic Google Reviews Generator
  let hash = 0;
  for (let i = 0; i < w.id.length; i++) {
    hash = w.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const ratingVal = 3.8 + Math.abs(hash % 12) * 0.1;
  w.rating = Number(ratingVal.toFixed(1));
  w.reviewCount = 240 + Math.abs(hash % 2000);
  // Additional enriched fields
  w.established = 2020; // Placeholder year of establishment
  w.acquired = "Acquired from XYZ in 2019"; // Placeholder acquisition history
  w.chemicalSupplier = "ChemCo Inc."; // Placeholder chemical supplier
  w.equipmentSupplier = "EquipCo LLC"; // Placeholder equipment supplier
  w.equipmentType = ["Touchless"]; // Placeholder equipment type list
  w.holidayClosures = []; // Placeholder for holiday closure dates

  // 2. Brand-Specific Content Configurations
  if (name.includes("tommy terrific")) {
    w.summary = "Premium full-service car wash in Plano featuring professional hand washes, leather conditioning, and detail finishing.";
    w.website = "https://tommyterrificscarwash.com";
    w.serviceType = "full-service";
    w.equipment = ["Full-Service Conveyor Tunnel", "Soft-Cloth Mitter Curtains", "Neotex Foam Brushes", "Ceramic Shield Arch", "Hand-Dry Finish"];
    w.holidays = "Closed on Thanksgiving, Christmas Day, & New Year's Day";
    w.products = [
      { name: "Good Exterior Wash", price: 12.00 },
      { name: "Better Exterior Wash", price: 16.00 },
      { name: "MAX Exterior Wash", price: 20.00 },
      { name: "MAX Full Service Wash", price: 35.00 },
      { name: "Mini Detail Service", price: 75.00 }
    ];
    w.plans = [
      { name: "Good Exterior Unlimited", price: 26.00 },
      { name: "Better Exterior Unlimited", price: 32.00 },
      { name: "MAX Exterior Unlimited", price: 38.00 },
      { name: "MAX Full Service Unlimited", price: 59.99 }
    ];
  } else if (name.includes("tommy's express") || (name.includes("tommy") && name.includes("express"))) {
    w.summary = "Tommy's Express Car Wash offers national-standard automated car washing with a high-performance flight deck conveyor and high-suction vacuums.";
    w.website = "https://tommys-express.com";
    w.serviceType = "express";
    w.equipment = ["110ft Dual-Belt Flight Deck", "Tommy Transporter Conveyor", "High-Pressure Arch Washers", "Tire Shine Applicator", "Spot-Free RO Water", "Vacutech High-Suction Vacuums"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Quality Wash", price: 9.00 },
      { name: "Super Wash", price: 13.00 },
      { name: "Ultimate Wash", price: 16.00 },
      { name: "WORKS Wash", price: 20.00 }
    ];
    w.plans = [
      { name: "Quality Unlimited", price: 19.99 },
      { name: "Super Unlimited", price: 26.99 },
      { name: "Ultimate Unlimited", price: 31.99 },
      { name: "WORKS Unlimited", price: 37.99 }
    ];
  } else if (name.includes("carnation")) {
    w.summary = "Comprehensive auto spa and detailing center offering express automated washes, full interior cleaning, and paint correction.";
    w.website = "https://carnationautospa.com";
    w.serviceType = "full-service";
    w.equipment = ["Conveyor Tunnel System", "Soft-Touch Foam Wraps", "Reverse Osmosis Rinse", "Vacutech Vacuums", "Hand-Detailing Bays"];
    w.holidays = "Closed on Thanksgiving, Christmas Day, & New Year's Day";
    w.products = [
      { name: "Carnation Express Wash", price: 10.00 },
      { name: "Carnation Full Service", price: 30.00 },
      { name: "Complete Auto Spa Detail", price: 120.00 }
    ];
    w.plans = [
      { name: "Express Unlimited Pass", price: 22.99 },
      { name: "Full Service VIP Membership", price: 49.99 }
    ];
  } else if (name.includes("zips")) {
    w.summary = "High-speed express wash tunnel with free self-serve vacuums, towel stations, and advanced ceramic coating protectants.";
    w.website = "https://zipscarwash.com";
    w.serviceType = "express";
    w.equipment = ["High-Speed Conveyor Tunnel", "Z-Tread Tire Shine Applicator", "Ceramic Luster Arch", "Dry-and-Shine Buffing Wheels", "Free Towel & Cleaner Carts", "High-Power Vacuum Stations"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Basic Wash", price: 12.00 },
      { name: "Basic Plus Wash", price: 18.00 },
      { name: "Pro Wash", price: 22.00 },
      { name: "Premier Wash", price: 26.00 }
    ];
    w.plans = [
      { name: "Basic Plus Unlimited", price: 29.99 },
      { name: "Pro Unlimited", price: 34.99 },
      { name: "Premier Unlimited", price: 39.99 }
    ];
  } else if (name.includes("club car wash")) {
    w.summary = "Club Car Wash DFW offers premier express exterior washing with an advanced conveyor belt tunnel, foam bath arches, and ceramic finishes.";
    w.website = "https://clubcarwash.com";
    w.serviceType = "express";
    w.equipment = ["Conveyor Tunnel System", "Triple-Foam Bath Arches", "Ceramic X Graphene Shield", "Vacutech High-Suction Vacuums", "Spot-Free Water Rinse Manifold"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Rookie Wash", price: 10.00 },
      { name: "VIP Wash", price: 15.00 },
      { name: "Elite Wash", price: 20.00 },
      { name: "MVP Wash", price: 25.00 }
    ];
    w.plans = [
      { name: "Rookie Unlimited Club", price: 24.00 },
      { name: "VIP Unlimited Club", price: 30.00 },
      { name: "Elite Unlimited Club", price: 36.00 },
      { name: "MVP Unlimited Club", price: 42.00 }
    ];
  } else if (name.includes("whitewater")) {
    w.summary = "High-speed express car wash with free vacuums, microfiber towels, and self-serve mat cleaners.";
    w.website = "https://whitewatercw.com";
    w.serviceType = "express";
    w.equipment = ["Express Conveyor Tunnel", "Reverse Osmosis Rinse", "Ceramic Protectant Arch", "Vacutech Vacuums"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "WhiteWater Basic Wash", price: 9.00 },
      { name: "WhiteWater Wheel Deal", price: 16.00 },
      { name: "WhiteWater Ceramic Guard", price: 22.00 }
    ];
    w.plans = [
      { name: "Basic Unlimited Club", price: 19.99 },
      { name: "Ceramic Guard VIP Pass", price: 31.99 }
    ];
  } else if (name.includes("rocket")) {
    w.summary = "Rocket Carwash offers express exterior washes with free vacuums, hot-air dryers, and tire prep machines.";
    w.website = "https://rocketcarwash.com";
    w.serviceType = "express";
    w.equipment = ["Express Conveyor Tunnel", "Hot Wax Arch", "Ceramic Sealant System", "Tire Prep Machine", "Vacutech Vacuums"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Rocket Basic Wash", price: 10.00 },
      { name: "Rocket Hot Wax & Shine", price: 18.00 },
      { name: "Rocket Ceramic Protect", price: 24.00 }
    ];
    w.plans = [
      { name: "Rocket Basic Unlimited", price: 21.99 },
      { name: "Rocket VIP Unlimited Club", price: 36.99 }
    ];
  } else if (name.includes("clean getaway")) {
    w.summary = "DFW area express wash providing quick washes, high-power free vacuums, and clean towels.";
    w.website = "https://cleangetawayfrisco.com";
    w.serviceType = "express";
    w.equipment = ["Soft-Touch Conveyor Tunnel", "Spot-Free Rinse", "Vacuum Bays", "Dryer Arches"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Clean Getaway Basic", price: 9.00 },
      { name: "Clean Getaway Deluxe", price: 15.00 },
      { name: "Clean Getaway Extreme Ceramic", price: 22.00 }
    ];
    w.plans = [
      { name: "Deluxe Unlimited Club", price: 24.00 },
      { name: "Extreme Ceramic Unlimited", price: 34.00 }
    ];
  } else if (name.includes("longhorn")) {
    w.summary = "Justin local car wash featuring a state-of-the-art tunnel wash alongside self-serve bays and dual-hose vacuums.";
    w.website = "https://longhorncarwashtx.com";
    w.serviceType = "self-serve";
    w.equipment = ["Conveyor Tunnel System", "Self-Serve Bay Wands", "Ceramic Arch", "Dryer Arches", "Dual-Hose Vacuums"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Longhorn Basic", price: 8.00 },
      { name: "Longhorn Deluxe Polish", price: 14.00 },
      { name: "Longhorn Ceramic Shield", price: 20.00 }
    ];
    w.plans = [
      { name: "Longhorn Basic Unlimited", price: 18.99 },
      { name: "Longhorn Ceramic VIP Club", price: 28.99 }
    ];
  } else if (name.includes("raceway")) {
    w.summary = "Express wash tunnel in Flower Mound offering fast cleaning, wheel scrubbers, and high-power free vacuums.";
    w.website = "https://racewaycarwash.com";
    w.serviceType = "express";
    w.equipment = ["Express Conveyor Tunnel", "Foam Bath Arch", "Wheel Blasters", "High-Power Blowers"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Pit Stop Wash", price: 10.00 },
      { name: "Full Throttle Wash", price: 17.00 },
      { name: "Grand Champion Wash", price: 24.00 }
    ];
    w.plans = [
      { name: "Pit Stop Unlimited Club", price: 21.99 },
      { name: "Full Throttle Unlimited Club", price: 31.99 },
      { name: "Grand Champion Unlimited Club", price: 39.99 }
    ];
  } else if (name.includes("landshark")) {
    w.summary = "Flower Mound express tunnel car wash specializing in deep wheel cleaning, tire shine, and hot wax treatments.";
    w.website = "https://landsharkwash.com";
    w.serviceType = "express";
    w.equipment = ["Express Conveyor Tunnel", "Ceramic Fusion Arch", "Wheel Cleaners", "Tire Shine Applicators"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Landshark Basic", price: 10.00 },
      { name: "Landshark Deluxe", price: 16.00 },
      { name: "Landshark Ceramic Fusion", price: 24.00 }
    ];
    w.plans = [
      { name: "Landshark Deluxe Unlimited", price: 24.99 },
      { name: "Landshark Ceramic VIP Club", price: 34.99 }
    ];
  } else if (name.includes("oasis")) {
    w.summary = "Full-service auto spa in McKinney offering detail cleaning, hand washes, leather conditioning, and paint protectants.";
    w.website = "https://oasisautospatx.com";
    w.serviceType = "full-service";
    w.equipment = ["Detailing Bays", "Hand-Wash Tubs", "Steam Extractors", "Leather Care Instruments"];
    w.holidays = "Closed on Thanksgiving, Christmas Day, & New Year's Day";
    w.products = [
      { name: "Oasis Hand Wash", price: 22.00 },
      { name: "Oasis Full Service Spa", price: 40.00 },
      { name: "Oasis Showroom Detail", price: 125.00 }
    ];
    w.plans = [
      { name: "Oasis Hand Wash Club (2/mo)", price: 34.99 },
      { name: "Oasis VIP Spa Unlimited", price: 79.99 }
    ];
  } else if (name.includes("dfw express")) {
    w.summary = "Lemmon Ave express tunnel wash with high-speed blow dryers and self-serve vacuum bays.";
    w.website = "https://dfwexpresswash.com";
    w.serviceType = "express";
    w.equipment = ["Express Tunnel Wash", "Ceramic Shield Arch", "Blow Dryer Arches", "Self-Serve Vacuums"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "DFW Express Basic", price: 9.00 },
      { name: "DFW Express Deluxe", price: 15.00 },
      { name: "DFW Ceramic Shield", price: 22.00 }
    ];
    w.plans = [
      { name: "DFW Express Unlimited Pass", price: 19.99 },
      { name: "DFW Ceramic VIP Club", price: 29.99 }
    ];
  } else if (name.includes("fort worth auto")) {
    w.summary = "Downtown Fort Worth full service auto spa specializing in executive hand-washing and high-end detailing.";
    w.website = "https://fortworthautospa.com";
    w.serviceType = "full-service";
    w.equipment = ["Luxury Hand-Wash Bays", "Paint Correction Buffers", "Leather Conditioning Tools", "Deep Extraction Steamers"];
    w.holidays = "Closed on Thanksgiving, Christmas Day, & New Year's Day";
    w.products = [
      { name: "Signature Hand Wash", price: 25.00 },
      { name: "Executive Spa Wash", price: 45.00 },
      { name: "Fort Worth Premium Detail", price: 140.00 }
    ];
    w.plans = [
      { name: "Executive Clean Club (2/mo)", price: 39.99 },
      { name: "VIP Detailing Pass", price: 89.99 }
    ];
  } else if (name.includes("arlington wave") || name.includes("wave express")) {
    w.summary = "Express wash near Cooper St in Arlington featuring LED lights, double prep arches, and high-suction vacuums.";
    w.website = "https://arlingtonwave.com";
    w.serviceType = "express";
    w.equipment = ["Express Conveyor Tunnel", "LED Light Show Arch", "Ceramic Shield System", "Free Vacuums"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Wave Basic Wash", price: 9.00 },
      { name: "Wave Deluxe Polish", price: 15.00 },
      { name: "Wave Ceramic Shield", price: 22.00 }
    ];
    w.plans = [
      { name: "Wave Unlimited Pass", price: 19.99 },
      { name: "Wave Ceramic VIP Club", price: 29.99 }
    ];
  } else if (name.includes("irving laser")) {
    w.summary = "Touchless automatic wash in Irving featuring 24/7 laser sprayers and eco-friendly reclaim systems.";
    w.website = "https://irvinglaserwash.com";
    w.serviceType = "self-serve";
    w.equipment = ["Touchless LaserWash 360", "High-Pressure Water Jets", "RO Spot-Free Water", "24/7 Kiosk System"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Touchless Eco Wash", price: 12.00 },
      { name: "Laser Deluxe Protect", price: 18.00 },
      { name: "Platinum Laser Touchless", price: 24.00 }
    ];
    w.plans = [
      { name: "Green Laser Unlimited Pass", price: 24.99 },
      { name: "Laser VIP Unlimited Club", price: 34.99 }
    ];
  } else if (name.includes("metroplex")) {
    w.summary = "Garland detailing shop offering hand wash services, machine buffing, and professional carpet shampoos.";
    w.website = "https://metroplexdetailing.com";
    w.serviceType = "full-service";
    w.equipment = ["Professional Buffer & Polisher", "Hot Water Carpet Extractors", "Leather Treatment Sprayers"];
    w.holidays = "Closed on Thanksgiving, Christmas Day, & New Year's Day";
    w.products = [
      { name: "Metroplex Hand Wash", price: 20.00 },
      { name: "Metroplex Interior Detail", price: 65.00 },
      { name: "Metroplex Exterior Detail", price: 65.00 }
    ];
    w.plans = [
      { name: "Metroplex VIP Hand Wash (2/mo)", price: 29.99 },
      { name: "Metroplex Full Care Pass", price: 59.99 }
    ];
  } else if (name.includes("mister")) {
    w.summary = "Mister Car Wash offers premium exterior conveyor washes, hot wax sealants, and custom wheel cleaning.";
    w.website = "https://mistercarwash.com";
    w.serviceType = "express";
    w.equipment = ["Mister Express Conveyor", "Titanium Wax System", "TGW Wheel Scrubbers", "High-Power Air Dryers"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Base Exterior Wash", price: 10.00 },
      { name: "Platinum Exterior Wash", price: 20.00 },
      { name: "Titanium Exterior Wash", price: 28.00 }
    ];
    w.plans = [
      { name: "Base Unlimited", price: 22.99 },
      { name: "Platinum Unlimited", price: 32.99 },
      { name: "Titanium Unlimited", price: 39.99 }
    ];
  } else if (name.includes("university")) {
    w.summary = "Touchless automatic and self-serve bay car wash in Denton with high-pressure underbody flushes and fast blow-dryers.";
    w.website = "https://universitycarwashdenton.com";
    w.serviceType = "self-serve";
    w.equipment = ["Touchless Automatic", "LaserWash Systems", "Self-Serve Spray Wands", "Underbody Flushing Jets"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "University Touchless Basic", price: 10.00 },
      { name: "University Laser Deluxe", price: 16.00 },
      { name: "University Platinum Touchless", price: 22.00 }
    ];
    w.plans = [
      { name: "Green Touchless Unlimited Pass", price: 22.99 },
      { name: "University Laser VIP Club", price: 32.99 }
    ];
  } else if (name.includes("carrollton")) {
    w.summary = "Carrollton automated conveyor wash featuring soft-touch foam rollers and rain repellent treatments.";
    w.website = "https://carrolltonexpresswash.com";
    w.serviceType = "express";
    w.equipment = ["Conveyor Tunnel System", "Foam Bath Arches", "Ceramic Coating System", "Towel Stations"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Carrollton Basic", price: 9.00 },
      { name: "Carrollton Super Shine", price: 15.00 },
      { name: "Carrollton Ceramic Guard", price: 22.00 }
    ];
    w.plans = [
      { name: "Carrollton Express Pass", price: 19.99 },
      { name: "Carrollton Ceramic VIP Club", price: 29.99 }
    ];
  } else if (name.includes("richardson")) {
    w.summary = "Premium auto detailing and full-service hand car wash serving the Richardson area.";
    w.website = "https://richardsonautospa.com";
    w.serviceType = "full-service";
    w.equipment = ["Hand-Wash Bays", "Interior Cleaning Tools", "Professional Detailing Equipment"];
    w.holidays = "Closed on Thanksgiving, Christmas Day, & New Year's Day";
    w.products = [
      { name: "Signature Hand Wash", price: 24.00 },
      { name: "Full Service Spa Wash", price: 42.00 },
      { name: "Richardson Supreme Detail", price: 130.00 }
    ];
    w.plans = [
      { name: "Elite Clean Club (2/mo)", price: 34.99 },
      { name: "Richardson Unlimited VIP", price: 79.99 }
    ];
  } else if (name.includes("grapevine")) {
    w.summary = "Express conveyor car wash on William D Tate Ave featuring double-prep lanes and free vacuum bays.";
    w.website = "https://grapevineexpresswash.com";
    w.serviceType = "express";
    w.equipment = ["Express Conveyor Tunnel", "Double Prep Arches", "Tire Dresser", "Vacuum Bays"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Grapevine Basic", price: 9.00 },
      { name: "Grapevine Deluxe Polish", price: 15.00 },
      { name: "Grapevine Ceramic Protect", price: 22.00 }
    ];
    w.plans = [
      { name: "Grapevine Express Pass", price: 19.99 },
      { name: "Grapevine VIP Ceramic Club", price: 29.99 }
    ];
  } else if (name.includes("southlake")) {
    w.summary = "High-end luxury auto detailing spa in Southlake specializing in clay bar treatments, leather treatments, and ceramic coatings.";
    w.website = "https://southlakedetailsuds.com";
    w.serviceType = "full-service";
    w.equipment = ["Executive Detailing Bays", "Clay Bar Kits", "Leather Conditioning Steamers", "Ceramic Coating Infusion"];
    w.holidays = "Closed on Thanksgiving, Christmas Day, & New Year's Day";
    w.products = [
      { name: "Luxury Hand Wash", price: 30.00 },
      { name: "Interior Rejuvenation Wash", price: 75.00 },
      { name: "Complete Showroom Detail", price: 150.00 }
    ];
    w.plans = [
      { name: "Luxury Hand Wash Club (2/mo)", price: 49.99 },
      { name: "Southlake Unlimited VIP Pass", price: 99.99 }
    ];
  } else if (name.includes("mansfield")) {
    w.summary = "Conveyor tunnel wash in Mansfield offering quick cleaning, hot wax treatments, and high-suction vacuums.";
    w.website = "https://mansfieldwavewash.com";
    w.serviceType = "express";
    w.equipment = ["Conveyor Tunnel System", "Soft-Cloth Wraps", "Wax Arches", "High-Power Blowers", "Free Vacuum Stations"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Mansfield Express", price: 9.00 },
      { name: "Mansfield Super Shine", price: 15.00 },
      { name: "Mansfield Ceramic Guard", price: 22.00 }
    ];
    w.plans = [
      { name: "Mansfield Express Pass", price: 19.99 },
      { name: "Mansfield Ceramic VIP Club", price: 29.99 }
    ];
  } else if (name.includes("keller")) {
    w.summary = "Eco-friendly touchless automatic wash in Keller utilizing recycled water systems and high-pressure laser sprayers.";
    w.website = "https://kellertouchless.com";
    w.serviceType = "self-serve";
    w.equipment = ["Touchless Automatic", "LaserWash Systems", "Water Reclamation Reclaimers", "24/7 Kiosk"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Touchless Eco Wash", price: 12.00 },
      { name: "Laser Deluxe Protect", price: 18.00 },
      { name: "Platinum Laser Touchless", price: 24.00 }
    ];
    w.plans = [
      { name: "Green Laser Unlimited Pass", price: 24.99 },
      { name: "Laser VIP Unlimited Club", price: 34.99 }
    ];
  } else if (name.includes("lewisville")) {
    w.summary = "Touchless automatic and self-serve bay car wash in Lewisville featuring 24/7 high-pressure cleaning and soft-water filtration.";
    w.website = "https://lewisvilleautobath.com";
    w.serviceType = "self-serve";
    w.equipment = ["Touchless Automatic", "High-Pressure Laser Jets", "Self-Serve Spray Wands", "Soft Water Filtration"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Lewisville Touchless Basic", price: 10.00 },
      { name: "Lewisville Laser Deluxe", price: 16.00 },
      { name: "Lewisville Platinum Touchless", price: 22.00 }
    ];
    w.plans = [
      { name: "Green Touchless Unlimited Pass", price: 22.99 },
      { name: "Lewisville Laser VIP Club", price: 32.99 }
    ];
  } else if (name.includes("white rock")) {
    w.summary = "Eco-friendly tunnel car wash in East Dallas near Garland Rd featuring state-of-the-art paint-safe cleaning.";
    w.website = "https://whiterocklakecarwash.com";
    w.serviceType = "express";
    w.equipment = ["Soft-Touch Conveyor Tunnel", "Triple-Foam Arch", "Ceramic Shield Guard", "Free Vacuums"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "White Rock Basic", price: 10.00 },
      { name: "White Rock Deluxe Polish", price: 16.00 },
      { name: "White Rock Ceramic Shield", price: 24.00 }
    ];
    w.plans = [
      { name: "White Rock Unlimited Pass", price: 22.99 },
      { name: "White Rock Ceramic VIP Club", price: 34.99 }
    ];
  } else if (name.includes("vibe")) {
    w.summary = "Vibe Car Wash in Plano offers modern express washes with high-speed blowers, premium active wax sealants, and free self-serve vacuums.";
    w.website = "https://vibecw.com";
    w.serviceType = "express";
    w.equipment = ["Conveyor Tunnel System", "Diamond Graphene Arch", "Platinum Wax Applicator", "Vacutech Vacuum Arches", "Underbody Flushing Jets"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Vibe Express Wash", price: 12.00 },
      { name: "Vibe Platinum VIP Wash", price: 20.00 },
      { name: "Vibe Diamond VIP Wash", price: 25.00 },
      { name: "Vibe Graphene Extreme Wash", price: 30.00 }
    ];
    w.plans = [
      { name: "Basic Unlimited Pass", price: 22.99 },
      { name: "Platinum VIP Unlimited", price: 29.99 },
      { name: "Diamond Graphene VIP Club", price: 36.99 },
      { name: "Graphene Extreme Unlimited", price: 44.99 }
    ];
  } else if (name.includes("qwikwash")) {
    w.summary = "QwikWash America! in Frisco is a premier flex-service car wash and lube center offering quality washes, custom detail services, oil changes, and state inspections.";
    w.website = "https://qwikwash.com";
    w.serviceType = "express";
    w.equipment = ["Conveyor Tunnel System", "Soft-Cloth Polish Arches", "Wheel Wash Blasters", "Oil Change & Lube Bays", "State Inspection Equipment"];
    w.holidays = "Closed on Thanksgiving, Christmas Day, & Easter Sunday";
    w.products = [
      { name: "Basic Wash", price: 8.00 },
      { name: "Old Glory Wash", price: 11.00 },
      { name: "Stars and Stripes Wash", price: 16.00 },
      { name: "The All American Wash", price: 23.00 },
      { name: "Interior Qwik Upgrade", price: 13.00 }
    ];
    w.plans = [
      { name: "Old Glory Unlimited", price: 24.99 },
      { name: "Stars & Stripes Unlimited", price: 34.99 },
      { name: "All American Unlimited", price: 44.99 }
    ];
  } else if (name.includes("legacy")) {
    w.summary = "Legacy Car Wash & Detail Center in Frisco offers professional interior/exterior car washing, express detailing services, and high-end vehicle restoration.";
    w.website = "https://www.legacycarwashfrisco.com";
    w.serviceType = "full-service";
    w.equipment = ["Express Exterior Tunnel", "Self-Serve Vacuums", "Detail Spray Stations", "Executive Detailing Bays"];
    w.holidays = "Closed on Thanksgiving, Christmas Day, & New Year's Day";
    w.products = [
      { name: "Express Exterior Wash", price: 6.00 },
      { name: "Express Seats Detail", price: 89.00 },
      { name: "Express Carpets Detail", price: 89.00 },
      { name: "Legacy Platinum Detail", price: 299.00 }
    ];
    w.plans = [
      { name: "Legacy Basic Unlimited", price: 19.99 },
      { name: "Legacy VIP Unlimited", price: 39.99 }
    ];
  } else if (name.includes("parkway")) {
    w.summary = "Comprehensive car wash and detailing center in McKinney offering exterior washes, full-service interior/exterior cleaning, and professional detailing.";
    w.website = "https://parkwayautospa.com";
    w.serviceType = "full-service";
    w.equipment = ["Conveyor Tunnel System", "Soft-Cloth Wraps", "Wax Arches", "High-Power Blowers", "Free Vacuum Stations"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Good Exterior Wash", price: 8.00 },
      { name: "Better Exterior Wash", price: 12.00 },
      { name: "Best Exterior Wash", price: 16.00 },
      { name: "Ultimate Exterior Wash", price: 23.00 },
      { name: "Full-Service Upgrade", price: 26.00 }
    ];
    w.plans = [
      { name: "Basic Monthly Plan", price: 19.00 },
      { name: "Ultimate Monthly Plan", price: 39.00 }
    ];
  } else if (name.includes("clean streak")) {
    w.summary = "Clean Streak Auto Spa in Roanoke offers premium car washes, full detailing packages, hand waxing, and monthly unlimited memberships.";
    w.website = "https://cleanstreakautospatx.com";
    w.serviceType = "full-service";
    w.equipment = ["Conveyor Tunnel System", "Detailing Buffers", "Tire Gloss Brushes", "Extraction Steamers"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Hand Wash Special", price: 49.00 },
      { name: "Hand Wax Treatment", price: 69.00 },
      { name: "Carpet & Mat Treatment", price: 69.00 },
      { name: "Interior Super Clean", price: 80.00 },
      { name: "Complete Detail Package", price: 220.00 }
    ];
    w.plans = [
      { name: "Silver Membership", price: 31.00 },
      { name: "Gold Membership", price: 34.00 },
      { name: "Platinum Membership", price: 39.00 }
    ];
  } else if (name.includes("wash guys")) {
    w.summary = "Wash Guys Car Wash is known for hand-prepping and hand-drying vehicles, mirror blow-outs, and premium cleaning products.";
    w.website = "https://washguystx.com";
    w.serviceType = "express";
    w.equipment = ["Soft-Touch Conveyor Tunnel", "Underbody Flush Jets", "Tire Dressing Arches", "Microfiber Hand-Dry Finish"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Wash Guys Express", price: 10.00 },
      { name: "Wash Guys Deluxe", price: 18.00 },
      { name: "Wash Guys Works", price: 25.00 },
      { name: "Wash Guys Full Service", price: 39.99 }
    ];
    w.plans = [
      { name: "Express Unlimited Pass", price: 24.99 },
      { name: "Deluxe Unlimited Pass", price: 34.99 },
      { name: "Works Unlimited Pass", price: 44.99 },
      { name: "Full Service VIP Club", price: 69.99 }
    ];
  } else if (name.includes("kwik kar")) {
    w.summary = "Kwik Kar offers full-service auto maintenance, oil changes, and professional vehicle washing & detailing.";
    w.website = "https://kwikkardenton.com";
    w.serviceType = "full-service";
    w.equipment = ["Full Service Wash Tunnel", "Lube & Oil Maintenance Bays", "Automatic Wash Tunnel", "Detailing Service Bays"];
    w.holidays = "Closed on Thanksgiving, Christmas Day, & New Year's Day";
    w.products = [
      { name: "Full Service Wash", price: 24.99 },
      { name: "Manager's Special", price: 39.99 },
      { name: "Executive Detail", price: 79.99 },
      { name: "Full Detailing Package", price: 169.99 }
    ];
    w.plans = [
      { name: "Full Service Unlimited", price: 49.99 },
      { name: "Manager's Special Unlimited", price: 69.99 }
    ];
  } else if (name.includes("super star")) {
    w.summary = "Super Star Car Wash offers automated express washes, triple-foam polishes, ceramic sealants with graphene, and high-power vacuums.";
    w.website = "https://superstarcarwash.com";
    w.serviceType = "express";
    w.equipment = ["Automated Conveyor Tunnel", "Triple-Foam Arches", "Super Star Graphene Shield", "Spot-Free Water Rinse", "High-Velocity Air Dryers"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Basic Wash", price: 9.00 },
      { name: "Super Star Wash", price: 16.00 },
      { name: "Mega Star Wash", price: 21.00 },
      { name: "Super Protect Graphene", price: 26.00 }
    ];
    w.plans = [
      { name: "Basic Unlimited", price: 19.99 },
      { name: "Super Star Unlimited", price: 29.99 },
      { name: "Mega Star Unlimited", price: 34.99 },
      { name: "Super Protect Unlimited", price: 39.99 }
    ];
  } else {
    // General fallback archetype
    w.summary = "High-speed express exterior tunnel wash featuring state-of-the-art cleaning technology and free self-serve vacuums.";
    w.website = "https://expresscarwash.com";
    w.serviceType = "express";
    w.equipment = ["Conveyor Tunnel System", "Soft-Cloth Mitter Curtains", "High-Power Vacuum Stations"];
    w.holidays = "Closed on Thanksgiving & Christmas Day";
    w.products = [
      { name: "Express Exterior Wash", price: 9.00 },
      { name: "Deluxe Polish & Shine", price: 15.00 },
      { name: "Ceramic Shield Premium", price: 22.00 }
    ];
    w.plans = [
      { name: "Express Unlimited Pass", price: 19.99 },
      { name: "VIP Unlimited Ceramic Club", price: 29.99 }
    ];
  }

  // Generate structured weeklyHours based on w.hours if not already set
  if (!w.weeklyHours) {
    if (w.hours.toLowerCase().includes("24 hours")) {
      w.weeklyHours = {
        "Mon - Sun": "Open 24 Hours"
      };
    } else {
      const timeRange = w.hours;
      const lowerName = w.name.toLowerCase();

      let sunHours = timeRange;
      let satHours = timeRange;
      let weekdayHours = timeRange;

      if (lowerName.includes("metroplex") || lowerName.includes("southlake")) {
        sunHours = "Closed";
      } else if (lowerName.includes("tommy terrific") || lowerName.includes("longhorn") || lowerName.includes("dfw express") || lowerName.includes("carrollton")) {
        sunHours = "8:00 AM - 6:00 PM";
      } else if (lowerName.includes("tommy's express") || (lowerName.includes("tommy") && lowerName.includes("express")) || lowerName.includes("carnation") || lowerName.includes("clean getaway") || lowerName.includes("raceway") || lowerName.includes("oasis") || lowerName.includes("fort worth auto") || lowerName.includes("university") || lowerName.includes("richardson") || lowerName.includes("mansfield") || lowerName.includes("lewisville") || lowerName.includes("white rock") || lowerName.includes("vibe") || lowerName.includes("qwikwash") || lowerName.includes("legacy") || lowerName.includes("parkway") || lowerName.includes("clean streak")) {
        sunHours = "9:00 AM - 6:00 PM";
      } else if (lowerName.includes("grapevine") || lowerName.includes("arlington wave") || lowerName.includes("wave express")) {
        sunHours = "9:00 AM - 7:00 PM";
      } else if (lowerName.includes("landshark")) {
        sunHours = "8:00 AM - 7:00 PM";
      }

      if (lowerName.includes("metroplex") || lowerName.includes("southlake") || lowerName.includes("university") || lowerName.includes("richardson") || lowerName.includes("parkway")) {
        weekdayHours = "8:00 AM - 7:00 PM";
        satHours = "8:00 AM - 7:00 PM";
      } else if (lowerName.includes("vibe")) {
        weekdayHours = "7:00 AM - 7:00 PM";
        satHours = "7:00 AM - 7:00 PM";
      } else if (lowerName.includes("carrollton")) {
        weekdayHours = "7:30 AM - 7:30 PM";
        satHours = "7:30 AM - 7:30 PM";
      }

      w.weeklyHours = {
        "Mon - Fri": weekdayHours,
        "Sat": satHours,
        "Sun": sunHours
      };
    }
  }

  // Phase 3: Reputation Tracking
  w.rating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5 to 5.0
  w.reviewCount = Math.floor(Math.random() * 1500) + 50;

  // Phase 3: Pricing History (Mock last 6 months trend for top plan)
  const currentPrice = w.plans && w.plans.length > 0 ? w.plans[w.plans.length - 1].price : 29.99;
  const basePrice = Math.max(9.99, currentPrice - (Math.random() * 10));
  
  w.pricingHistory = [
    { date: "Jan", price: basePrice },
    { date: "Feb", price: basePrice },
    { date: "Mar", price: basePrice + (currentPrice - basePrice)*0.3 }, 
    { date: "Apr", price: basePrice + (currentPrice - basePrice)*0.3 },
    { date: "May", price: currentPrice },
    { date: "Jun", price: currentPrice },
  ].map(entry => ({ date: entry.date, price: parseFloat(entry.price.toFixed(2)) }));
}

DEFAULT_WASHES.forEach(populateWashDetails);

function enhanceHistoryAndOwnership(wash) {
  // Real brands
  if (wash.name.includes("Tommy Terrific")) {
    wash.established = "2008"; wash.acquired = "Independent"; wash.chemicalSupplier = "Qual Chem"; wash.equipmentSupplier = "Sonny's";
  } else if (wash.name.includes("Carnation")) {
    wash.established = "2015"; wash.acquired = "Private Equity Backed (2021)"; wash.chemicalSupplier = "Simoniz"; wash.equipmentSupplier = "MacNeil";
  } else if (wash.name.includes("QwikWash")) {
    wash.established = "2012"; wash.acquired = "Independent Regional"; wash.chemicalSupplier = "Blendco"; wash.equipmentSupplier = "Motor City";
  } else if (wash.name.includes("Zips")) {
    wash.established = "2004"; wash.acquired = "Atlantic Street Capital (2022)"; wash.chemicalSupplier = "Zips Proprietary"; wash.equipmentSupplier = "Sonny's / NCS";
  } else if (wash.name.includes("Take 5")) {
    wash.established = "2020"; wash.acquired = "Driven Brands (2020)"; wash.chemicalSupplier = "Armor All"; wash.equipmentSupplier = "NCS";
  } else if (wash.name.includes("Mister Car Wash")) {
    wash.established = "1969"; wash.acquired = "Publicly Traded (MCW)"; wash.chemicalSupplier = "Tidal Wave / Zep"; wash.equipmentSupplier = "MacNeil / Custom";
  } else {
    // Fictional / local brands
    const years = ["1998", "2005", "2012", "2018", "2021"];
    const acq = ["Independent Owner-Operator", "Local Franchise", "Regional Group Acquisition (2023)", "Family Owned"];
    const chems = ["Simoniz", "Turtle Wax Pro", "Zep", "Qual Chem", "Blendco", "Lustra"];
    const equips = ["Sonny's", "MacNeil", "Motor City", "Peco", "AVW", "Coleman Hanna"];
    
    // Deterministic random based on wash.id
    const idHash = wash.id.split('').reduce((a,b) => a + b.charCodeAt(0), 0);
    wash.established = years[idHash % years.length];
    wash.acquired = acq[(idHash + 1) % acq.length];
    wash.chemicalSupplier = chems[(idHash + 2) % chems.length];
    wash.equipmentSupplier = equips[(idHash + 3) % equips.length];
  }
}

DEFAULT_WASHES.forEach(enhanceHistoryAndOwnership);

class StateManager {
  constructor() {
    this.listeners = [];
    this.subscribers = [];
    
    // Notifications system
    this.notifications = [
      {
        id: "notif-1",
        title: "Welcome to WashRadar",
        body: "Your dashboard is ready. Explore competitor locations and deals.",
        time: new Date().toISOString(),
        read: false
      }
    ];

    this.washes = [];
    this.construction = [];
    this.offers = [];
    this.currentWeather = localStorage.getItem("washradar_weather") || "sunny";
    this.subscriptionTier = "basic"; // 'basic', 'pro', 'enterprise'
    this.currentUser = null;
    
    this.initDb();
    this.initAuth();
    this.requestNotificationPermission();
  }

  requestNotificationPermission() {
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }

  // --- Notification Methods ---
  
  addNotification(title, body) {
    const notif = {
      id: "notif-" + Date.now(),
      title,
      body,
      time: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(notif);
    
    // Keep max 20 notifications
    if (this.notifications.length > 20) {
      this.notifications.pop();
    }
    
    // Trigger OS Push Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: "washradar_logo.png"
      });
    }
    
    this.notifySubscribers();
  }
  
  markAllNotificationsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifySubscribers();
  }
  
  markNotificationRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.notifySubscribers();
    }
  }
  
  getUnreadNotificationCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // --- End Notification Methods ---

  // --- Auth Methods ---
  async initAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    this.handleSession(session);

    supabase.auth.onAuthStateChange((_event, session) => {
      this.handleSession(session);
    });
  }

  handleSession(session) {
    if (session && session.user) {
      this.currentUser = session.user;
      if (this.currentUser.user_metadata && this.currentUser.user_metadata.subscription_tier) {
        this.subscriptionTier = this.currentUser.user_metadata.subscription_tier;
      }
    } else {
      this.currentUser = null;
      this.subscriptionTier = "basic";
    }
    this.notifySubscribers();
  }

  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { subscription_tier: 'basic', ...metadata }
      }
    });
    if (error) throw error;
    if (data.session) this.handleSession(data.session);
    return data;
  }

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (data.session) this.handleSession(data.session);
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    this.handleSession(null);
  }
  // --- End Auth Methods ---

  async initDb() {
    try {
      // Fetch initial data from Supabase
      let { data: washesData, error: washesErr } = await supabase.from('washes').select('*');
      let { data: constData, error: constErr } = await supabase.from('construction').select('*');
      let { data: offersData, error: offersErr } = await supabase.from('offers').select('*');

      if (washesErr || !washesData || washesData.length === 0) {
        console.log("Database empty or error fetching. Seeding default data...");
        await this.seedDatabase();
        return;
      }

      this.washes = washesData.map(w => ({
        id: w.id,
        name: w.name,
        lat: w.lat,
        lng: w.lng,
        status: w.status,
        traffic: w.traffic,
        waitTime: w.wait_time,
        address: w.address,
        phone: w.phone,
        hours: w.hours,
        trafficHistory: w.traffic_history || [],
        closureReason: w.closure_reason,
        serviceType: w.service_type,
        summary: w.summary,
        website: w.website,
        equipment: w.equipment || [],
        products: typeof w.products === 'string' ? JSON.parse(w.products) : (w.products || []),
        plans: typeof w.plans === 'string' ? JSON.parse(w.plans) : (w.plans || [])
      }));
      this.washes.forEach(populateWashDetails);

      this.construction = constData || [];
      this.offers = (offersData || []).map(o => ({
        id: o.id,
        washId: o.wash_id,
        title: o.title,
        description: o.description,
        type: o.type,
        code: o.code,
        expires: o.expires
      }));

      this.notify();

      // Setup Realtime connection to sync database changes automatically
      supabase
        .channel('washradar-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, async () => {
          // Reload state on any database update
          const { data: wD } = await supabase.from('washes').select('*');
          const { data: cD } = await supabase.from('construction').select('*');
          const { data: oD } = await supabase.from('offers').select('*');

          if (wD) {
            this.washes = wD.map(w => ({
              id: w.id,
              name: w.name,
              lat: w.lat,
              lng: w.lng,
              status: w.status,
              traffic: w.traffic,
              waitTime: w.wait_time,
              address: w.address,
              phone: w.phone,
              hours: w.hours,
              trafficHistory: w.traffic_history || [],
              closureReason: w.closure_reason,
              serviceType: w.service_type,
              summary: w.summary,
              website: w.website,
              equipment: w.equipment || [],
              products: typeof w.products === 'string' ? JSON.parse(w.products) : (w.products || []),
              plans: typeof w.plans === 'string' ? JSON.parse(w.plans) : (w.plans || [])
            }));
            this.washes.forEach(populateWashDetails);
          }
          if (cD) this.construction = cD;
          if (oD) {
            this.offers = oD.map(o => ({
              id: o.id,
              washId: o.wash_id,
              title: o.title,
              description: o.description,
              type: o.type,
              code: o.code,
              expires: o.expires
            }));
          }
          this.notify();
        })
        .subscribe();

    } catch (e) {
      console.error("Supabase initialization failed, falling back to localStorage", e);
      this.loadLocalStorageFallback();
    }
  }

  async seedDatabase() {
    try {
      const seedWashes = DEFAULT_WASHES.map(w => ({
        id: w.id,
        name: w.name,
        lat: w.lat,
        lng: w.lng,
        status: w.status,
        traffic: w.traffic,
        wait_time: w.waitTime,
        address: w.address,
        phone: w.phone,
        hours: w.hours,
        traffic_history: w.trafficHistory || [],
        closure_reason: w.closureReason || '',
        service_type: w.serviceType || 'express',
        summary: w.summary,
        website: w.website,
        equipment: w.equipment || [],
        products: w.products || [],
        plans: w.plans || []
      }));

      const seedConst = DEFAULT_CONSTRUCTION.map(c => ({
        id: c.id,
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        address: c.address,
        stage: c.stage,
        completion: c.completion,
        operator: c.operator,
        details: c.details
      }));

      const seedOffers = DEFAULT_OFFERS.map(o => ({
        id: o.id,
        wash_id: o.washId,
        title: o.title,
        description: o.description,
        type: o.type,
        code: o.code,
        expires: o.expires
      }));

      const { error: wErr } = await supabase.from('washes').insert(seedWashes);
      if (wErr) console.error("Error seeding washes:", wErr);

      const { error: cErr } = await supabase.from('construction').insert(seedConst);
      if (cErr) console.error("Error seeding construction:", cErr);

      const { error: oErr } = await supabase.from('offers').insert(seedOffers);
      if (oErr) console.error("Error seeding offers:", oErr);

      await this.initDb();
    } catch (err) {
      console.error("Seeding database failed:", err);
    }
  }

  loadLocalStorageFallback() {
    this.washes = JSON.parse(localStorage.getItem("washradar_washes")) || DEFAULT_WASHES;
    this.washes.forEach(populateWashDetails);
    this.construction = JSON.parse(localStorage.getItem("washradar_construction")) || DEFAULT_CONSTRUCTION;
    this.offers = JSON.parse(localStorage.getItem("washradar_offers")) || DEFAULT_OFFERS;
    this.notify();

    // Cross-tab simulated real-time sync
    if (!this.storageListenerAdded) {
      window.addEventListener('storage', (e) => {
        let changed = false;
        if (e.key === "washradar_washes") {
          this.washes = JSON.parse(e.newValue) || DEFAULT_WASHES;
          this.washes.forEach(populateWashDetails);
          changed = true;
        } else if (e.key === "washradar_construction") {
          this.construction = JSON.parse(e.newValue) || DEFAULT_CONSTRUCTION;
          changed = true;
        } else if (e.key === "washradar_offers") {
          this.offers = JSON.parse(e.newValue) || DEFAULT_OFFERS;
          changed = true;
        }
        if (changed) this.notify();
      });
      this.storageListenerAdded = true;
    }
  }

  saveState() {
    try {
      localStorage.setItem("washradar_washes", JSON.stringify(this.washes));
      localStorage.setItem("washradar_construction", JSON.stringify(this.construction));
      localStorage.setItem("washradar_offers", JSON.stringify(this.offers));
      this.notify();
    } catch (e) {
      console.error("Failed to save state to local storage", e);
    }
  }

  // Pub/Sub
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  notifySubscribers() {
    this.notify();
  }

  setWeather(weather) {
    this.currentWeather = weather;
    localStorage.setItem("washradar_weather", weather);
    this.notify();
  }

  getState() {
    const processedWashes = this.washes.map(w => {
      const copy = JSON.parse(JSON.stringify(w));

      if (this.currentWeather === "rainy") {
        if (copy.status === "open") {
          copy.traffic = "low";
          copy.waitTime = Math.max(1, Math.round(copy.waitTime * 0.2));
        }
      } else if (this.currentWeather === "stormy") {
        const idNum = parseInt(copy.id.split("-")[1]) || 0;
        if (idNum % 3 === 0) {
          copy.status = "closed";
          copy.traffic = "low";
          copy.waitTime = 0;
          copy.closureReason = "⛈️ Severe weather safety closure (high winds & lightning)";
        } else if (idNum % 7 === 0) {
          copy.status = "maintenance";
          copy.traffic = "low";
          copy.waitTime = 0;
          copy.closureReason = "🛠️ Power grid fluctuation check (storm safety)";
        } else if (copy.status === "open") {
          copy.traffic = "low";
          copy.waitTime = Math.max(2, Math.round(copy.waitTime * 0.3));
        }
      } else if (this.currentWeather === "freezing") {
        const idNum = parseInt(copy.id.split("-")[1]) || 0;
        if (idNum % 2 === 0) {
          copy.status = "maintenance";
          copy.traffic = "low";
          copy.waitTime = 0;
          copy.closureReason = "❄️ Pipe freeze safety shutdown (sub-freezing temperatures)";
        } else if (copy.status === "open") {
          copy.traffic = "high";
          copy.waitTime = copy.waitTime + 15;
        }
      }
      return copy;
    });

    return {
      washes: processedWashes,
      construction: this.construction,
      offers: this.offers,
      notifications: this.notifications,
      currentWeather: this.currentWeather,
      subscriptionTier: this.subscriptionTier,
      currentUser: this.currentUser
    };
  }

  // Actions
  async updateSubscriptionTier(tier) {
    this.subscriptionTier = tier;
    
    // Persist to Supabase Auth if logged in
    if (this.currentUser) {
      const { error } = await supabase.auth.updateUser({
        data: { subscription_tier: tier }
      });
      if (error) {
        console.error("Failed to update user plan:", error);
      }
    }
    
    if (tier === 'pro') {
      this.addNotification("Upgrade Successful", "You are now on the Pro Plan. Real-time alerts and Construction Radar are unlocked!");
    } else if (tier === 'enterprise') {
      this.addNotification("Upgrade Successful", "Welcome to Enterprise. Historical Analytics are now unlocked.");
    }
    
    this.notifySubscribers();
  }

  async updateWashStatus(washId, status, traffic, waitTime, reason = "") {
    const wash = this.washes.find(w => w.id === washId);
    if (wash) {
      const oldStatus = wash.status;
      wash.status = status;
      wash.traffic = traffic;
      wash.waitTime = parseInt(waitTime);
      wash.closureReason = status !== 'open' ? reason : "";
      
      // Emit notification if status changed
      if (oldStatus !== status) {
        let statusText = status === "open" ? "Opened" : status === "closed" ? "Closed" : "Maintenance";
        this.addNotification("Competitor Status Changed", `${wash.name} is now ${statusText}.`);
      }

      this.notifySubscribers();

      try {
        await supabase
          .from('washes')
          .update({
            status: status,
            traffic: traffic,
            wait_time: Number(waitTime),
            closure_reason: reason
          })
          .eq('id', washId);
      } catch (err) {
        console.error("Supabase updateWashStatus failed, saving locally:", err);
        this.saveState();
      }
      return true;
    }
    return false;
  }

  async addConstructionProject(name, lat, lng, address, stage, completion, operator, details) {
    const newProject = {
      id: `const-${Date.now()}`,
      name,
      lat: Number(lat),
      lng: Number(lng),
      address,
      stage,
      completion,
      operator,
      details
    };
    this.construction.push(newProject);

    this.addNotification("New Construction Reported", `${name} is entering the ${stage} stage.`);

    this.notifySubscribers();

    try {
      await supabase.from('construction').insert(newProject);
    } catch (err) {
      console.error("Supabase addConstructionProject failed, saving locally:", err);
      this.saveState();
    }
    return newProject;
  }

  async addOffer(washId, washName, title, description, type, code, expiry, details) {
    const newOffer = {
      id: "offer-" + Date.now(),
      washId,
      washName,
      title,
      description,
      type,
      code,
      expiry,
      details,
      postedAt: new Date().toISOString()
    };

    this.offers.push(newOffer);
    
    this.addNotification("New Promotion Posted", `${washName} posted a new ${type}: ${title}.`);
    
    this.notifySubscribers();

    try {
      await supabase.from('offers').insert({
        id: newOffer.id,
        wash_id: washId,
        description,
        type,
        code,
        expires
      });
    } catch (err) {
      console.error("Supabase addOffer failed, saving locally:", err);
      this.saveState();
    }
    return newOffer;
  }

  async deleteOffer(offerId) {
    this.offers = this.offers.filter(o => o.id !== offerId);
    this.notify();

    try {
      await supabase.from('offers').delete().eq('id', offerId);
    } catch (err) {
      console.error("Supabase deleteOffer failed, saving locally:", err);
      this.saveState();
    }
    return true;
  }
}

export const state = new StateManager();

