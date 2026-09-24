export type WeatherEvent = { id:string; city:string; state:string; type:string; severity:string; confidence:number; temp:number; humidity:number; rain:number; verified:boolean; sources:number; time:string; x:number; y:number };
export const events: WeatherEvent[] = [
 {id:'EVT-001',city:'Visakhapatnam',state:'Andhra Pradesh',type:'Heavy Rainfall',severity:'High',confidence:91,temp:28.4,humidity:78,rain:2.3,verified:true,sources:7,time:'13:24 IST',x:61,y:64},
 {id:'EVT-002',city:'Mumbai',state:'Maharashtra',type:'Thunderstorm',severity:'Medium',confidence:86,temp:27.1,humidity:82,rain:6.8,verified:true,sources:6,time:'13:18 IST',x:35,y:66},
 {id:'EVT-003',city:'Kolkata',state:'West Bengal',type:'Heavy Rainfall',severity:'High',confidence:94,temp:29.2,humidity:88,rain:8.1,verified:true,sources:8,time:'13:11 IST',x:77,y:53},
 {id:'EVT-004',city:'Jaipur',state:'Rajasthan',type:'Heatwave',severity:'Medium',confidence:79,temp:38.7,humidity:31,rain:0,verified:true,sources:5,time:'12:59 IST',x:39,y:34},
 {id:'EVT-005',city:'Delhi',state:'NCR',type:'Dust Storm',severity:'Low',confidence:74,temp:35.6,humidity:38,rain:0,verified:false,sources:3,time:'12:47 IST',x:49,y:31},
 {id:'EVT-006',city:'Guwahati',state:'Assam',type:'Strong Winds',severity:'Medium',confidence:83,temp:26.9,humidity:91,rain:4.2,verified:true,sources:5,time:'12:42 IST',x:85,y:38}
];
export const nationalStats = {events:1284, verified:1097, suspicious:73, regions:31, sources:46};
