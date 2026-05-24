// ═══════════════════════════════════════════════════════════
//  Sonar Bangla Sankalp Tracker — Interactive Engine v2
// ═══════════════════════════════════════════════════════════
const OATH='2026-05-09T00:00:00+05:30',DL45='2026-06-23T23:59:59+05:30',DL180='2026-11-09T23:59:59+05:30';
const OATH_D=new Date(OATH),DL45_D=new Date(DL45),DL180_D=new Date(DL180);

// ── MANIFESTO DATA ──
const manifesto=[
  {id:1,title:"7th Pay Commission & DA Arrears",desc:"Implement 7th Pay Commission for state employees and clear all pending DA arrears.",cat:"Finance",dl:"2026-06-23",status:"In Progress",prog:50,pri:"high"},
  {id:2,title:"Annapurna Scheme — ₹3,000/month for Women",desc:"Monthly ₹3,000 financial assistance to all eligible women under Annapurna Scheme.",cat:"Women",dl:"2026-08-09",status:"In Progress",prog:60,pri:"high"},
  {id:3,title:"Uniform Civil Code (UCC)",desc:"Draft and pass Uniform Civil Code legislation in WB State Assembly.",cat:"Law & Order",dl:"2026-11-09",status:"Pending",prog:0,pri:"medium"},
  {id:4,title:"Ayushman Bharat Rollout",desc:"Full statewide implementation of Ayushman Bharat PM-JAY health insurance.",cat:"Healthcare",dl:"2026-06-10",status:"In Progress",prog:40,pri:"high"},
  {id:5,title:"BSF Border Fencing",desc:"Transfer land to BSF and complete Bangladesh border fencing.",cat:"Security",dl:"2026-06-25",status:"In Progress",prog:35,pri:"high"},
  {id:6,title:"Fill All State Dept Vacancies",desc:"Transparent recruitment to fill 2 lakh+ vacant posts across departments.",cat:"Employment",dl:"2026-12-31",status:"Pending",prog:5,pri:"medium"},
  {id:7,title:"CBI Investigation — TMC Corruption",desc:"Refer all pending TMC-era corruption cases to CBI.",cat:"Law & Order",dl:"2026-08-09",status:"In Progress",prog:20,pri:"high"},
  {id:8,title:"Ghatal Master Plan",desc:"Execute the Ghatal Master Plan for permanent flood control.",cat:"Infrastructure",dl:"2026-12-31",status:"Pending",prog:0,pri:"medium"},
  {id:9,title:"Singur Industrial Park",desc:"Restore Singur land as a modern industrial park.",cat:"Industry",dl:"2026-11-09",status:"Pending",prog:0,pri:"medium"},
  {id:10,title:"Youth Grant — ₹2,000/month",desc:"Monthly ₹2,000 stipend for unemployed educated youth.",cat:"Youth",dl:"2026-07-25",status:"Pending",prog:0,pri:"high"},
  {id:11,title:"BNS Criminal Code",desc:"Implement BNS, BNSS, BSA criminal codes statewide.",cat:"Law & Order",dl:"2026-06-25",status:"Completed",prog:100,pri:"high"},
  {id:12,title:"White Paper Audit",desc:"Publish White Paper on 15 years of TMC misgovernance.",cat:"Governance",dl:"2026-06-10",status:"In Progress",prog:35,pri:"high"},
  {id:13,title:"SIT for SSC Scam",desc:"Constitute SIT to probe SSC/TET recruitment scam.",cat:"Law & Order",dl:"2026-06-25",status:"In Progress",prog:25,pri:"high"},
  {id:14,title:"PM Vishwakarma Yojana",desc:"Implement PM Vishwakarma for artisans with credit & skill training.",cat:"Industry",dl:"2026-07-10",status:"In Progress",prog:30,pri:"medium"},
  {id:15,title:"State Census Exercise",desc:"Complete Census pending since 2021.",cat:"Governance",dl:"2026-10-31",status:"In Progress",prog:10,pri:"medium"}
];

