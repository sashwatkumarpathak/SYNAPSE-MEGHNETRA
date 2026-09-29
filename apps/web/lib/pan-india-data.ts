export type Jurisdiction = {
  code: string;
  name: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast' | 'Union Territory';
  capital: string;
  locations: string[];
};

export const INDIA_JURISDICTIONS: Jurisdiction[] = [
  {code:'AP',name:'Andhra Pradesh',region:'South',capital:'Amaravati',locations:['Visakhapatnam','Vijayawada','Tirupati','Guntur','Nellore','Kakinada','Rajahmundry','Anantapur','Kadapa','Srikakulam','Vizianagaram','Ongole','Eluru','Kurnool','Machilipatnam']},
  {code:'AR',name:'Arunachal Pradesh',region:'Northeast',capital:'Itanagar',locations:['Itanagar','Tawang','Pasighat','Naharlagun','Ziro','Bomdila','Tezu','Namsai']},
  {code:'AS',name:'Assam',region:'Northeast',capital:'Dispur',locations:['Guwahati','Dibrugarh','Silchar','Jorhat','Tezpur','Nagaon','Tinsukia','Sivasagar','Bongaigaon','Dhubri']},
  {code:'BR',name:'Bihar',region:'East',capital:'Patna',locations:['Patna','Gaya','Muzaffarpur','Bhagalpur','Darbhanga','Purnia','Arrah','Begusarai','Katihar','Chapra']},
  {code:'CG',name:'Chhattisgarh',region:'Central',capital:'Raipur',locations:['Raipur','Bhilai','Bilaspur','Korba','Durg','Jagdalpur','Ambikapur','Rajnandgaon']},
  {code:'GA',name:'Goa',region:'West',capital:'Panaji',locations:['Panaji','Vasco da Gama','Margao','Mapusa','Ponda']},
  {code:'GJ',name:'Gujarat',region:'West',capital:'Gandhinagar',locations:['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Junagadh','Gandhinagar','Anand','Bharuch','Bhuj']},
  {code:'HR',name:'Haryana',region:'North',capital:'Chandigarh',locations:['Gurugram','Faridabad','Panipat','Ambala','Hisar','Karnal','Rohtak','Sonipat','Panchkula','Yamunanagar']},
  {code:'HP',name:'Himachal Pradesh',region:'North',capital:'Shimla',locations:['Shimla','Dharamshala','Mandi','Solan','Kullu','Manali','Hamirpur','Bilaspur','Nahan','Chamba']},
  {code:'JH',name:'Jharkhand',region:'East',capital:'Ranchi',locations:['Ranchi','Jamshedpur','Dhanbad','Bokaro','Deoghar','Hazaribagh','Giridih','Ramgarh','Chaibasa']},
  {code:'KA',name:'Karnataka',region:'South',capital:'Bengaluru',locations:['Bengaluru','Mysuru','Mangaluru','Hubballi','Belagavi','Kalaburagi','Shivamogga','Tumakuru','Udupi','Ballari','Davangere','Hassan','Raichur']},
  {code:'KL',name:'Kerala',region:'South',capital:'Thiruvananthapuram',locations:['Thiruvananthapuram','Kochi','Kozhikode','Thrissur','Kollam','Kannur','Alappuzha','Palakkad','Kottayam','Malappuram','Kasaragod']},
  {code:'MP',name:'Madhya Pradesh',region:'Central',capital:'Bhopal',locations:['Bhopal','Indore','Jabalpur','Gwalior','Ujjain','Sagar','Rewa','Satna','Ratlam','Dewas','Khandwa','Burhanpur']},
  {code:'MH',name:'Maharashtra',region:'West',capital:'Mumbai',locations:['Mumbai','Pune','Nagpur','Nashik','Aurangabad','Thane','Navi Mumbai','Kolhapur','Solapur','Amravati','Sangli','Satara','Akola','Jalgaon']},
  {code:'MN',name:'Manipur',region:'Northeast',capital:'Imphal',locations:['Imphal','Thoubal','Churachandpur','Bishnupur','Ukhrul']},
  {code:'ML',name:'Meghalaya',region:'Northeast',capital:'Shillong',locations:['Shillong','Tura','Jowai','Nongpoh','Williamnagar']},
  {code:'MZ',name:'Mizoram',region:'Northeast',capital:'Aizawl',locations:['Aizawl','Lunglei','Champhai','Kolasib','Serchhip']},
  {code:'NL',name:'Nagaland',region:'Northeast',capital:'Kohima',locations:['Kohima','Dimapur','Mokokchung','Tuensang','Wokha']},
  {code:'OD',name:'Odisha',region:'East',capital:'Bhubaneswar',locations:['Bhubaneswar','Cuttack','Rourkela','Berhampur','Sambalpur','Puri','Balasore','Baripada','Jharsuguda','Koraput']},
  {code:'PB',name:'Punjab',region:'North',capital:'Chandigarh',locations:['Amritsar','Ludhiana','Jalandhar','Patiala','Bathinda','Mohali','Pathankot','Hoshiarpur','Moga']},
  {code:'RJ',name:'Rajasthan',region:'North',capital:'Jaipur',locations:['Jaipur','Jodhpur','Udaipur','Kota','Ajmer','Bikaner','Alwar','Bharatpur','Sikar','Jaisalmer','Barmer']},
  {code:'SK',name:'Sikkim',region:'Northeast',capital:'Gangtok',locations:['Gangtok','Namchi','Gyalshing','Mangan','Rangpo']},
  {code:'TN',name:'Tamil Nadu',region:'South',capital:'Chennai',locations:['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tiruppur','Erode','Vellore','Thoothukudi','Thanjavur','Dindigul','Hosur','Nagercoil']},
  {code:'TS',name:'Telangana',region:'South',capital:'Hyderabad',locations:['Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam','Ramagundam','Mahbubnagar','Nalgonda','Adilabad','Siddipet']},
  {code:'TR',name:'Tripura',region:'Northeast',capital:'Agartala',locations:['Agartala','Udaipur','Dharmanagar','Kailashahar','Belonia']},
  {code:'UP',name:'Uttar Pradesh',region:'North',capital:'Lucknow',locations:['Lucknow','Kanpur','Varanasi','Agra','Prayagraj','Ghaziabad','Noida','Meerut','Bareilly','Aligarh','Moradabad','Gorakhpur','Ayodhya','Mathura','Jhansi']},
  {code:'UK',name:'Uttarakhand',region:'North',capital:'Dehradun',locations:['Dehradun','Haridwar','Haldwani','Rishikesh','Roorkee','Nainital','Almora','Pithoragarh','Rudrapur']},
  {code:'WB',name:'West Bengal',region:'East',capital:'Kolkata',locations:['Kolkata','Howrah','Durgapur','Asansol','Siliguri','Darjeeling','Kharagpur','Haldia','Malda','Bardhaman','Jalpaiguri']},
  {code:'AN',name:'Andaman and Nicobar Islands',region:'Union Territory',capital:'Port Blair',locations:['Port Blair','Diglipur','Mayabunder','Rangat']},
  {code:'CH',name:'Chandigarh',region:'Union Territory',capital:'Chandigarh',locations:['Chandigarh']},
  {code:'DN',name:'Dadra and Nagar Haveli and Daman and Diu',region:'Union Territory',capital:'Daman',locations:['Daman','Diu','Silvassa','Amli']},
  {code:'DL',name:'Delhi',region:'Union Territory',capital:'New Delhi',locations:['New Delhi','Delhi','Dwarka','Rohini','Saket']},
  {code:'JK',name:'Jammu and Kashmir',region:'North',capital:'Srinagar',locations:['Srinagar','Jammu','Anantnag','Baramulla','Kathua','Udhampur','Gulmarg','Pahalgam']},
  {code:'LA',name:'Ladakh',region:'Union Territory',capital:'Leh',locations:['Leh','Kargil','Nubra','Drass']},
  {code:'LD',name:'Lakshadweep',region:'Union Territory',capital:'Kavaratti',locations:['Kavaratti','Agatti','Amini','Andrott']},
  {code:'PY',name:'Puducherry',region:'Union Territory',capital:'Puducherry',locations:['Puducherry','Karaikal','Mahe','Yanam']},
];

