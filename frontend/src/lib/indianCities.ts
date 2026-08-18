export interface IndianCity {
  id: string;
  name: string;
  state: string;
  region: 'North' | 'South' | 'West' | 'East & Central';
  latitude: number;
  longitude: number;
  population: string;
  majorBasin: string;
  baseAqi: number;
  baseDo: number;
  soilQualityIndex: number;
  noiseLevelDb: number;
  climateDriftC: number;
}

export const INDIAN_CITIES_DATA: IndianCity[] = [
  // --- NORTH REGION ---
  { id: "city_delhi", name: "New Delhi", state: "Delhi", region: "North", latitude: 28.6139, longitude: 77.2090, population: "32.9M", majorBasin: "Yamuna River Basin", baseAqi: 245, baseDo: 1.8, soilQualityIndex: 58, noiseLevelDb: 74, climateDriftC: +1.4 },
  { id: "city_noida", name: "Noida", state: "Uttar Pradesh", region: "North", latitude: 28.5744, longitude: 77.3560, population: "1.0M", majorBasin: "Hindon / Yamuna Basin", baseAqi: 230, baseDo: 2.1, soilQualityIndex: 60, noiseLevelDb: 71, climateDriftC: +1.3 },
  { id: "city_gurgaon", name: "Gurgaon", state: "Haryana", region: "North", latitude: 28.4595, longitude: 77.0266, population: "1.5M", majorBasin: "Sahibi River Basin", baseAqi: 220, baseDo: 2.5, soilQualityIndex: 55, noiseLevelDb: 73, climateDriftC: +1.4 },
  { id: "city_ghaziabad", name: "Ghaziabad", state: "Uttar Pradesh", region: "North", latitude: 28.6692, longitude: 77.4538, population: "2.4M", majorBasin: "Hindon Basin", baseAqi: 260, baseDo: 1.6, soilQualityIndex: 52, noiseLevelDb: 75, climateDriftC: +1.5 },
  { id: "city_faridabad", name: "Faridabad", state: "Haryana", region: "North", latitude: 28.4089, longitude: 77.3178, population: "1.8M", majorBasin: "Yamuna Basin", baseAqi: 210, baseDo: 2.8, soilQualityIndex: 59, noiseLevelDb: 70, climateDriftC: +1.3 },
  { id: "city_chandigarh", name: "Chandigarh", state: "Chandigarh", region: "North", latitude: 30.7333, longitude: 76.7794, population: "1.2M", majorBasin: "Sukhna Lake Basin", baseAqi: 95, baseDo: 6.5, soilQualityIndex: 78, noiseLevelDb: 58, climateDriftC: +0.7 },
  { id: "city_lucknow", name: "Lucknow", state: "Uttar Pradesh", region: "North", latitude: 26.8467, longitude: 80.9462, population: "3.8M", majorBasin: "Gomti River Basin", baseAqi: 185, baseDo: 3.2, soilQualityIndex: 64, noiseLevelDb: 68, climateDriftC: +1.1 },
  { id: "city_kanpur", name: "Kanpur", state: "Uttar Pradesh", region: "North", latitude: 26.4499, longitude: 80.3319, population: "3.2M", majorBasin: "Ganga Basin (Industrial)", baseAqi: 215, baseDo: 2.4, soilQualityIndex: 51, noiseLevelDb: 72, climateDriftC: +1.2 },
  { id: "city_agra", name: "Agra", state: "Uttar Pradesh", region: "North", latitude: 27.1767, longitude: 78.0081, population: "2.2M", majorBasin: "Yamuna Floodplain", baseAqi: 195, baseDo: 2.9, soilQualityIndex: 62, noiseLevelDb: 69, climateDriftC: +1.2 },
  { id: "city_varanasi", name: "Varanasi", state: "Uttar Pradesh", region: "North", latitude: 25.3176, longitude: 82.9739, population: "1.7M", majorBasin: "Ganga Holy Basin", baseAqi: 175, baseDo: 4.1, soilQualityIndex: 67, noiseLevelDb: 66, climateDriftC: +1.0 },
  { id: "city_prayagraj", name: "Prayagraj (Allahabad)", state: "Uttar Pradesh", region: "North", latitude: 25.4358, longitude: 81.8463, population: "1.5M", majorBasin: "Triveni Sangam Basin", baseAqi: 165, baseDo: 4.8, soilQualityIndex: 70, noiseLevelDb: 64, climateDriftC: +0.9 },
  { id: "city_meerut", name: "Meerut", state: "Uttar Pradesh", region: "North", latitude: 28.9845, longitude: 77.7064, population: "1.6M", majorBasin: "Kali Nadi Basin", baseAqi: 190, baseDo: 3.0, soilQualityIndex: 63, noiseLevelDb: 67, climateDriftC: +1.1 },
  { id: "city_bareilly", name: "Bareilly", state: "Uttar Pradesh", region: "North", latitude: 28.3670, longitude: 79.4304, population: "1.0M", majorBasin: "Ramganga River Basin", baseAqi: 155, baseDo: 4.5, soilQualityIndex: 69, noiseLevelDb: 63, climateDriftC: +0.9 },
  { id: "city_moradabad", name: "Moradabad", state: "Uttar Pradesh", region: "North", latitude: 28.8386, longitude: 78.7733, population: "1.1M", majorBasin: "Ramganga Metal Basin", baseAqi: 180, baseDo: 3.4, soilQualityIndex: 58, noiseLevelDb: 68, climateDriftC: +1.0 },
  { id: "city_aligarh", name: "Aligarh", state: "Uttar Pradesh", region: "North", latitude: 27.8974, longitude: 78.0880, population: "1.2M", majorBasin: "Karwan Basin", baseAqi: 170, baseDo: 3.8, soilQualityIndex: 61, noiseLevelDb: 65, climateDriftC: +1.0 },
  { id: "city_gorakhpur", name: "Gorakhpur", state: "Uttar Pradesh", region: "North", latitude: 26.7606, longitude: 83.3732, population: "1.0M", majorBasin: "Rapti Basin", baseAqi: 160, baseDo: 4.9, soilQualityIndex: 72, noiseLevelDb: 62, climateDriftC: +0.8 },
  { id: "city_ludhiana", name: "Ludhiana", state: "Punjab", region: "North", latitude: 30.9010, longitude: 75.8573, population: "1.9M", majorBasin: "Buddha Nullah / Sutlej", baseAqi: 185, baseDo: 2.7, soilQualityIndex: 56, noiseLevelDb: 71, climateDriftC: +1.2 },
  { id: "city_amritsar", name: "Amritsar", state: "Punjab", region: "North", latitude: 31.6340, longitude: 74.8723, population: "1.4M", majorBasin: "Ravi River Basin", baseAqi: 150, baseDo: 5.1, soilQualityIndex: 68, noiseLevelDb: 64, climateDriftC: +0.9 },
  { id: "city_jalandhar", name: "Jalandhar", state: "Punjab", region: "North", latitude: 31.3260, longitude: 75.5762, population: "1.0M", majorBasin: "Beas River Basin", baseAqi: 140, baseDo: 5.4, soilQualityIndex: 71, noiseLevelDb: 62, climateDriftC: +0.8 },
  { id: "city_jammu", name: "Jammu", state: "Jammu & Kashmir", region: "North", latitude: 32.7266, longitude: 74.8570, population: "0.8M", majorBasin: "Tawi River Basin", baseAqi: 85, baseDo: 6.9, soilQualityIndex: 82, noiseLevelDb: 55, climateDriftC: +0.6 },
  { id: "city_srinagar", name: "Srinagar", state: "Jammu & Kashmir", region: "North", latitude: 34.0837, longitude: 74.7973, population: "1.3M", majorBasin: "Jhelum / Dal Lake", baseAqi: 65, baseDo: 7.8, soilQualityIndex: 88, noiseLevelDb: 48, climateDriftC: +0.5 },
  { id: "city_dehradun", name: "Dehradun", state: "Uttarakhand", region: "North", latitude: 30.3165, longitude: 78.0322, population: "0.8M", majorBasin: "Rispana / Tons River", baseAqi: 90, baseDo: 6.7, soilQualityIndex: 80, noiseLevelDb: 56, climateDriftC: +0.6 },
  { id: "city_shimla", name: "Shimla", state: "Himachal Pradesh", region: "North", latitude: 31.1048, longitude: 77.1734, population: "0.3M", majorBasin: "Sutlej Valley Watershed", baseAqi: 45, baseDo: 8.2, soilQualityIndex: 92, noiseLevelDb: 42, climateDriftC: +0.4 },
  { id: "city_jaipur", name: "Jaipur", state: "Rajasthan", region: "North", latitude: 26.9124, longitude: 75.7873, population: "3.1M", majorBasin: "Dravyavati River Basin", baseAqi: 160, baseDo: 4.2, soilQualityIndex: 60, noiseLevelDb: 66, climateDriftC: +1.1 },
  { id: "city_jodhpur", name: "Jodhpur", state: "Rajasthan", region: "North", latitude: 26.2389, longitude: 73.0243, population: "1.3M", majorBasin: "Luni River Basin", baseAqi: 170, baseDo: 3.9, soilQualityIndex: 54, noiseLevelDb: 65, climateDriftC: +1.2 },
  { id: "city_kota", name: "Kota", state: "Rajasthan", region: "North", latitude: 25.2138, longitude: 75.8648, population: "1.2M", majorBasin: "Chambal River Basin", baseAqi: 135, baseDo: 5.6, soilQualityIndex: 69, noiseLevelDb: 60, climateDriftC: +0.8 },

  // --- SOUTH REGION ---
  { id: "city_bengaluru", name: "Bengaluru", state: "Karnataka", region: "South", latitude: 12.9716, longitude: 77.5946, population: "13.2M", majorBasin: "Vrishabhavathi / Bellandur Basin", baseAqi: 82, baseDo: 4.5, soilQualityIndex: 76, noiseLevelDb: 63, climateDriftC: +0.7 },
  { id: "city_mysuru", name: "Mysuru", state: "Karnataka", region: "South", latitude: 12.2958, longitude: 76.6394, population: "1.1M", majorBasin: "Kaveri Basin", baseAqi: 52, baseDo: 7.2, soilQualityIndex: 85, noiseLevelDb: 49, climateDriftC: +0.4 },
  { id: "city_hubballi", name: "Hubballi-Dharwad", state: "Karnataka", region: "South", latitude: 15.3647, longitude: 75.1240, population: "1.2M", majorBasin: "Unkal Lake Basin", baseAqi: 68, baseDo: 6.8, soilQualityIndex: 79, noiseLevelDb: 54, climateDriftC: +0.5 },
  { id: "city_chennai", name: "Chennai", state: "Tamil Nadu", region: "South", latitude: 13.0827, longitude: 80.2707, population: "11.5M", majorBasin: "Cooum / Adyar Coastal Basin", baseAqi: 95, baseDo: 3.8, soilQualityIndex: 68, noiseLevelDb: 69, climateDriftC: +0.9 },
  { id: "city_coimbatore", name: "Coimbatore", state: "Tamil Nadu", region: "South", latitude: 11.0168, longitude: 76.9558, population: "2.1M", majorBasin: "Noyyal River Basin", baseAqi: 58, baseDo: 6.9, soilQualityIndex: 83, noiseLevelDb: 52, climateDriftC: +0.5 },
  { id: "city_madurai", name: "Madurai", state: "Tamil Nadu", region: "South", latitude: 9.9252, longitude: 78.1198, population: "1.6M", majorBasin: "Vaigai River Basin", baseAqi: 64, baseDo: 6.4, soilQualityIndex: 77, noiseLevelDb: 56, climateDriftC: +0.6 },
  { id: "city_tiruchirappalli", name: "Tiruchirappalli", state: "Tamil Nadu", region: "South", latitude: 10.7905, longitude: 78.7047, population: "1.1M", majorBasin: "Kaveri Delta", baseAqi: 60, baseDo: 6.7, soilQualityIndex: 81, noiseLevelDb: 53, climateDriftC: +0.5 },
  { id: "city_salem", name: "Salem", state: "Tamil Nadu", region: "South", latitude: 11.6643, longitude: 78.1460, population: "1.0M", majorBasin: "Thirumanimuthar Basin", baseAqi: 70, baseDo: 6.1, soilQualityIndex: 75, noiseLevelDb: 57, climateDriftC: +0.6 },
  { id: "city_hyderabad", name: "Hyderabad", state: "Telangana", region: "South", latitude: 17.3850, longitude: 78.4867, population: "10.5M", majorBasin: "Musi River / Hussain Sagar", baseAqi: 110, baseDo: 3.1, soilQualityIndex: 66, noiseLevelDb: 67, climateDriftC: +0.9 },
  { id: "city_warangal", name: "Warangal", state: "Telangana", region: "South", latitude: 17.9689, longitude: 79.5941, population: "0.9M", majorBasin: "Bhadrakali Lake Basin", baseAqi: 75, baseDo: 6.3, soilQualityIndex: 78, noiseLevelDb: 53, climateDriftC: +0.5 },
  { id: "city_visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", region: "South", latitude: 17.6868, longitude: 83.2185, population: "2.3M", majorBasin: "Meghadrigeddah Coastal Basin", baseAqi: 88, baseDo: 6.0, soilQualityIndex: 74, noiseLevelDb: 62, climateDriftC: +0.7 },
  { id: "city_vijayawada", name: "Vijayawada", state: "Andhra Pradesh", region: "South", latitude: 16.5062, longitude: 80.6480, population: "1.7M", majorBasin: "Krishna River Delta", baseAqi: 92, baseDo: 5.8, soilQualityIndex: 72, noiseLevelDb: 61, climateDriftC: +0.7 },
  { id: "city_guntur", name: "Guntur", state: "Andhra Pradesh", region: "South", latitude: 16.3067, longitude: 80.4365, population: "0.8M", majorBasin: "Krishna Channel Watershed", baseAqi: 84, baseDo: 6.2, soilQualityIndex: 75, noiseLevelDb: 57, climateDriftC: +0.6 },
  { id: "city_kochi", name: "Kochi", state: "Kerala", region: "South", latitude: 9.9312, longitude: 76.2673, population: "2.1M", majorBasin: "Vembanad Backwaters / Periyar", baseAqi: 48, baseDo: 7.6, soilQualityIndex: 86, noiseLevelDb: 50, climateDriftC: +0.4 },
  { id: "city_thiruvananthapuram", name: "Thiruvananthapuram", state: "Kerala", region: "South", latitude: 8.5241, longitude: 76.9366, population: "1.0M", majorBasin: "Karamana River Basin", baseAqi: 42, baseDo: 8.0, soilQualityIndex: 90, noiseLevelDb: 46, climateDriftC: +0.3 },
  { id: "city_kozhikode", name: "Kozhikode", state: "Kerala", region: "South", latitude: 11.2588, longitude: 75.7804, population: "0.9M", majorBasin: "Kallayi River Basin", baseAqi: 45, baseDo: 7.9, soilQualityIndex: 89, noiseLevelDb: 48, climateDriftC: +0.4 },

  // --- WEST REGION ---
  { id: "city_mumbai", name: "Mumbai", state: "Maharashtra", region: "West", latitude: 19.0760, longitude: 72.8777, population: "21.3M", majorBasin: "Mithi River / Arabian Coast", baseAqi: 145, baseDo: 3.5, soilQualityIndex: 61, noiseLevelDb: 76, climateDriftC: +1.1 },
  { id: "city_pune", name: "Pune", state: "Maharashtra", region: "West", latitude: 18.5204, longitude: 73.8567, population: "6.8M", majorBasin: "Mula-Mutha Basin", baseAqi: 105, baseDo: 4.8, soilQualityIndex: 73, noiseLevelDb: 64, climateDriftC: +0.8 },
  { id: "city_nagpur", name: "Nagpur", state: "Maharashtra", region: "West", latitude: 21.1458, longitude: 79.0882, population: "2.9M", majorBasin: "Nag River Basin", baseAqi: 115, baseDo: 5.0, soilQualityIndex: 68, noiseLevelDb: 62, climateDriftC: +0.9 },
  { id: "city_nashik", name: "Nashik", state: "Maharashtra", region: "West", latitude: 20.0059, longitude: 73.7898, population: "1.6M", majorBasin: "Godavari River Basin", baseAqi: 92, baseDo: 6.2, soilQualityIndex: 77, noiseLevelDb: 58, climateDriftC: +0.6 },
  { id: "city_thane", name: "Thane", state: "Maharashtra", region: "West", latitude: 19.2183, longitude: 72.9781, population: "1.9M", majorBasin: "Ulhas River Basin", baseAqi: 140, baseDo: 3.8, soilQualityIndex: 64, noiseLevelDb: 72, climateDriftC: +1.0 },
  { id: "city_aurangabad", name: "Chhatrapati Sambhajinagar (Aurangabad)", state: "Maharashtra", region: "West", latitude: 19.8762, longitude: 75.3433, population: "1.2M", majorBasin: "Kham River Basin", baseAqi: 110, baseDo: 5.2, soilQualityIndex: 70, noiseLevelDb: 60, climateDriftC: +0.8 },
  { id: "city_solapur", name: "Solapur", state: "Maharashtra", region: "West", latitude: 17.6599, longitude: 75.9064, population: "1.0M", majorBasin: "Sina River Basin", baseAqi: 100, baseDo: 5.5, soilQualityIndex: 69, noiseLevelDb: 59, climateDriftC: +0.8 },
  { id: "city_ahmedabad", name: "Ahmedabad", state: "Gujarat", region: "West", latitude: 23.0225, longitude: 72.5714, population: "8.4M", majorBasin: "Sabarmati River Front", baseAqi: 170, baseDo: 3.2, soilQualityIndex: 58, noiseLevelDb: 70, climateDriftC: +1.2 },
  { id: "city_surat", name: "Surat", state: "Gujarat", region: "West", latitude: 21.1702, longitude: 72.8311, population: "6.6M", majorBasin: "Tapi River Basin", baseAqi: 155, baseDo: 4.1, soilQualityIndex: 62, noiseLevelDb: 68, climateDriftC: +1.0 },
  { id: "city_vadodara", name: "Vadodara", state: "Gujarat", region: "West", latitude: 22.3072, longitude: 73.1812, population: "2.2M", majorBasin: "Vishwamitri River Basin", baseAqi: 130, baseDo: 4.6, soilQualityIndex: 66, noiseLevelDb: 64, climateDriftC: +0.9 },
  { id: "city_rajkot", name: "Rajkot", state: "Gujarat", region: "West", latitude: 22.3039, longitude: 70.8022, population: "1.8M", majorBasin: "Aji River Basin", baseAqi: 125, baseDo: 4.9, soilQualityIndex: 64, noiseLevelDb: 63, climateDriftC: +0.9 },

  // --- EAST & CENTRAL REGION ---
  { id: "city_kolkata", name: "Kolkata", state: "West Bengal", region: "East & Central", latitude: 22.5726, longitude: 88.3639, population: "14.9M", majorBasin: "Hooghly / Ganga Estuary", baseAqi: 165, baseDo: 3.6, soilQualityIndex: 63, noiseLevelDb: 74, climateDriftC: +1.0 },
  { id: "city_howrah", name: "Howrah", state: "West Bengal", region: "East & Central", latitude: 22.5958, longitude: 88.2636, population: "1.1M", majorBasin: "Hooghly River Front", baseAqi: 175, baseDo: 3.4, soilQualityIndex: 60, noiseLevelDb: 75, climateDriftC: +1.1 },
  { id: "city_asansol", name: "Asansol", state: "West Bengal", region: "East & Central", latitude: 23.6889, longitude: 86.9661, population: "1.2M", majorBasin: "Damodar Industrial Basin", baseAqi: 180, baseDo: 3.0, soilQualityIndex: 54, noiseLevelDb: 71, climateDriftC: +1.2 },
  { id: "city_siliguri", name: "Siliguri", state: "West Bengal", region: "East & Central", latitude: 26.7271, longitude: 88.3953, population: "0.7M", majorBasin: "Mahananda River Basin", baseAqi: 85, baseDo: 6.8, soilQualityIndex: 81, noiseLevelDb: 58, climateDriftC: +0.6 },
  { id: "city_patna", name: "Patna", state: "Bihar", region: "East & Central", latitude: 25.5941, longitude: 85.1376, population: "2.5M", majorBasin: "Ganga / Punpun Basin", baseAqi: 230, baseDo: 2.2, soilQualityIndex: 57, noiseLevelDb: 73, climateDriftC: +1.3 },
  { id: "city_ranchi", name: "Ranchi", state: "Jharkhand", region: "East & Central", latitude: 23.3441, longitude: 85.3096, population: "1.1M", majorBasin: "Subarnarekha Basin", baseAqi: 105, baseDo: 6.0, soilQualityIndex: 76, noiseLevelDb: 57, climateDriftC: +0.7 },
  { id: "city_dhanbad", name: "Dhanbad", state: "Jharkhand", region: "East & Central", latitude: 23.7957, longitude: 86.4304, population: "1.2M", majorBasin: "Damodar Coal Basin", baseAqi: 210, baseDo: 2.5, soilQualityIndex: 48, noiseLevelDb: 74, climateDriftC: +1.4 },
  { id: "city_jamshedpur", name: "Jamshedpur", state: "Jharkhand", region: "East & Central", latitude: 22.8046, longitude: 86.2029, population: "1.3M", majorBasin: "Subarnarekha / Kharkai", baseAqi: 145, baseDo: 4.8, soilQualityIndex: 62, noiseLevelDb: 66, climateDriftC: +1.0 },
  { id: "city_bhubaneswar", name: "Bhubaneswar", state: "Odisha", region: "East & Central", latitude: 20.2961, longitude: 85.8245, population: "1.1M", majorBasin: "Daya / Kuakhai Basin", baseAqi: 92, baseDo: 6.4, soilQualityIndex: 79, noiseLevelDb: 56, climateDriftC: +0.6 },
  { id: "city_cuttack", name: "Cuttack", state: "Odisha", region: "East & Central", latitude: 20.4625, longitude: 85.8828, population: "0.7M", majorBasin: "Mahanadi Delta Basin", baseAqi: 98, baseDo: 6.1, soilQualityIndex: 77, noiseLevelDb: 58, climateDriftC: +0.7 },
  { id: "city_raipur", name: "Raipur", state: "Chhattisgarh", region: "East & Central", latitude: 21.2514, longitude: 81.6296, population: "1.4M", majorBasin: "Kharun River Basin", baseAqi: 135, baseDo: 4.9, soilQualityIndex: 65, noiseLevelDb: 63, climateDriftC: +0.9 },
  { id: "city_bhopal", name: "Bhopal", state: "Madhya Pradesh", region: "East & Central", latitude: 23.2599, longitude: 77.4126, population: "2.4M", majorBasin: "Upper Lake / Kaliasot", baseAqi: 110, baseDo: 5.8, soilQualityIndex: 74, noiseLevelDb: 60, climateDriftC: +0.8 },
  { id: "city_indore", name: "Indore", state: "Madhya Pradesh", region: "East & Central", latitude: 22.7196, longitude: 75.8577, population: "3.2M", majorBasin: "Kanh / Saraswati River", baseAqi: 98, baseDo: 6.2, soilQualityIndex: 82, noiseLevelDb: 58, climateDriftC: +0.6 },
  { id: "city_gwalior", name: "Gwalior", state: "Madhya Pradesh", region: "East & Central", latitude: 26.2183, longitude: 78.1828, population: "1.1M", majorBasin: "Swarnrekha River Basin", baseAqi: 165, baseDo: 3.8, soilQualityIndex: 62, noiseLevelDb: 67, climateDriftC: +1.1 },
  { id: "city_jabalpur", name: "Jabalpur", state: "Madhya Pradesh", region: "East & Central", latitude: 23.1815, longitude: 79.9864, population: "1.3M", majorBasin: "Narmada River Basin", baseAqi: 105, baseDo: 6.5, soilQualityIndex: 78, noiseLevelDb: 56, climateDriftC: +0.7 },
  { id: "city_guwahati", name: "Guwahati", state: "Assam", region: "East & Central", latitude: 26.1445, longitude: 91.7362, population: "1.1M", majorBasin: "Brahmaputra Valley Basin", baseAqi: 78, baseDo: 7.1, soilQualityIndex: 84, noiseLevelDb: 53, climateDriftC: +0.5 }
];

export const INDIAN_STATES: string[] = Array.from(
  new Set(INDIAN_CITIES_DATA.map((c) => c.state))
).sort();