// ── DAILY LOG (from May 4 — Election Result Day) ──
const dailyLog=[
  {date:"2026-05-04",dayNumber:-5,label:"🏆 Election Results Day",events:[
    {time:"8:00 AM",title:"Counting Begins Across West Bengal",desc:"EVM counting begins at 294 constituency centres across the state.",category:"Governance",icon:"bar-chart"},
    {time:"12:00 PM",title:"BJP Crosses Majority Mark",desc:"BJP crosses the 148-seat majority mark in trends. Celebrations erupt across Bengal.",category:"Governance",icon:"landmark"},
    {time:"4:00 PM",title:"TMC Concedes Defeat",desc:"Trinamool Congress accepts defeat after 15 years in power. Mamata Banerjee congratulates BJP.",category:"Governance",icon:"users"},
    {time:"6:00 PM",title:"Suvendu Adhikari Named CM Candidate",desc:"BJP Parliamentary Board names Suvendu Adhikari as the Chief Minister of West Bengal.",category:"Governance",icon:"user-check"}
  ]},
  {date:"2026-05-05",dayNumber:-4,label:"Victory Celebrations",events:[
    {time:"10:00 AM",title:"Celebrations Across Bengal",desc:"Victory rallies in all 23 districts. Workers distribute sweets and burst firecrackers.",category:"Governance",icon:"smile"},
    {time:"4:00 PM",title:"PM Modi Congratulates Bengal",desc:"PM Modi addresses the nation, calls it 'a new dawn for Sonar Bangla'.",category:"Governance",icon:"award"}
  ]},
  {date:"2026-05-06",dayNumber:-3,label:"Transition Planning",events:[
    {time:"11:00 AM",title:"Suvendu Meets Governor at Raj Bhavan",desc:"CM-designate Suvendu Adhikari meets Governor R.N. Ravi to stake claim to form government.",category:"Governance",icon:"building"},
    {time:"3:00 PM",title:"Cabinet Formation Discussions",desc:"BJP central leadership meets to finalize the Council of Ministers.",category:"Governance",icon:"users"},
    {time:"5:00 PM",title:"Kolkata Police Clamps Down on Rallies with Earthmovers",desc:"Police restrictions on procession routes were issued after post-poll clashes, with officers warning against carrying heavy machinery into public gatherings.",category:"Law & Order",icon:"shield-alert",source:"https://www.hindustantimes.com/india-news/no-rallies-with-earthmovers-allowed-says-kolkata-police-on-post-poll-clashes-101778073396306.html",thumb:"https://www.hindustantimes.com/ht-img/img/2026/05/06/550x309/A-damaged-portion-of-a-market-after-the-BJP-suppor_1778073389348.jpg"}
  ]},
  {date:"2026-05-07",dayNumber:-2,label:"Cabinet Finalized",events:[
    {time:"10:00 AM",title:"42-Member Ministry List Released",desc:"Final list of Council of Ministers released. Key portfolios: Home, Finance, Health, Education, Industry.",category:"Governance",icon:"landmark"},
    {time:"2:15 PM",title:"400+ Arrested, 200 FIRs Filed in Post-Poll Violence",desc:"Police say arrests and FIRs have climbed as violence erupts across West Bengal, with monitoring tightened across sensitive pockets.",category:"Law & Order",icon:"shield-alert",source:"https://indianexpress.com/article/cities/kolkata/over-400-arrested-200-firs-filed-say-police-as-violence-erupts-across-west-bengal-10676801/lite/",thumb:"https://images.indianexpress.com/2026/05/Acting-DGP-Siddh-Nath-Gupta-at-a-press-conference-in-Kolkata-on-Wednesday.-Express.jpg"},
    {time:"3:00 PM",title:"Police Deployment Increased After Aide's Killing",desc:"Security was stepped up after the killing of a Suvendu Adhikari aide, with additional forces moved into sensitive areas.",category:"Law & Order",icon:"shield-alert",source:"https://www.hindustantimes.com/india-news/west-bengal-post-poll-tension-heightens-after-suvendu-adhikari-s-aide-shot-dead-police-deployment-increased-101778128508265-amp.html",thumb:"https://www.hindustantimes.com/ht-img/img/2026/05/07/1600x900/hqdefault_1778131660821_1778131664350.jpg"},
    {time:"5:00 PM",title:"Oath Ceremony Date Announced",desc:"Governor announces swearing-in ceremony for May 9 at Brigade Parade Ground, Kolkata.",category:"Governance",icon:"calendar"}
  ]},
  {date:"2026-05-08",dayNumber:-1,label:"Eve of Government",events:[
    {time:"All Day",title:"Brigade Parade Ground Preparations",desc:"Massive stage setup at Brigade Parade Ground. 2.5 lakh chairs arranged. LED screens installed across Kolkata.",category:"Governance",icon:"building-2"},
    {time:"8:00 PM",title:"PM Modi Arrives in Kolkata",desc:"Prime Minister lands at NSC Bose International Airport. Received by Suvendu Adhikari.",category:"Governance",icon:"plane-landing"}
  ]},
  {date:"2026-05-09",dayNumber:0,label:"🇮🇳 Oath Ceremony",events:[
    {time:"11:00 AM",title:"CM Suvendu Adhikari Sworn In",desc:"Takes oath as Chief Minister at Brigade Parade Ground. PM Modi, NDA leaders, 2 lakh+ supporters attend.",category:"Governance",icon:"user-check"},
    {time:"12:30 PM",title:"Council of Ministers Takes Oath",desc:"Full 42-member council sworn in with key portfolios assigned.",category:"Governance",icon:"users-2"},
    {time:"4:00 PM",title:"CM's First Address to the State",desc:"CM Adhikari pledges to fulfill all Sankalp Patra promises. Announces 'Mission 365 Days'.",category:"Governance",icon:"megaphone"}
  ]},
  {date:"2026-05-10",dayNumber:1,label:"Day 1 — Nabanna",events:[
    {time:"10:00 AM",title:"CM Arrives at Nabanna Secretariat",desc:"First visit to state secretariat. Reviews pending files and administrative backlog.",category:"Governance",icon:"building-2"},
    {time:"3:00 PM",title:"Meeting with Chief Secretary & DGP",desc:"Assesses law & order situation and pending administrative matters.",category:"Governance",icon:"handshake"},
    {time:"5:00 PM",title:"Administrative Reshuffle Begins",desc:"Key IAS/IPS transfers initiated. New DGP and Home Secretary appointed.",category:"Governance",icon:"refresh-cw"}
  ]},
  {date:"2026-05-11",dayNumber:2,label:"Day 2 — First Cabinet 🔥",events:[
    {time:"10:00 AM",title:"First Cabinet Meeting at Nabanna",desc:"Historic first Cabinet meeting. 9 landmark decisions on Day 1 itself.",category:"Governance",icon:"landmark"},
    {time:"10:30 AM",title:"BSF Border Fencing Approved",desc:"Land transfer to BSF approved for Bangladesh border fence. 45-day target.",category:"Security",icon:"shield"},
    {time:"11:00 AM",title:"Ayushman Bharat Adopted",desc:"PM-JAY health scheme adopted — blocked by TMC for 5+ years.",category:"Healthcare",icon:"heart-pulse"},
    {time:"11:15 AM",title:"Vishwakarma & Ujjwala Greenlit",desc:"PM Vishwakarma Yojana + PM Ujjwala 3.0 approved immediately.",category:"Industry",icon:"flame"},
    {time:"11:30 AM",title:"BNS Criminal Code Implemented",desc:"Bharatiya Nyaya Sanhita implemented statewide — replacing IPC.",category:"Law & Order",icon:"scale"},
    {time:"12:00 PM",title:"Job Age Limit Extended +5 Years",desc:"Relief for lakhs of youth affected by SSC recruitment delays.",category:"Employment",icon:"graduation-cap"},
    {time:"12:30 PM",title:"State Census Exercise Initiated",desc:"Cabinet approves immediate commencement of the Census exercise in West Bengal, pending since 2021.",category:"Governance",icon:"bar-chart"},
    {time:"2:00 PM",title:"Writers' Buildings Restoration Announced",desc:"Government announces plan to shift the state secretariat back to the historic Writers' Buildings in central Kolkata.",category:"Governance",icon:"building-2"},
    {time:"3:00 PM",title:"Existing Welfare Schemes to Continue",desc:"CM Adhikari assures that no existing social welfare schemes will be discontinued. All beneficiaries will continue to receive benefits.",category:"Women",icon:"heart-handshake"},
    {time:"4:00 PM",title:"Cabinet Portfolios Finalised",desc:"West Bengal allocates departments to the five sworn-in ministers, with Panchayat, Food, BC Welfare, North Bengal Development and Women & Child Welfare among the key portfolios.",category:"Governance",icon:"landmark",source:"https://www.moneycontrol.com/news/india/west-bengal-cabinet-portfolios-announced-full-list-of-ministers-and-their-departments-13915507.html",thumb:"https://images.moneycontrol.com/static-mcnews/2026/05/20260509175021_West-Bengal-chief-minister-Suvendu-Adhikari.png"},
    {time:"4:30 PM",title:"No Deputy CM; Home & Finance Retained",desc:"The government decides against appointing a Deputy Chief Minister for now, with Home and Finance staying with the Chief Minister.",category:"Governance",icon:"shield",source:"https://newsarenaindia.com/states/no-deputy-cm-in-bengal-adhikari-allocates-portfolios/76980",thumb:"https://images.newsarenaindia.com/suvendu-4jpg_1778508352131.jpg"},
    {time:"5:00 PM",title:"BSF Land Transfer Process Begins",desc:"The state begins the process to transfer land to the BSF for border fencing along the Bangladesh frontier, with a 45-day completion target.",category:"Security",icon:"shield-check",source:"https://www.moneycontrol.com/news/india/suvendu-adhikari-s-first-cabinet-meeting-clears-45-day-deadline-for-bsf-land-transfer-in-bengal-unveils-key-decisions-13915009.html",thumb:"https://images.moneycontrol.com/static-mcnews/2026/05/20260509061100_Suvendu-Adhikari-CM-1.jpg"}
  ]},
  {date:"2026-05-12",dayNumber:3,label:"Day 2 — CBI Probe",events:[
    {time:"10:00 AM",title:"CBI Takes Over Probe Into Suvendu Aide Murder",desc:"The Central Bureau of Investigation takes over the probe after SIT arrests three suspects in the murder case.",category:"Law & Order",icon:"shield-alert",source:"https://www.tribuneindia.com/news/india/suvendu-adhikari-aide-murder-cbi-takes-over-probe-after-sit-arrests-3-suspects/amp",thumb:"https://www.tribuneindia.com/sortd-service/imaginary/v22-01/jpg/large/high?url=dGhldHJpYnVuZS1zb3J0ZC1wcm8tcHJvZC1zb3J0ZC9tZWRpYWIwMDM5NmUwLTRkZTktMTFmMS05NWQzLWFiMTg3NjE5Y2M0NS5qcGc="}
  ]},
  {date:"2026-05-18",dayNumber:9,label:"Day 9 — Second Cabinet",events:[
    {time:"10:00 AM",title:"Second Cabinet Meeting at Nabanna",desc:"CM Suvendu Adhikari chairs the second Cabinet meeting. Multiple major policy decisions are approved.",category:"Governance",icon:"landmark",source:"https://www.thehindu.com/news/national/west-bengal/bjp-government-in-west-bengal-announces-annapurna-scheme-free-bus-ride-for-women/article68189874.ece"},
    {time:"10:30 AM",title:"7th State Pay Commission Approved",desc:"The cabinet approves the constitution of the 7th State Pay Commission for salaries, pensions, and allowances revision of state employees.",category:"Finance",icon:"scale",source:"https://www.thehindu.com/news/national/west-bengal/bjp-government-in-west-bengal-announces-annapurna-scheme-free-bus-ride-for-women/article68189874.ece"},
    {time:"11:15 AM",title:"'Annapurna' Scheme Approved",desc:"Cabinet greenlights the 'Annapurna' scheme (Annapurna Bhandar), providing ₹3,000 per month to eligible women aged 25 to 60 via DBT starting June 1, 2026.",category:"Women",icon:"heart-handshake",source:"https://www.thehindu.com/news/national/west-bengal/bjp-government-in-west-bengal-announces-annapurna-scheme-free-bus-ride-for-women/article68189874.ece"},
    {time:"12:00 PM",title:"Free Public Transport for Women",desc:"In-principle approval granted for free travel for women in state-run buses, effective June 1, 2026.",category:"Women",icon:"bus",source:"https://www.thehindu.com/news/national/west-bengal/bjp-government-in-west-bengal-announces-annapurna-scheme-free-bus-ride-for-women/article68189874.ece"},
    {time:"12:30 PM",title:"Discontinuation of Religion-Based Aid",desc:"The cabinet decides to discontinue government financial assistance programs based on religious categorization starting June 2026 (including imams, muezzins, and purohits).",category:"Governance",icon:"shield-alert",source:"https://www.thehindu.com/news/national/west-bengal/bjp-government-in-west-bengal-announces-annapurna-scheme-free-bus-ride-for-women/article68189874.ece"},
    {time:"1:00 PM",title:"Scrapping and Revising OBC List",desc:"Scraps existing state OBC list in line with the Calcutta High Court judgment; panel formed to identify quota eligibility.",category:"Governance",icon:"users",source:"https://www.thehindu.com/news/national/west-bengal/bjp-government-in-west-bengal-announces-annapurna-scheme-free-bus-ride-for-women/article68189874.ece"}
  ]},
  {date:"2026-05-20",dayNumber:11,label:"Day 11 — BSF Land Corridor",events:[
    {time:"2:00 PM",title:"27-km BSF Land Corridor Formally Transferred",desc:"State government formally transfers a 27-km land corridor to the Border Security Force spanning five districts, enabling pending Bangladesh border fencing work to commence immediately.",category:"Security",icon:"shield-check",source:"https://www.thehindu.com/news/national/west-bengal/"},
    {time:"4:00 PM",title:"Detect, Delete & Deport — Mechanism Active",desc:"CM Adhikari confirms the 'Detect, Delete & Deport' framework for illegal infiltrators came into effect. Police and RPF directed to hand over infiltrators (not covered under CAA) directly to BSF for deportation. CMO to receive weekly reports.",category:"Security",icon:"shield-alert",source:"https://www.thehindu.com/news/national/west-bengal/"}
  ]},
  {date:"2026-05-21",dayNumber:12,label:"Day 12 — OBC List & Media",events:[
    {time:"11:00 AM",title:"Revised OBC List of 66 Classes Notified",desc:"The state government formally notifies a revised list of 66 OBC classes for reservation in state services, aligning with the Calcutta High Court directive.",category:"Governance",icon:"file-text",source:"https://newsonair.gov.in/"},
    {time:"3:00 PM",title:"Media Interaction Restrictions Issued",desc:"Administration issues a strict directive prohibiting government employees and officials from interacting with media outlets without prior approval.",category:"Governance",icon:"shield-alert",source:"https://www.thehindu.com/news/national/west-bengal/"}
  ]},
  {date:"2026-05-22",dayNumber:13,label:"Day 13 — Urban Reform & Border Action",events:[
    {time:"9:00 AM",title:"'Detect, Delete & Deport' — CAA-Exempt Deportations Confirmed",desc:"CM Adhikari reaffirms that infiltrators not covered under CAA will be directly handed to BSF without producing before courts. CMO to receive weekly oversight reports on BSF-BGB handovers.",category:"Security",icon:"shield-check",source:"https://www.thehindu.com/news/national/west-bengal/"},
    {time:"11:00 AM",title:"Agnimitra Paul Defends Urban Demolition Drive",desc:"Urban Development Minister Agnimitra Paul defends zero-tolerance policy on illegal structures. Notices served to building owners; demolitions proceed on failure to present valid legal documents. Drives linked to Tiljala fire safety concerns.",category:"Governance",icon:"building",source:"https://uniindia.com/"},
    {time:"2:00 PM",title:"TMC Portraits Replaced in Government Offices",desc:"BJP workers replace portraits of former CM Mamata Banerjee with those of President Droupadi Murmu, PM Modi, and CM Suvendu Adhikari in government offices including Asansol Municipal Corporation.",category:"Governance",icon:"landmark",source:"https://www.aninews.in/"}
  ]}
];