export type HistoricalReading = {
  date: string;
  location: string;
  state: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  wind: number;
  windDirection: number;
  visibility: number;
  pressure: number;
  condition: string;
  risk: number;
};

const conditions = ['Clear','Partly Cloudy','Overcast','Rain','Heavy Rain','Thunderstorm','Heatwave','Fog','Strong Winds'];

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

export function generateHistoricalReading(location: string, state: string, date: Date): HistoricalReading {
  const key = `${location}-${state}-${date.toISOString().slice(0,10)}`;
  const n1 = hash(key), n2 = hash(key + '-rain'), n3 = hash(key + '-wind');
  const day = Math.floor((date.getTime() - Date.UTC(2025,0,1)) / 86400000);
  const seasonal = Math.sin((day / 365) * Math.PI * 2);
  const heat = (hash(state) - 0.5) * 5;
  const temperature = Math.round((28 + seasonal * -5 + heat + (n1 - 0.5) * 9) * 10) / 10;
  const rainfall = Math.max(0, Math.round((n2 ** 2 * (seasonal > -0.2 ? 28 : 8)) * 10) / 10);
  const humidity = Math.round(Math.min(98, Math.max(18, 67 + rainfall * 0.65 - temperature * 0.18 + (n1 - .5) * 14)));
  const wind = Math.round((6 + n3 * 24 + Math.max(0, rainfall - 8) * .18) * 10) / 10;
  const windDirection = Math.round(n2 * 359);
  const visibility = Math.round(Math.max(0.8, 14 - rainfall * .55 - (humidity > 88 ? 2 : 0)) * 10) / 10;
  const pressure = Math.round((1008 + (n3 - .5) * 22 - rainfall * .25) * 10) / 10;
  const risk = Math.round(Math.min(99, Math.max(4, rainfall * 2.2 + Math.max(0, temperature - 36) * 5 + wind * .45 + (100 - visibility) * .7)));
  const condition = conditions[Math.min(conditions.length - 1, Math.floor((rainfall / 28) * conditions.length + (temperature > 37 ? 6 : 0)))];
  return {date:key.slice(-10),location,state,temperature,rainfall,humidity,wind,windDirection,visibility,pressure,condition,risk};
}

export function generateHistory(location: string, state: string, days = 90, end = new Date('2026-09-29T00:00:00Z')) {
  return Array.from({length:days}, (_,i) => {
    const d = new Date(end); d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    return generateHistoricalReading(location,state,d);
  });
}

export const coverageLocations = INDIA_JURISDICTIONS.flatMap(j => j.locations.map(location => ({location,state:j.name,code:j.code,region:j.region})));
export const coverageSummary = {
  jurisdictions: INDIA_JURISDICTIONS.length,
  seededLocations: coverageLocations.length,
  historicalDaysPerLocation: 90,
  generatedReadings: coverageLocations.length * 90,
};

export function findLocation(query: string) {
  const q=query.trim().toLowerCase();
  if(!q) return coverageLocations[0];
  return coverageLocations.find(x => `${x.location} ${x.state}`.toLowerCase().includes(q)) ?? coverageLocations[0];
}