// ── KEY MOMENTS (YouTube thumbnails) ──
const moments=[
  {title:"BJP Wins Bengal — Historic Victory",desc:"BJP crosses 200+ seats, ending 15 years of TMC rule in West Bengal.",date:"May 4, 2026",badge:"RESULT DAY",thumb:"https://i.ytimg.com/vi/RHuQIN8Eb5c/hqdefault.jpg",yt:"https://www.youtube.com/watch?v=RHuQIN8Eb5c"},
  {title:"Suvendu Adhikari Sworn In as CM",desc:"Historic oath ceremony at Brigade Parade Ground with PM Modi present.",date:"May 9, 2026",badge:"OATH",thumb:"https://i.ytimg.com/vi/HM1zLB3BKzU/hqdefault.jpg",yt:"https://www.youtube.com/watch?v=HM1zLB3BKzU"},
  {title:"First Cabinet — 9 Landmark Decisions",desc:"Ayushman Bharat, BSF fencing, BNS implementation, Census approved on Day 1.",date:"May 11, 2026",badge:"DAY 2",thumb:"https://i.ytimg.com/vi/2TsXcYSWss4/hqdefault.jpg",yt:"https://www.youtube.com/watch?v=2TsXcYSWss4"},
  {title:"Second Cabinet — Historic Decisions",desc:"Cabinet approves ₹3,000/month Annapurna scheme, 7th Pay Commission, and free bus rides for women.",date:"May 18, 2026",badge:"CABINET",thumb:"https://i.ytimg.com/vi/W-9a_N19xZ4/hqdefault.jpg",yt:"https://www.youtube.com/watch?v=W-9a_N19xZ4"},
  {title:"PM Modi's 'Sonar Bangla' Address",desc:"PM congratulates Bengal, calls it 'a new dawn for Sonar Bangla'.",date:"May 5, 2026",badge:"NATIONAL",thumb:"https://i.ytimg.com/vi/mvF4KRNYmnQ/hqdefault.jpg",yt:"https://www.youtube.com/watch?v=mvF4KRNYmnQ"},
  {title:"Ayushman Bharat — Finally in Bengal!",desc:"State adopts PM-JAY after 5 years of TMC blockade.",date:"May 11, 2026",badge:"HEALTHCARE",thumb:"https://i.ytimg.com/vi/It3VkaK6BcQ/hqdefault.jpg",yt:"https://www.youtube.com/watch?v=It3VkaK6BcQ"},
  {title:"Writers' Building Restoration Announced",desc:"Historic secretariat to be restored and reoccupied by new government.",date:"May 11, 2026",badge:"HERITAGE",thumb:"https://i.ytimg.com/vi/KORtre6IVLk/hqdefault.jpg",yt:"https://www.youtube.com/watch?v=KORtre6IVLk"}
];

const cloneData=v=>JSON.parse(JSON.stringify(v));
function defaultSiteData(){
  return cloneData({manifesto,dailyLog,moments,backlog});
}
function normalizeSiteData(raw){
  const base=defaultSiteData();
  if(!raw || typeof raw!=='object') return base;
  ['manifesto','dailyLog','moments','backlog'].forEach(key=>{
    if(Array.isArray(raw[key])) base[key]=raw[key];
  });
  return base;
}
function syncArray(target, source){
  target.splice(0,target.length,...cloneData(source));
}
function applySiteData(data){
  const clean=normalizeSiteData(data);
  syncArray(manifesto, clean.manifesto);
  syncArray(dailyLog, clean.dailyLog);
  syncArray(moments, clean.moments);
  syncArray(backlog, clean.backlog);
  return clean;
}
function currentSiteData(){
  return cloneData({manifesto,dailyLog,moments,backlog});
}
async function loadSiteData(){
  const sources = location.protocol === 'file:'
    ? ['data/site-content.json']
    : ['/api/content', 'data/site-content.json'];
  for(const url of sources){
    try{
      const res = await fetch(url, {cache:'no-store'});
      if(!res.ok) continue;
      return applySiteData(await res.json());
    }catch(err){
      // Try the next source.
    }
  }
  return applySiteData(defaultSiteData());
}

// ── BACKLOG ──
const backlog=[
  {id:1,p:"Ghatal Master Plan (Flood Control)",v:800,s:2012,y:14,d:"Water Resources",st:"Review Started",r:5},
  {id:2,p:"Singur Industrial Land Restoration",v:450,s:2011,y:15,d:"Industry",st:"Land Survey Initiated",r:10},
  {id:3,p:"SSC Recruitment Scam Redressal",v:null,s:2016,y:10,d:"Education",st:"SIT Constituted",r:25},
  {id:4,p:"Narada Sting CBI Cases",v:null,s:2016,y:10,d:"Law & Justice",st:"In Court",r:40},
  {id:5,p:"MGNREGA Wage Diversion Audit",v:3000,s:2015,y:11,d:"Rural Dev",st:"CAG Audit Ordered",r:15},
  {id:6,p:"Kolkata Port Road Connectivity",v:620,s:2018,y:8,d:"Transport",st:"DPR Under Review",r:8},
  {id:7,p:"Bengal Safari Expansion",v:110,s:2019,y:7,d:"Forest",st:"Pending",r:0},
  {id:8,p:"Raiganj Medical College",v:340,s:2017,y:9,d:"Health",st:"Construction Stalled",r:30},
  {id:9,p:"Smart City Mission (4 Cities)",v:2100,s:2017,y:9,d:"Urban Dev",st:"30% Complete",r:30},
  {id:10,p:"Deucha Pachami Coal Block",v:1000,s:2021,y:5,d:"Mining",st:"Env. Review",r:12}
];

// ═══════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════
const $=s=>document.getElementById(s);
const $$=s=>document.querySelectorAll(s);
function dayNum(){return Math.max(0,Math.floor((Date.now()-OATH_D)/(864e5)))}
function daysLeft(dl){return Math.max(0,Math.ceil((new Date(dl+'T23:59:59+05:30')-Date.now())/864e5))}
function fmtDate(d){return new Date(d+'T00:00:00+05:30').toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}
function stCls(s){return s==='Completed'?'completed':s==='In Progress'?'progress':'pending'}
function stBadge(s){return s==='Completed'?'badge-completed':s==='In Progress'?'badge-progress':'badge-pending'}
const catEmoji={Finance:'💰',Women:'👩','Law & Order':'⚖️',Healthcare:'🏥',Security:'🛡️',Employment:'💼',Infrastructure:'🏗️',Industry:'🏭',Youth:'🎓',Governance:'🏛️'};
function youtubeThumb(url){
  const m=String(url||'').match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : '';
}
function sourceIcon(link,label='Open source'){
  return `
    <button type="button" class="source-link" aria-label="${label}" title="${label}" onclick="event.stopPropagation();window.open('${link}','_blank','noopener,noreferrer')">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7h-2V6.41l-8.29 8.3-1.42-1.42 8.3-8.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>
    </button>`;
}

function refreshSite(){
  activeTLDay=Math.max(0,dailyLog.length-1);
  renderMoments();
  renderFilters();
  renderPromises();
  renderTimelineCompact();
  setupTLNav();
  renderTimelineVertical();
  renderBacklog();
  renderInfra();
  initReveal();
  renderHeroStats();
  renderHeroHighlight();
}

function renderHeroStats(){
  const totalEl = $('statTotal');
  const doneEl = $('statDone');
  const wipEl = $('statWIP');
  const pendEl = $('statPend');
  if (!totalEl || !doneEl || !wipEl || !pendEl) return;

  const total = manifesto.length;
  const completed = manifesto.filter(p => p.status === 'Completed').length;
  const inProgress = manifesto.filter(p => p.status === 'In Progress').length;
  const pending = manifesto.filter(p => p.status === 'Pending').length;

  totalEl.textContent = total;
  doneEl.textContent = completed;
  wipEl.textContent = inProgress;
  pendEl.textContent = pending;
}

function renderHeroHighlight(){
  const container = $('heroHighlightNews');
  if (!container) return;
  
  if (!dailyLog || dailyLog.length === 0) {
    container.innerHTML = '<div class="hl-loading">No updates available</div>';
    return;
  }

  // Get the most recent day that has events
  const latestDay = [...dailyLog].reverse().find(d => d.events && d.events.length > 0);
  
  if (!latestDay) {
    container.innerHTML = '<div class="hl-loading">No recent events</div>';
    return;
  }

  // Get the first (most important) event of that day
  const topEvent = latestDay.events[0];
  const dateStr = fmtDate(latestDay.date);
  
  container.innerHTML = `
    <a href="#timeline" class="hl-card">
      <div class="hl-meta">
        <span class="hl-cat">${topEvent.category || 'Update'}</span>
        <span class="hl-date">${dateStr}</span>
      </div>
      <div class="hl-title">${topEvent.title}</div>
      <div class="hl-desc">${topEvent.desc}</div>
    </a>
  `;
}


function actionBucket(time){
  const t=(time||'').toLowerCase();
  if(t.includes('all day')) return 'all-day';
  const m=t.match(/(\d{1,2})(?::\d{2})?\s*(am|pm)/i);
  if(!m) return 'morning';
  const hour=Number(m[1]) % 12 + (m[2].toLowerCase()==='pm' ? 12 : 0);
  if(hour < 12) return 'morning';
  if(hour < 17) return 'afternoon';
  return 'evening';
}

function actionDept(text){
  const t=(text||'').toLowerCase();
  if(/cabinet|minister|secretariat|secretary|dgp|governor|cm/.test(t)) return 'Governance';
  if(/ayushman|health|hospital|medical/.test(t)) return 'Health';
  if(/border|bsf|security|law|bns|cbi|ssc|arrest|police|violence|crime|clash|murder|riot|fir|unrest/.test(t)) return 'Law & Order';
  if(/census|job|employment|vacanc|youth/.test(t)) return 'Employment';
  if(/welfare|women|arrea|da|pay commission/.test(t)) return 'Finance';
  if(/writers|heritage|industrial|industrial park|ghatal|singur|infrastructure|fencing/.test(t)) return 'Infrastructure';
  return 'General Affairs';
}

function actionStatus(text){
  const t=(text||'').toLowerCase();
  if(/approved|adopted|implemented|sworn in|announces|crosses|concedes|released|initiated|finalized|retained|takes over/.test(t)) return 'Done';
  if(/review|discuss|meeting|planning|preparations|meeting|holds|arrives/.test(t)) return 'In Progress';
  return 'Pending';
}

function actionType(text){
  const t=(text||'').toLowerCase();
  if(/cabinet|secretariat|portfolio|minister|deputy cm/.test(t)) return 'cabinet';
  if(/land transfer|fencing/.test(t)) return 'announcement';
  if(/arrest|police|violence|crime|clash|murder|riot|fir|unrest|detain|raid|attack|probe|cbi/.test(t)) return 'law-order';
  if(/sworn in|oath|named|announces|released|approved|adopted|implemented/.test(t)) return 'announcement';
  if(/meeting|briefing|discussion|meets|holds/.test(t)) return 'meeting';
  if(/arrives|visit|travels|goes/.test(t)) return 'movement';
  if(/crosses|concedes|result/.test(t)) return 'result';
  return 'update';
}

function actionImportance(text){
  const t=(text||'').toLowerCase();
  return /sworn in|approved|adopted|implemented|crosses|concedes|released|cabinet|named|probe|arrest|violence|murder/.test(t);
}

function bucketLabel(bucket){
  return bucket==='morning' ? 'Morning' : bucket==='afternoon' ? 'Afternoon' : bucket==='evening' ? 'Evening' : 'All Day';
}

function actionMeta(day, e){
  const text=`${e.title} ${e.desc} ${day.label}`;
  return {
    dept: e.category || actionDept(text),
    status: actionStatus(text),
    type: actionType(text),
    important: actionImportance(text),
    bucket: actionBucket(e.time),
    source: e.source || '',
  };
}

function dayTypeForEvents(events){
  const types=events.map(e=>actionType(`${e.title} ${e.desc}`));
  if(types.includes('cabinet')) return 'cabinet';
  if(types.includes('law-order')) return 'law-order';
  if(types.includes('result')) return 'result';
  if(types.includes('meeting')) return 'meeting';
  if(types.includes('movement')) return 'movement';
  if(types.includes('announcement')) return 'announcement';
  return 'update';
}

// ═══════════════════════════════════════════════════════════
//  PARTICLES
// ═══════════════════════════════════════════════════════════
function initParticles(){
  const c=$('particles');if(!c)return;
  const colors=['rgba(255,119,34,','rgba(19,136,8,','rgba(255,255,255,'];
  for(let i=0;i<35;i++){
    const p=document.createElement('div');p.className='particle';
    const sz=Math.random()*4+2;
    const col=colors[Math.floor(Math.random()*3)];
    p.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;background:${col}${Math.random()*.5+.2});animation-duration:${Math.random()*8+6}s;animation-delay:${Math.random()*6}s;`;
    c.appendChild(p);
  }
}

// ═══════════════════════════════════════════════════════════
//  COUNTDOWNS
// ═══════════════════════════════════════════════════════════
function updateCD(){
  if(!$('cd45d') || !$('cd45h') || !$('cd45m') || !$('cd45s') || !$('cd180d') || !$('cd180h') || !$('cd180m') || !$('cd180s')) return;
  [[DL45_D,'cd45'],[DL180_D,'cd180']].forEach(([t,p])=>{
    const d=Math.max(0,t-Date.now());
    $(p+'d').textContent=String(Math.floor(d/864e5)).padStart(2,'0');
    $(p+'h').textContent=String(Math.floor(d%864e5/36e5)).padStart(2,'0');
    $(p+'m').textContent=String(Math.floor(d%36e5/6e4)).padStart(2,'0');
    $(p+'s').textContent=String(Math.floor(d%6e4/1e3)).padStart(2,'0');
  });
}

// ═══════════════════════════════════════════════════════════
//  KEY MOMENTS GALLERY
// ═══════════════════════════════════════════════════════════
function renderMoments(){
  const c=$('momentsScroll');
  if(!c) return;
  c.innerHTML=moments.map(m=>`
    <div class="moment-card reveal-scale" role="link" tabindex="0" data-open="${m.yt}">
      <div class="moment-thumb">
        <img src="${m.thumb}" alt="${m.title}" onerror="this.src='https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=640&q=60'">
        <div class="play-btn"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
        <div class="moment-badge">${m.badge}</div>
        <div class="moment-overlay-date">🗓️ ${m.date}</div>
        ${sourceIcon(m.yt,'Open source')}
      </div>
      <div class="moment-body"><h4>${m.title}</h4><p>${m.desc}</p></div>
    </div>`).join('');
  $$('.moment-card').forEach(card=>{
    const open=()=>window.open(card.dataset.open,'_blank','noopener,noreferrer');
    card.onclick=e=>{if(e.target.closest('.source-link')) return; open();};
    card.onkeydown=e=>{if(e.key==='Enter' || e.key===' '){e.preventDefault(); open();}};
  });
}

// ═══════════════════════════════════════════════════════════
//  PROMISES
// ═══════════════════════════════════════════════════════════
function renderPromises(filter='all'){
  const g=$('promisesGrid');
  if(!g) return;
  const list=filter==='all'?manifesto:manifesto.filter(p=>p.cat===filter);
  g.innerHTML=list.map(p=>`
    <div class="promise-card reveal">
      <div class="promise-header">
        <div class="promise-icon">${catEmoji[p.cat]||'📌'}</div>
        <div class="promise-title">${p.title}</div>
        ${p.source ? sourceIcon(p.source,'Open source') : ''}
      </div>
      <div class="promise-desc">${p.desc}</div>
      <div class="promise-meta">
        <span class="badge ${stBadge(p.status)}">${p.status}</span>
        <span class="badge badge-cat">${p.cat}</span>
        <span class="badge badge-dl">⏰ ${daysLeft(p.dl)}d left</span>
      </div>
      <div class="pbar-wrap"><div class="pbar-fill ${stCls(p.status)}" style="width:${p.prog}%"></div></div>
      <div class="pbar-label"><span>Progress</span><span>${p.prog}%</span></div>
    </div>`).join('');
  initReveal();
}

function renderFilters(){
  const pills=$('filterPills');
  if(!pills) return;
  const cats=['all',...new Set(manifesto.map(p=>p.cat))];
  pills.innerHTML=cats.map(c=>`<button class="pill${c==='all'?' active':''}" data-f="${c}">${c==='all'?'All':c}</button>`).join('');
  $$('.pill').forEach(p=>p.onclick=()=>{$$('.pill').forEach(x=>x.classList.remove('active'));p.classList.add('active');renderPromises(p.dataset.f)});
}

// ═══════════════════════════════════════════════════════════
//  DAILY ACTION LOG
// ═══════════════════════════════════════════════════════════
let activeTLDay=dailyLog.length-1;

function renderTimelineCompact(){
  const sc=$('tlScroll');
  if(!sc) return;
  sc.innerHTML=dailyLog.map((d,i)=>`
    <div class="tl-day${i===activeTLDay?' active':''}" data-i="${i}">
      <div class="tl-dot-wrap"><div class="tl-dot"></div></div>
      <div class="tl-day-date">${fmtDate(d.date)}</div>
      <div class="tl-day-label">${d.label}</div>
      <div class="tl-card">
        ${d.events.slice(0,3).map(e=>`<div class="ev"><div class="ev-time">${e.time}</div><div class="ev-title">${e.title}</div><div class="ev-desc">${e.desc}</div></div>`).join('')}
        ${d.events.length>3?`<div class="ev" style="color:var(--saffron);font-size:11px;font-weight:600;padding:6px 0">+ ${d.events.length-3} more actions →</div>`:''}
      </div>
    </div>`).join('');

  $$('.tl-day').forEach(el=>el.onclick=()=>{
    activeTLDay=+el.dataset.i;
    $$('.tl-day').forEach(x=>x.classList.remove('active'));
    el.classList.add('active');
    updateTLProgress();
    el.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  });

  setTimeout(()=>{
    const active=sc.querySelector('.tl-day.active');
    if(active) active.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  },500);

  updateTLProgress();
}

function updateTLProgress(){
  const el=$('tlProgress');
  if(!el) return;
  const pct=((activeTLDay+1)/dailyLog.length)*100;
  el.style.width=pct+'%';
}

function setupTLNav(){
  const prev=$('tlPrev'), next=$('tlNext');
  if(!prev || !next) return;
  prev.onclick=()=>{if(activeTLDay>0){activeTLDay--;renderTimelineCompact()}};
  next.onclick=()=>{if(activeTLDay<dailyLog.length-1){activeTLDay++;renderTimelineCompact()}};
}

function renderTimelineVertical(){
  const wrap=$('timelineList');
  if(!wrap) return;
  const ordered=[...dailyLog].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const stats=$('timelineStats');
  if(stats){
    const totalEvents=ordered.reduce((sum,d)=>sum+d.events.length,0);
    const sourced=ordered.reduce((sum,d)=>sum+d.events.filter(e=>e.source).length,0);
    const major=ordered.reduce((sum,d)=>sum+d.events.filter(e=>actionImportance(`${e.title} ${e.desc}`)).length,0);
    stats.innerHTML=[
      {k:'Days covered',v:`${ordered.length}`,s:'Latest day first'},
      {k:'Total actions',v:`${totalEvents}`,s:'Across all logged days'},
      {k:'Major decisions',v:`${major}`,s:'High-impact items'},
      {k:'Source-linked',v:`${sourced}`,s:'Only items with real source pages'},
    ].map(i=>`<div class="timeline-summary-card visible"><span>${i.k}</span><strong>${i.v}</strong><small>${i.s}</small></div>`).join('');
  }

  const filterData=[
    {key:'all',label:'All days'},
    {key:'cabinet',label:'Cabinet'},
    {key:'law-order',label:'Law & Order'},
    {key:'announcement',label:'Announcements'},
    {key:'meeting',label:'Meetings'},
    {key:'result',label:'Results'},
    {key:'movement',label:'Movement'},
  ];
  const filters=$('timelineFilters');
  if(filters){
    filters.innerHTML=filterData.map((f,i)=>`<button class="timeline-filter${i===0?' active':''}" data-filter="${f.key}">${f.label}</button>`).join('');
  }

  const dayCards=ordered.map((d,i)=>{
    const dayEvents=d.events.map((e,ei)=>({e,...actionMeta(d,e),index:ei}));
    const groups=['morning','afternoon','evening'].map(bucket=>({
      bucket,
      events: dayEvents.filter(x=>x.bucket===bucket)
    })).filter(g=>g.events.length);
    const majorCount=dayEvents.filter(x=>x.important).length;
    const statusCounts={
      done: dayEvents.filter(x=>x.status==='Done').length,
      progress: dayEvents.filter(x=>x.status==='In Progress').length,
      pending: dayEvents.filter(x=>x.status==='Pending').length,
    };
    const topEvent=dayEvents[0];
    const dayType=dayTypeForEvents(d.events);
    const daySource=d.events.find(e=>e.source)?.source || '';
    return `
    <article class="v-item visible ${i%2===0?'':'is-right'}" data-i="${i}" data-day-label="${d.label.toLowerCase()}" data-day-type="${dayType}">
      <div class="v-dot"></div>
      <div class="v-card-wrap">
        <div class="v-card">
          <div class="v-card-head">
            <div>
              <div class="v-date-tag">${fmtDate(d.date)}</div>
              <div class="v-day-label">${d.label}</div>
            </div>
            ${daySource ? sourceIcon(daySource,'Open source for the day') : ''}
          </div>
          <div class="v-day-summary">
            <div class="v-summary-pill"><span>Actions</span><strong>${d.events.length}</strong></div>
            <div class="v-summary-pill"><span>Done</span><strong>${statusCounts.done}</strong></div>
            <div class="v-summary-pill"><span>In progress</span><strong>${statusCounts.progress}</strong></div>
            <div class="v-summary-pill"><span>Pending</span><strong>${statusCounts.pending}</strong></div>
          </div>
          ${topEvent ? `<div class="v-day-highlight">
            <span>Lead item</span>
            <strong>${topEvent.e.title}</strong>
            <p>${topEvent.e.desc}</p>
          </div>` : ''}
          <div class="v-event-columns">
            ${groups.map(group=>`
              <section class="v-event-group">
                <div class="v-group-label">${bucketLabel(group.bucket)}</div>
                <div class="v-event-list">
                  ${group.events.map(({e,dept,status,type,important,source})=>{
                    const mediaSrc=e.thumb || youtubeThumb(source);
                    return `
                    <div class="v-ev ${type} ${important?'is-major':''}">
                      <div class="v-ev-top">
                        <div class="v-ev-time">${e.time}</div>
                        <div class="v-ev-meta">
                          <span class="v-chip ${type}">${type}</span>
                          <span class="v-chip ${status==='Done'?'done':status==='In Progress'?'progress':'pending'}">${status}</span>
                        </div>
                      </div>
                      ${mediaSrc?`<div class="v-ev-media"><img src="${mediaSrc}" alt="${e.title}" loading="lazy" onerror="this.remove()"></div>`:''}
                      <div class="v-ev-title">${e.title}</div>
                      <div class="v-ev-desc">${e.desc}</div>
                      <div class="v-ev-footer">
                        <span class="v-dept">${dept}</span>
                        ${source?sourceIcon(source,'Open source for action'):''}
                      </div>
                      ${important ? '<div class="v-pin">High impact</div>' : ''}
                    </div>
                  `}).join('')}
                </div>
              </section>
            `).join('')}
          </div>
        </div>
      </div>
    </article>`;
  }).join('');

  wrap.innerHTML=dayCards;
  applyTimelineFilters();
}

function applyTimelineFilters(){
  const buttons=$$('.timeline-filter');
  const items=$$('.v-item');
  if(!buttons.length || !items.length) return;
  buttons.forEach(btn=>btn.onclick=()=>{
    buttons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f=btn.dataset.filter;
    items.forEach(item=>{
      const type=item.dataset.dayType||'update';
      item.style.display=(f==='all' || type===f) ? '' : 'none';
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  BACKLOG TABLE
// ═══════════════════════════════════════════════════════════
function renderBacklog(){
  const body=$('backlogBody');
  if(!body) return;
  body.innerHTML=backlog.map(b=>`
    <tr>
      <td style="color:var(--text3)">${b.id}</td>
      <td><div class="bl-name">${b.p}</div><div class="bl-dept">${b.d}</div></td>
      <td><span class="bl-val">${b.v?'₹'+b.v.toLocaleString('en-IN')+' Cr':'—'}</span></td>
      <td style="color:var(--text2)">${b.s}</td>
      <td><span class="bl-yrs">${b.y} yrs</span></td>
      <td><span class="badge ${b.r>20?'badge-progress':'badge-pending'}">${b.st}</span></td>
      <td><div style="display:flex;align-items:center;gap:6px"><div class="res-bar"><div class="res-fill" style="width:${b.r}%"></div></div><span class="res-text">${b.r}%</span></div></td>
      <td>${b.source ? sourceIcon(b.source,'Open source') : ''}</td>
    </tr>`).join('');
}

// ═══════════════════════════════════════════════════════════
//  INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════
function renderInfra(){
  const grid=$('infraGrid');
  if(!grid) return;
  const data=[
    {t:"Ghatal Master Plan",d:"Flood management for Ghatal, Daspur, Chandrakona. ₹800Cr stuck since 2012.",p:5,c:"var(--saffron)",ms:[{t:"Cabinet approval for review",done:true},{t:"Hydrological survey",done:false},{t:"DPR revision & costing",done:false},{t:"Tender & construction",done:false}]},
    {t:"Singur Industrial Park",d:"Former Tata Nano site revival. ₹450Cr investment target. Deadlocked since 2011.",p:10,c:"var(--green-light)",ms:[{t:"Land survey initiated",done:true},{t:"Farmer compensation review",done:true},{t:"Industrial zoning plan",done:false},{t:"Investor outreach & MoUs",done:false}]}
  ];
  const C=2*Math.PI*42;
  grid.innerHTML=data.map(i=>{
    const off=C-(i.p/100)*C;
    return`<div class="infra-card reveal">
      ${i.source ? sourceIcon(i.source,'Open source') : ''}
      <h3>${i.t}</h3><div class="idesc">${i.d}</div>
      <div class="pr-wrap">
        <div class="pr-ring"><svg width="100" height="100" viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="42"/><circle class="fill" cx="50" cy="50" r="42" stroke="${i.c}" stroke-dasharray="${C}" stroke-dashoffset="${off}"/></svg><div class="ct" style="color:${i.c}">${i.p}%<span>Done</span></div></div>
        <div class="milestones">${i.ms.map(m=>`<div class="ms"><div class="dot ${m.done?'done':'pend'}"></div><span style="color:${m.done?'var(--text)':'var(--text3)'}">${m.t}</span></div>`).join('')}</div>
      </div>
    </div>`}).join('');
}

// ═══════════════════════════════════════════════════════════
//  SCROLL REVEAL ANIMATIONS
// ═══════════════════════════════════════════════════════════
function initReveal(){
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}});
  },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
  $$('.reveal,.reveal-left,.reveal-scale').forEach(el=>obs.observe(el));
}

// ═══════════════════════════════════════════════════════════
//  NAV SCROLL
// ═══════════════════════════════════════════════════════════
function setupNav(){
  $$('.nav-links a').forEach(a=>{
    a.onclick=e=>{
      const href=a.getAttribute('href')||'';
      if(!href.startsWith('#')) return;
      e.preventDefault();
      const t=document.querySelector(href);
      if(t)t.scrollIntoView({behavior:'smooth'});
      $$('.nav-links a').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
    };
  });
}

// ═══════════════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════
function showToast(title, msg, icon='✅'){
  const container = $('toastContainer');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <button class="toast-close" aria-label="Close">&times;</button>
    <div class="toast-progress"></div>
  `;
  container.appendChild(toast);
  // Trigger animation
  requestAnimationFrame(()=>requestAnimationFrame(()=>toast.classList.add('show')));
  const dismiss = () => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(()=>toast.remove(), 500);
  };
  toast.querySelector('.toast-close').onclick = dismiss;
  setTimeout(dismiss, 5000);
}

// ═══════════════════════════════════════════════════════════
//  LIVE REFRESH SYSTEM
// ═══════════════════════════════════════════════════════════
let _lastDataHash = '';
let _lastRefreshTime = Date.now();
let _liveAgoInterval = null;

function dataHash(data){
  return JSON.stringify(data).length + ':' + JSON.stringify(data).slice(0,200);
}

function updateLiveAgo(){
  const el = $('liveAgo');
  if(!el) return;
  const diff = Math.floor((Date.now() - _lastRefreshTime)/1000);
  if(diff < 60) el.textContent = 'Updated just now';
  else if(diff < 3600) el.textContent = `Updated ${Math.floor(diff/60)}m ago`;
  else el.textContent = `Updated ${Math.floor(diff/3600)}h ago`;
}

function flashLiveBadge(){
  const badge = $('liveBadge');
  if(!badge) return;
  badge.classList.add('updated');
  setTimeout(()=>badge.classList.remove('updated'), 2000);
}

async function checkForUpdates(){
  try{
    const url = location.protocol === 'file:'
      ? `data/site-content.json?_=${Date.now()}`
      : `/api/content?_=${Date.now()}`;
    const sources = location.protocol === 'file:'
      ? [`data/site-content.json?_=${Date.now()}`]
      : [`/api/content?_=${Date.now()}`, `data/site-content.json?_=${Date.now()}`];
    
    let newData = null;
    for(const src of sources){
      try{
        const res = await fetch(src, {cache:'no-store'});
        if(res.ok){ newData = await res.json(); break; }
      }catch(e){ /* try next */ }
    }
    if(!newData) return;

    const newHash = dataHash(newData);
    _lastRefreshTime = Date.now();
    updateLiveAgo();

    // Update "Last updated" timestamp
    const lu = $('lastUp');
    if(lu) lu.textContent = new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'});

    if(_lastDataHash && newHash !== _lastDataHash){
      // Data changed! Apply and notify
      applySiteData(newData);
      refreshSite();
      flashLiveBadge();
      showToast('New Data Loaded', 'The dashboard has been updated with the latest information.', '🔄');
    }
    _lastDataHash = newHash;
  }catch(err){
    // Silent fail — will retry next interval
  }
}

function startLiveRefresh(){
  // Set initial hash
  _lastDataHash = dataHash(currentSiteData());
  _lastRefreshTime = Date.now();
  updateLiveAgo();

  // Update "ago" every 30 seconds
  _liveAgoInterval = setInterval(updateLiveAgo, 30000);

  // Poll for data changes every 5 minutes
  setInterval(checkForUpdates, 5 * 60 * 1000);
}

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>{
  (async()=>{
    await loadSiteData();

    // Day badge
    const dayBadge=$('dayBadge');
    if(dayBadge) dayBadge.textContent=`Day ${dayNum()} of 365`;

    // Countdowns
    updateCD(); setInterval(updateCD,1000);

    // Particles
    initParticles();

    // Sections
    refreshSite();

    // Tickers
    const tW=$('tickW'),tY=$('tickY');
    if(tW) tW.textContent='0 — Registration Phase';
    if(tY) tY.textContent='0 — Registration Phase';

    // Nav
    setupNav();

    // Reveal
    initReveal();

    // Last updated
    const lu=$('lastUp');
    if(lu)lu.textContent=new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'});

    // 🔴 Start live refresh system
    startLiveRefresh();
  })();
});
