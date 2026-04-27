// ═══════════════════════════════════════════════════════════════
// TOEIC 題庫 — questions.js
// 所有模擬測驗與單項練習的題目資料
//
// 新增測驗步驟：
//   1. 在此加入 Q_P5_T0X、Q_P6_T0X、Q_P7_T0X
//   2. 在 test-0X.html 的 <script> 開頭加三行 alias
//   3. 將新題目 append 到 Q_P5_ALL、Q_P6_ALL、Q_P7_ALL
// ═══════════════════════════════════════════════════════════════

// ── 模擬測驗 第 01 回 ────────────────────────────────────────
const Q_P5_T01 = [
  // Q101-130 (index 0-29)
  { q:"The project manager requested that all team members ------- their progress reports by Friday.", opts:["submits","submit","submitted","submitting"], ans:1, exp:"After 'request that', the verb uses subjunctive mood (base form).", zh:"'request that' 後接假設語氣，動詞用原形，選 (B)。", trans:"專案經理要求所有團隊成員在週五前提交進度報告。" },
  { q:"The new employee quickly became ------- with the company's internal software system.", opts:["familiar","familiarly","familiarity","familiarize"], ans:0, exp:"'Became' is a linking verb; it takes an adjective. 'Familiar with' = comfortable knowing.", zh:"連綴動詞後接形容詞，'familiar with' 表熟悉，選 (A)。", trans:"新進員工很快就熟悉了公司的內部軟體系統。" },
  { q:"------- the budget cuts, the research team managed to complete the study on schedule.", opts:["Because of","Despite","Although","While"], ans:1, exp:"'Despite' is a preposition used before a noun phrase to show contrast.", zh:"'Despite' 為介系詞，後接名詞，表讓步對比，選 (B)。", trans:"儘管遭遇預算刪減，研究團隊仍設法按時完成了這項研究。" },
  { q:"Employees are encouraged to submit ------- suggestions for improving workplace safety.", opts:["construct","constructs","constructive","constructively"], ans:2, exp:"An adjective is needed before the noun 'suggestions'.", zh:"修飾名詞需形容詞，'constructive'（有建設性的），選 (C)。", trans:"員工被鼓勵提出有建設性的建議，以改善工作場所的安全。" },
  { q:"The annual conference will be held ------- the downtown convention center this November.", opts:["at","in","on","by"], ans:0, exp:"'At' is used with specific named venues and buildings.", zh:"特定建築物或場所前用 'at'，選 (A)。", trans:"年度會議將於今年十一月在市中心會議中心舉行。" },
  { q:"Sales figures for the third quarter were ------- higher than originally projected.", opts:["significance","significant","significantly","signify"], ans:2, exp:"An adverb modifies the comparative adjective 'higher'.", zh:"修飾形容詞比較級需副詞，選 (C) significantly。", trans:"第三季的銷售數字顯著高於原本的預測。" },
  { q:"The CEO announced the company would ------- its operations into three new Asian markets.", opts:["expand","expands","expanded","expansion"], ans:0, exp:"Modal 'would' is followed by the base form of the verb.", zh:"情態動詞 'would' 後接動詞原形，選 (A)。", trans:"執行長宣布公司將把業務擴展到三個新的亞洲市場。" },
  { q:"All applicants ------- submit a cover letter along with their resume to be considered.", opts:["should","must","can","might"], ans:1, exp:"'Must' expresses a strict mandatory requirement in official instructions.", zh:"'must' 語氣最強，表必要條件，選 (B)。", trans:"所有申請人必須隨履歷一併提交求職信，才能被列入考慮。" },
  { q:"The ------- of the new product exceeded management's expectations in design and functionality.", opts:["develop","developer","development","developing"], ans:2, exp:"A noun is needed as the subject of the sentence.", zh:"句子需名詞作主詞，'development'，選 (C)。", trans:"新產品的開發在設計和功能方面都超越了管理層的預期。" },
  { q:"Please contact our customer service department ------- you experience any difficulties.", opts:["if","unless","so that","even though"], ans:0, exp:"'If' introduces a conditional clause.", zh:"'if' 引導條件子句，選 (A)。", trans:"如果您遇到任何困難，請聯繫我們的客服部門。" },
  { q:"The marketing team worked ------- to ensure the product launch was a success.", opts:["tire","tireless","tirelessly","tirelessness"], ans:2, exp:"An adverb modifies the verb 'worked'.", zh:"修飾動詞需副詞，'tirelessly'（不倦地），選 (C)。", trans:"行銷團隊不懈努力，確保產品發布圓滿成功。" },
  { q:"The board of directors will meet ------- a week to review the company's financial performance.", opts:["once","one","every","each"], ans:0, exp:"'Once a week' is a fixed expression meaning one time per week.", zh:"'once a week' 為固定搭配，選 (A)。", trans:"董事會將每週召開一次會議，審查公司的財務狀況。" },
  { q:"The training seminar is ------- for all new hires in the sales and marketing departments.", opts:["mandate","mandatory","mandatorily","mandating"], ans:1, exp:"An adjective is needed after the linking verb 'is'.", zh:"連綴動詞後接形容詞，'mandatory'（強制的），選 (B)。", trans:"培訓研討會對銷售和行銷部門的所有新進員工為強制性。" },
  { q:"Ms. Tanaka was ------- for her outstanding contributions to the international marketing campaign.", opts:["recognize","recognition","recognized","recognizing"], ans:2, exp:"Passive voice: 'was + past participle'.", zh:"被動語態 'was + Vpp'，選 (C)。", trans:"田中女士因對國際行銷活動的傑出貢獻而獲得表彰。" },
  { q:"The report indicates that consumer confidence has risen ------- over the past six months.", opts:["steady","steadier","steadily","steadiness"], ans:2, exp:"An adverb modifies the verb 'risen'.", zh:"修飾動詞需副詞，'steadily'，選 (C)。", trans:"報告顯示，消費者信心在過去六個月中穩定上升。" },
  { q:"The company policy ------- employees from using personal devices during working hours.", opts:["prohibits","prohibitions","prohibitive","prohibit"], ans:0, exp:"Third-person singular subject requires verb + -s.", zh:"第三人稱單數主詞，動詞加 -s，選 (A)。", trans:"公司政策禁止員工在工作時間使用個人裝置。" },
  { q:"We are pleased to inform you that your application has been ------- reviewed by our hiring committee.", opts:["thorough","thoroughly","thoroughness","thoroughgoing"], ans:1, exp:"An adverb modifies the passive verb phrase.", zh:"修飾動詞片語需副詞，'thoroughly'，選 (B)。", trans:"我們很高興地通知您，您的申請已由本公司招聘委員會徹底審閱。" },
  { q:"The new facility will be large ------- to accommodate up to five hundred employees.", opts:["enough","too","very","so"], ans:0, exp:"'Adj + enough + to V' expresses sufficiency.", zh:"'adj + enough + to V' 句型，選 (A)。", trans:"新設施將足夠大，可容納多達五百名員工。" },
  { q:"The revised budget proposal must be submitted ------- Monday at the latest.", opts:["until","by","at","since"], ans:1, exp:"'By' with a deadline means 'no later than'.", zh:"'by' 表期限，「不遲於」，選 (B)。", trans:"修訂後的預算提案最遲必須在週一前提交。" },
  { q:"The ------- of the merger between the two companies is expected to create thousands of new jobs.", opts:["complete","completes","completing","completion"], ans:3, exp:"A noun is needed as the subject; 'completion of the merger' is a natural phrase.", zh:"需名詞作主詞，'completion'，選 (D)。", trans:"兩家公司完成合併後，預計將創造數千個新就業機會。" },
  { q:"The shipment will arrive ------- two weeks, depending on customs clearance.", opts:["within","during","among","between"], ans:0, exp:"'Within' indicates a time frame before a deadline.", zh:"'within' 表「在……之內」，選 (A)。", trans:"貨物將在兩週內到達，視清關情況而定。" },
  { q:"The supervisor asked the intern to make ------- copies of the financial report.", opts:["addition","additional","additionally","add"], ans:1, exp:"An adjective is needed before the noun 'copies'.", zh:"修飾名詞需形容詞，'additional'，選 (B)。", trans:"主管要求實習生多印幾份財務報告。" },
  { q:"The new software upgrade is ------- with all operating systems released after 2018.", opts:["compatible","compatibility","compatibly","compatibleness"], ans:0, exp:"Adjective needed after linking verb 'is'; 'compatible with' is a fixed phrase.", zh:"'is' 後接形容詞，'compatible with' 為固定搭配，選 (A)。", trans:"新的軟體升級與 2018 年後發布的所有作業系統相容。" },
  { q:"Customers who place orders before noon will ------- same-day delivery.", opts:["receive","receiving","received","to receive"], ans:0, exp:"'Will' is a modal followed by the base form.", zh:"情態動詞 'will' 後接原形，選 (A)。", trans:"在中午前下訂單的顧客將享有當日配送服務。" },
  { q:"The ------- renovations to the office building will be completed by the end of the quarter.", opts:["schedule","scheduled","scheduling","scheduler"], ans:1, exp:"Past participle 'scheduled' acts as an adjective modifying 'renovations'.", zh:"過去分詞作形容詞修飾名詞，'scheduled'，選 (B)。", trans:"辦公大樓的預定翻修工程將於本季末完成。" },
  { q:"Due to heavy traffic, the delivery truck arrived ------- than expected.", opts:["late","later","latest","lately"], ans:1, exp:"Comparative form 'later' follows 'than'.", zh:"'than' 前需比較級，'later'，選 (B)。", trans:"由於交通壅塞，送貨卡車比預期晚到。" },
  { q:"The company's new dress code policy applies to ------- full-time and part-time employees.", opts:["either","both","neither","each"], ans:1, exp:"'Both ... and ...' connects two items inclusively.", zh:"'both ... and ...' 表兩者皆是，選 (B)。", trans:"公司的新服裝規定適用於全職和兼職員工。" },
  { q:"Participants are asked to ------- their seats before the keynote speech begins.", opts:["find","finding","found","be find"], ans:0, exp:"After 'are asked to', the base form (infinitive) is used.", zh:"'asked to' 後接動詞原形，選 (A)。", trans:"與會者被要求在主題演講開始前就座。" },
  { q:"The manager was ------- by the quality of the intern's final report.", opts:["impress","impression","impressive","impressed"], ans:3, exp:"Passive adjective 'impressed' describes the manager's emotional state.", zh:"表情緒狀態用過去分詞，'impressed'，選 (D)。", trans:"經理對實習生最終報告的品質印象深刻。" },
  { q:"All ------- materials for the training workshop will be provided at no extra cost.", opts:["require","required","requirement","requiring"], ans:1, exp:"Past participle 'required' modifies the noun 'materials'.", zh:"過去分詞修飾名詞，'required'（所需的），選 (B)。", trans:"培訓工作坊所需的所有材料將免費提供。" }
];

const Q_P6_T01 = [
  {
    meta: "Questions 131–134: Email",
    text: `Dear Mr. Chen,\n\nI am writing to confirm your reservation at the Meridian Hotel for the nights of March 15–17. Your room will be [131] upon your arrival at 3:00 P.M. As requested, we have arranged a non-smoking room on the tenth floor with a city view.\n\nPlease note that our complimentary breakfast is [132] from 7:00 to 10:00 A.M. in the main dining area. Should you require early check-in, we kindly ask that you contact the front desk [133] advance so that we may accommodate your request.\n\n[134] any assistance prior to your visit, please do not hesitate to contact us directly.\n\nWarm regards,\nMeridian Hotel Guest Services`,
    qs: [
      { n:131, opts:["ready","readiness","readily","readying"], ans:0, exp:"'Be ready' is the correct predicate adjective after the linking verb 'will be'.", zh:"'will be' 後接形容詞，'ready'（已準備好），選 (A)。" },
      { n:132, opts:["serve","served","serving","service"], ans:1, exp:"Passive voice: breakfast 'is served' during specific hours.", zh:"早餐「被供應」用被動，'served'，選 (B)。" },
      { n:133, opts:["in","on","with","for"], ans:0, exp:"'In advance' is a fixed prepositional phrase meaning ahead of time.", zh:"'in advance' 為固定搭配，表提前，選 (A)。" },
      { n:134, opts:["If you need","Should you require","Requiring","You need"], ans:1, exp:"'Should + subject + verb' is a formal conditional inversion used in business writing.", zh:"'Should you require' 為正式倒裝條件句，選 (B)。" }
    ]
  },
  {
    meta: "Questions 135–138: Notice",
    text: `NOTICE TO ALL STAFF\n\nEffective Monday, April 7, the building management will [135] routine maintenance on the elevators in the north wing. As a result, these elevators will be [136] from 8:00 A.M. to 5:00 P.M. on weekdays for approximately two weeks.\n\nDuring this period, employees are encouraged to use the south wing elevators or the stairwells, which remain fully accessible. We apologize for any [137] this may cause. [138]\n\nThank you for your cooperation.\nBuilding Management`,
    qs: [
      { n:135, opts:["conduct","conducts","conducted","be conducting"], ans:0, exp:"'Will + base form' is the standard future tense construction.", zh:"'will' 後接原形動詞，選 (A)。" },
      { n:136, opts:["operational","unavailable","expanded","relocated"], ans:1, exp:"The context says maintenance will occur, so elevators will be 'unavailable'.", zh:"進行維護期間電梯「無法使用」，選 (B) unavailable。" },
      { n:137, opts:["convenient","inconvenience","convenience","inconveniently"], ans:1, exp:"A noun is needed after the possessive 'any'; 'inconvenience' fits the context.", zh:"'any' 後接名詞，不便之處用 'inconvenience'，選 (B)。" },
      { n:138, opts:["We look forward to serving you.","Your patience and understanding are greatly appreciated.","Please submit your complaints in writing.","The elevator will not return to service."], ans:1, exp:"A closing sentence thanking people for patience fits the apology context.", zh:"結尾感謝耐心配合，語意最自然，選 (B)。" }
    ]
  },
  {
    meta: "Questions 139–142: Memorandum",
    text: `MEMORANDUM\n\nTo: All Department Heads\nFrom: Human Resources\nRe: Annual Performance Review Schedule\n\nThis memo is to inform you that the annual performance review cycle will begin on May 1. All department heads are [139] to submit completed evaluation forms for each of their direct reports no later than May 31.\n\nThe forms are available for download on the company intranet. Please ensure that evaluations are [140] and objective, focusing on measurable achievements and areas for professional growth. Reviews that are [141] incomplete or improperly completed will be returned for revision.\n\n[142] questions about the process, please contact the HR department at extension 204.\n\nThank you.`,
    qs: [
      { n:139, opts:["requested","requesting","request","to request"], ans:0, exp:"'Are requested to' is a formal passive construction meaning 'are asked to'.", zh:"'are requested to' 為正式被動，表要求，選 (A)。" },
      { n:140, opts:["thorough","thoroughly","thoroughness","thoroughfare"], ans:0, exp:"Two adjectives joined by 'and' are needed: 'thorough and objective'.", zh:"與 'objective' 並列需形容詞，'thorough'，選 (A)。" },
      { n:141, opts:["considered","determined","deemed","found"], ans:2, exp:"'Deemed' means 'judged to be'; it collocates naturally with 'incomplete'.", zh:"'deemed' 表判定為，搭配 'incomplete' 最自然，選 (C)。" },
      { n:142, opts:["For","About","Regarding","Should you have"], ans:3, exp:"'Should you have questions' is a formal conditional inversion appropriate for memos.", zh:"正式備忘錄常用 'Should you have...' 倒裝條件句，選 (D)。" }
    ]
  },
  {
    meta: "Questions 143–146: Advertisement",
    text: `GREENLEAF CORPORATE CATERING\nFresh · Flexible · Reliable\n\nIs your office [143] the right catering partner? Look no further than Greenleaf Corporate Catering, your trusted provider of healthy, delicious meals for business events of all sizes.\n\nWe offer fully customizable menus [144] a variety of dietary requirements, including vegetarian, vegan, and gluten-free options. Whether you are planning a team lunch, a board meeting, or a company-wide celebration, our professional staff will ensure your event runs [145].\n\nContact us today to receive a complimentary quote. [146] orders placed at least 72 hours in advance will qualify for our early-booking discount of 10%.\n\nVisit us at www.greenleafcatering.com`,
    qs: [
      { n:143, opts:["searching for","searched","in search","to search"], ans:0, exp:"'Is your office searching for...' is the natural progressive form for a question.", zh:"疑問句用進行式，'searching for'，選 (A)。" },
      { n:144, opts:["catered to","accommodating","satisfying","meeting"], ans:1, exp:"'Accommodating a variety of dietary requirements' means catering to different dietary needs.", zh:"'accommodating' 表顧及各種需求，搭配最自然，選 (B)。" },
      { n:145, opts:["smooth","smoothly","smoothness","smoother"], ans:1, exp:"An adverb modifies the verb 'runs'.", zh:"修飾動詞 'runs' 需副詞，'smoothly'，選 (B)。" },
      { n:146, opts:["All","Any","Every","Each"], ans:0, exp:"'All orders' refers collectively to the entire category of orders meeting the condition.", zh:"'All orders' 指所有符合條件的訂單，選 (A)。" }
    ]
  }
];

const Q_P7_T01 = [
  // ── SINGLE PASSAGES ──
  {
    type: "single",
    meta: "Questions 147–148: E-mail",
    passage: `<div class="doc-label">E-mail</div>
<p><strong>From:</strong> j.harris@veritastech.com<br><strong>To:</strong> allstaff@veritastech.com<br><strong>Subject:</strong> Office Closure — Public Holiday<br><strong>Date:</strong> Thursday, April 3</p>
<p>Dear Team,</p>
<p>This is a reminder that the office will be closed on Monday, April 7, in observance of the national public holiday. Normal business hours will resume on Tuesday, April 8.</p>
<p>If you have any urgent matters that require attention during the closure, please contact the on-call support team at support@veritastech.com. Response times may be longer than usual.</p>
<p>Enjoy the long weekend!</p>
<p>Best,<br>Janet Harris<br>Office Manager, Veritas Technology</p>`,
    qs: [
      { n:147, q:"Why was the e-mail sent?", opts:["To announce a new support policy","To inform staff of an office closure","To introduce a new office manager","To reschedule a team meeting"], ans:1, exp:"The e-mail clearly states the office will be closed on April 7.", zh:"郵件主旨為告知辦公室關閉，選 (B)。" },
      { n:148, q:"What are employees told to do for urgent matters?", opts:["Call Janet Harris directly","Submit a written request","E-mail the on-call support team","Wait until Tuesday"], ans:2, exp:"The e-mail says to contact the on-call support team at support@veritastech.com.", zh:"郵件指示聯繫 on-call 支援小組，選 (C)。" }
    ]
  },
  {
    type: "single",
    meta: "Questions 149–151: Notice",
    passage: `<div class="doc-label">Notice</div>
<h4>CITY LIBRARY — SUMMER READING PROGRAM</h4>
<p>The City Library is pleased to announce the launch of its annual Summer Reading Program, running from June 1 to August 31. This year's theme is <em>"Explore the World Through Books."</em></p>
<p>Participants of all ages are welcome. Children aged 5–12 who complete at least eight books during the program period will receive a Certificate of Achievement. Adults who log 15 or more books will be entered into a prize draw for a $200 gift card to a local bookstore.</p>
<p>To register, visit the front desk or sign up online at www.citylibrary.org/summer. Registration is free of charge. The program begins June 1; registration closes May 25.</p>`,
    qs: [
      { n:149, q:"What is the theme of this year's Summer Reading Program?", opts:["Discovering Local Heroes","Explore the World Through Books","Science and Technology","Celebrating Community Stories"], ans:1, exp:"The notice states the theme is 'Explore the World Through Books'.", zh:"公告明確指出主題，選 (B)。" },
      { n:150, q:"What will children who complete at least eight books receive?", opts:["A gift card","A free library membership","A Certificate of Achievement","A prize draw entry"], ans:2, exp:"Children aged 5-12 completing eight books receive a Certificate of Achievement.", zh:"8本以上獲頒成就證書，選 (C)。" },
      { n:151, q:"When is the deadline for registration?", opts:["June 1","August 31","May 25","July 1"], ans:2, exp:"Registration closes May 25.", zh:"報名截止 5 月 25 日，選 (C)。" }
    ]
  },
  {
    type: "single",
    meta: "Questions 152–154: Article",
    passage: `<div class="doc-label">Business News</div>
<h4>NEXWAVE COMMUNICATIONS EXPANDS INTO SOUTHEAST ASIA</h4>
<p>NexWave Communications, a leading provider of cloud-based business software, announced on Tuesday that it will open regional offices in Singapore and Jakarta by the end of the year. The expansion is part of the company's five-year growth strategy aimed at capturing a larger share of the rapidly developing Southeast Asian market.</p>
<p>CEO Maria Delgado stated in a press release that the company plans to hire approximately 200 local employees across both locations. "Southeast Asia represents an enormous growth opportunity," said Delgado. "We are committed to hiring local talent and building solutions tailored to regional needs."</p>
<p>NexWave currently operates in 14 countries and reported annual revenues of $1.2 billion last year.</p>`,
    qs: [
      { n:152, q:"What did NexWave Communications announce?", opts:["A new software product launch","Quarterly revenue results","Plans to open offices in Southeast Asia","A merger with a competitor"], ans:2, exp:"The article states NexWave will open offices in Singapore and Jakarta.", zh:"宣布將在東南亞開設辦事處，選 (C)。" },
      { n:153, q:"According to the CEO, what is one of NexWave's goals?", opts:["Reducing operational costs","Hiring local talent","Acquiring a local company","Relocating its headquarters"], ans:1, exp:"Delgado says they are 'committed to hiring local talent'.", zh:"CEO 表示致力於雇用當地人才，選 (B)。" },
      { n:154, q:"How many countries does NexWave currently operate in?", opts:["2","8","14","20"], ans:2, exp:"The article states NexWave currently operates in 14 countries.", zh:"文中明確指出 14 個國家，選 (C)。" }
    ]
  },
  {
    type: "single",
    meta: "Questions 155–157: Advertisement",
    passage: `<div class="doc-label">Advertisement</div>
<h4>PROLINK BUSINESS TRAVEL — CORPORATE SOLUTIONS</h4>
<p>Managing business travel for your team shouldn't be complicated. ProLink Business Travel offers a complete suite of corporate travel management services, including flight and hotel booking, expense reporting tools, and 24/7 customer support.</p>
<p><strong>Why choose ProLink?</strong></p>
<p>✔ Negotiated rates with over 200 airlines and 5,000 hotels worldwide<br>
✔ Centralized billing for simplified accounting<br>
✔ Dedicated account managers for companies with 50+ employees<br>
✔ Mobile app for on-the-go booking and itinerary management</p>
<p>Sign up before May 31 and receive three months of premium service at no charge. Call 1-800-PROLINK or visit prolink-travel.com to request a free consultation.</p>`,
    qs: [
      { n:155, q:"What service does ProLink NOT explicitly mention?", opts:["Flight and hotel booking","Visa application assistance","Expense reporting tools","24/7 customer support"], ans:1, exp:"Visa assistance is not mentioned in the advertisement.", zh:"廣告中未提及簽證申請服務，選 (B)。" },
      { n:156, q:"What do companies with 50 or more employees receive?", opts:["A discount on all bookings","A free mobile app","A dedicated account manager","Centralized billing"], ans:2, exp:"The ad states dedicated account managers are for companies with 50+ employees.", zh:"50人以上企業有專屬客戶經理，選 (C)。" },
      { n:157, q:"What is offered to companies that sign up before May 31?", opts:["A free consultation only","Three months of free premium service","A 10% booking discount","A complimentary business trip"], ans:1, exp:"Sign up before May 31 to receive three months of premium service at no charge.", zh:"5月31日前加入可免費享三個月高級服務，選 (B)。" }
    ]
  },
  {
    type: "single",
    meta: "Questions 158–160: Letter",
    passage: `<div class="doc-label">Letter</div>
<p><strong>March 28</strong></p>
<p>Ms. Anya Roth<br>Director of Procurement<br>Hartfield Manufacturing Co.<br>44 Industrial Drive<br>Portland, OR 97201</p>
<p>Dear Ms. Roth,</p>
<p>Thank you for your recent inquiry regarding our industrial packaging solutions. We are pleased to offer you a 15% volume discount on orders exceeding 500 units per month, valid for a 12-month contract period.</p>
<p>Enclosed please find our updated product catalog and price list. We would be delighted to schedule a product demonstration at your facility at a time that is convenient for you.</p>
<p>We look forward to the possibility of a long-term partnership with Hartfield Manufacturing. Please feel free to reach me directly at (503) 555-0192.</p>
<p>Sincerely,<br>David Park<br>Regional Sales Manager<br>Summit Packaging Inc.</p>`,
    qs: [
      { n:158, q:"What is the main purpose of this letter?", opts:["To request payment for an overdue invoice","To respond to an inquiry with a business offer","To confirm a product shipment","To announce a price increase"], ans:1, exp:"The letter responds to an inquiry and offers a discount.", zh:"此信回覆詢問並提出優惠方案，選 (B)。" },
      { n:159, q:"What discount is being offered to Hartfield Manufacturing?", opts:["10% on all orders","15% for orders over 500 units per month","20% for a two-year contract","5% for early payment"], ans:1, exp:"A 15% volume discount for orders exceeding 500 units/month.", zh:"每月超過 500 件享 15% 折扣，選 (B)。" },
      { n:160, q:"What has David Park included with the letter?", opts:["A signed contract","A sample product","A product catalog and price list","A purchase order form"], ans:2, exp:"The letter says 'Enclosed please find our updated product catalog and price list'.", zh:"隨信附上產品目錄與價格表，選 (C)。" }
    ]
  },
  {
    type: "single",
    meta: "Questions 161–163: Online Posting",
    passage: `<div class="doc-label">Online Review</div>
<h4>TechZone Electronics — Customer Review</h4>
<p><strong>★★★★☆ &nbsp; Great product, slow shipping</strong><br>Reviewed by: K. Yamamoto &nbsp;·&nbsp; Verified Purchase</p>
<p>I purchased the ProSound X3 wireless headphones last month and have been very impressed with the sound quality and noise-canceling performance. The battery life is excellent — I get about 30 hours per charge, which is even better than advertised.</p>
<p>My only complaint is that the headphones took 12 business days to arrive, even though I paid for standard 5-7 day shipping. When I contacted customer service, they were polite but explained the delay was due to a warehouse backlog. I was offered a $10 store credit as compensation, which I appreciated, although I would have preferred faster resolution.</p>
<p>Overall, a great product that I would recommend to others, but be prepared for possible shipping delays.</p>`,
    qs: [
      { n:161, q:"What does K. Yamamoto praise about the headphones?", opts:["The design and color options","The sound quality and battery life","The affordable price","The fast delivery"], ans:1, exp:"The reviewer praises sound quality, noise-canceling, and battery life.", zh:"評論讚揚音質和電池續航力，選 (B)。" },
      { n:162, q:"What was the cause of the shipping delay?", opts:["A lost package","A customs issue","A warehouse backlog","An incorrect address"], ans:2, exp:"Customer service explained the delay was due to a warehouse backlog.", zh:"客服解釋延遲原因是倉庫積壓，選 (C)。" },
      { n:163, q:"What compensation did the customer receive?", opts:["A full refund","A replacement product","Free expedited shipping","A $10 store credit"], ans:3, exp:"The customer was offered a $10 store credit as compensation.", zh:"收到 10 美元商店積分作為補償，選 (D)。" }
    ]
  },
  {
    type: "single",
    meta: "Questions 164–167: Memo",
    passage: `<div class="doc-label">Internal Memo</div>
<p><strong>To:</strong> All Staff<br><strong>From:</strong> IT Department<br><strong>Date:</strong> April 1<br><strong>Re:</strong> Mandatory System Update — Action Required</p>
<p>The IT department will be performing a critical security update to all company computers this weekend. The update will be applied automatically on Saturday evening between 10:00 P.M. and 3:00 A.M.</p>
<p>To ensure the update completes successfully, all employees must leave their computers powered on and connected to the company network before leaving the office on Friday afternoon. Laptops taken home should be left connected to power and Wi-Fi.</p>
<p>After the update, you may notice that the login screen has a slightly different appearance. Your username and password will remain unchanged. If you experience any technical issues following the update, please contact the IT help desk at extension 301 or helpdesk@company.com.</p>
<p>Thank you for your cooperation.</p>`,
    qs: [
      { n:164, q:"What is the purpose of this memo?", opts:["To announce a new company policy","To notify staff of a mandatory IT update","To introduce new login credentials","To schedule a system shutdown"], ans:1, exp:"The memo informs staff about a mandatory security update.", zh:"備忘錄通知員工進行強制安全更新，選 (B)。" },
      { n:165, q:"What must employees do before leaving on Friday?", opts:["Back up all their files","Log out of all applications","Leave computers on and connected to the network","Submit a support request"], ans:2, exp:"Staff must leave computers powered on and connected to the company network.", zh:"員工須讓電腦保持開機並連接公司網路，選 (C)。" },
      { n:166, q:"What will change after the update?", opts:["Login credentials","The login screen appearance","The company's Wi-Fi password","The company email system"], ans:1, exp:"The memo notes the login screen may have a slightly different appearance.", zh:"登入畫面外觀可能略有不同，選 (B)。" },
      { n:167, q:"Who should employees contact if they have problems after the update?", opts:["Their direct supervisor","The HR department","The IT help desk","The building manager"], ans:2, exp:"Contact the IT help desk at extension 301 or helpdesk@company.com.", zh:"聯繫 IT 服務台，選 (C)。" }
    ]
  },
  {
    type: "single",
    meta: "Questions 168–171: Article",
    passage: `<div class="doc-label">Industry News</div>
<h4>FLEXIBLE WORK POLICIES BECOME STANDARD ACROSS INDUSTRIES</h4>
<p>A new report by workforce consultancy Talentrix has found that 74% of companies surveyed now offer some form of flexible work arrangement, up from 48% just five years ago. The shift reflects growing recognition among employers that flexibility is a key factor in attracting and retaining top talent.</p>
<p>The most commonly offered arrangements include remote work options, flexible start and end times, and compressed workweeks. According to the report, employees who have access to flexible arrangements report higher job satisfaction and lower rates of burnout compared to those who do not.</p>
<p>However, the report also notes several challenges. Managers cite difficulties in monitoring productivity and maintaining team cohesion as the most common concerns. Companies that invested in collaboration tools and set clear performance metrics were more successful in managing distributed teams.</p>
<p>Talentrix recommends that companies develop formal flexible work policies and train managers to lead remote teams effectively.</p>`,
    qs: [
      { n:168, q:"What does the Talentrix report primarily focus on?", opts:["Remote work productivity tools","The growth of flexible work arrangements","Employee burnout statistics","Salary trends in tech industries"], ans:1, exp:"The report focuses on flexible work arrangements and their prevalence.", zh:"報告主要探討彈性工作安排的普及，選 (B)。" },
      { n:169, q:"What percentage of companies surveyed now offer flexible work?", opts:["48%","62%","74%","83%"], ans:2, exp:"The report states 74% of companies now offer flexible work arrangements.", zh:"報告指出 74% 的企業提供彈性工作安排，選 (C)。" },
      { n:170, q:"According to the report, what do employees with flexible arrangements report?", opts:["Higher salaries","More opportunities for promotion","Higher job satisfaction","Fewer collaboration challenges"], ans:2, exp:"Employees with flexible arrangements report higher job satisfaction and lower burnout.", zh:"員工回報更高的工作滿意度，選 (C)。" },
      { n:171, q:"What does Talentrix recommend for companies?", opts:["Eliminating all remote work policies","Developing formal flexible work policies","Reducing the number of remote employees","Investing only in office renovations"], ans:1, exp:"Talentrix recommends companies develop formal flexible work policies.", zh:"Talentrix 建議公司制定正式的彈性工作政策，選 (B)。" }
    ]
  },
  {
    type: "single",
    meta: "Questions 172–175: Schedule",
    passage: `<div class="doc-label">Conference Schedule</div>
<h4>INNOVATE 2026 — TECHNOLOGY LEADERSHIP SUMMIT</h4>
<p><strong>Day 1 — Thursday, May 8</strong></p>
<p>8:30 A.M. &nbsp; Registration & Welcome Coffee — Lobby<br>
9:00 A.M. &nbsp; Opening Keynote: "The Future of AI in Business" — Grand Hall A<br>
11:00 A.M. &nbsp; Panel Discussion: Digital Transformation Strategies — Room 204<br>
1:00 P.M. &nbsp; Lunch Break — Terrace Restaurant<br>
2:30 P.M. &nbsp; Workshop: Cybersecurity Best Practices — Room 109<br>
4:00 P.M. &nbsp; Networking Session — Exhibition Hall<br>
6:30 P.M. &nbsp; Welcome Dinner (by invitation only) — Rooftop Terrace</p>
<p><em>Note: All sessions are included in the standard registration fee except the Welcome Dinner, which requires a separate ticket. Seats are limited.</em></p>`,
    qs: [
      { n:172, q:"Where will the opening keynote be held?", opts:["Room 204","Room 109","Grand Hall A","Exhibition Hall"], ans:2, exp:"The schedule lists the Opening Keynote in Grand Hall A.", zh:"開幕主題演講在 Grand Hall A，選 (C)。" },
      { n:173, q:"What is the topic of the 2:30 P.M. workshop?", opts:["Digital Transformation","AI in Business","Cybersecurity Best Practices","Networking Strategies"], ans:2, exp:"The 2:30 P.M. workshop is on Cybersecurity Best Practices.", zh:"下午 2:30 的工作坊主題為網絡安全最佳實踐，選 (C)。" },
      { n:174, q:"What is NOT included in the standard registration fee?", opts:["The panel discussion","The networking session","The workshop","The welcome dinner"], ans:3, exp:"The note states the Welcome Dinner requires a separate ticket.", zh:"歡迎晚宴需另購門票，不含在標準報名費中，選 (D)。" },
      { n:175, q:"What is indicated about the welcome dinner?", opts:["It is free for all attendees","It is held in Room 204","Seats are limited","It starts at 7:00 P.M."], ans:2, exp:"The note says 'Seats are limited'.", zh:"注意事項指出座位有限，選 (C)。" }
    ]
  },
  {
    type: "single",
    meta: "Questions 176–180: Report Extract",
    passage: `<div class="doc-label">Quarterly Report — Extract</div>
<h4>BLOOMFIELD RETAIL GROUP — Q1 PERFORMANCE SUMMARY</h4>
<p>Bloomfield Retail Group reported total revenues of $84.7 million for the first quarter of the year, representing a 12% increase compared to the same period last year. The growth was primarily driven by strong performance in the company's online sales division, which grew 34% year-over-year and now accounts for 41% of total revenue.</p>
<p>In contrast, in-store sales declined by 3% due to reduced foot traffic at several flagship locations. The company has attributed this decline to ongoing construction near two of its highest-revenue stores in the downtown district.</p>
<p>The company plans to invest $15 million in logistics infrastructure over the next 18 months to support continued e-commerce growth. CEO Thomas Bloom stated, "We are confident that our digital-first strategy positions us well for sustainable long-term growth."</p>
<p>Bloomfield expects Q2 revenues to reach between $88 million and $92 million.</p>`,
    qs: [
      { n:176, q:"What was Bloomfield's total Q1 revenue?", opts:["$74.7 million","$84.7 million","$88 million","$92 million"], ans:1, exp:"The report states total revenues of $84.7 million for Q1.", zh:"Q1 總營收為 8,470 萬美元，選 (B)。" },
      { n:177, q:"What percentage of total revenue comes from online sales?", opts:["12%","34%","41%","3%"], ans:2, exp:"Online sales now account for 41% of total revenue.", zh:"線上銷售佔總營收 41%，選 (C)。" },
      { n:178, q:"Why did in-store sales decline?", opts:["Poor product selection","Price competition from rivals","Construction near flagship stores","A decrease in marketing spending"], ans:2, exp:"The decline is attributed to construction near two high-revenue downtown stores.", zh:"市中心兩家旗艦店附近施工導致客流量減少，選 (C)。" },
      { n:179, q:"What investment does Bloomfield plan to make?", opts:["$84.7 million in store renovations","$15 million in logistics infrastructure","$34 million in digital marketing","$12 million in new store openings"], ans:1, exp:"Bloomfield plans to invest $15 million in logistics infrastructure.", zh:"計畫投資 1,500 萬美元於物流基礎設施，選 (B)。" },
      { n:180, q:"What are the expected Q2 revenues?", opts:["$80–84 million","$84–88 million","$88–92 million","Over $100 million"], ans:2, exp:"The company expects Q2 revenues between $88 and $92 million.", zh:"Q2 預期營收 8,800 至 9,200 萬美元，選 (C)。" }
    ]
  },
  // ── DOUBLE PASSAGES ──
  {
    type: "double",
    meta: "Questions 181–185: Job Posting + Cover Letter",
    passages: [
      { label: "Job Posting", content: `<div class="doc-label">Job Posting</div>
<h4>MARKETING COORDINATOR — FULL TIME</h4>
<p><strong>Company:</strong> BrightPath Media<br><strong>Location:</strong> Chicago, IL (Hybrid — 3 days in office)</p>
<p>BrightPath Media is seeking a creative and organized Marketing Coordinator to join our growing team. The ideal candidate will have at least two years of experience in digital marketing, excellent written communication skills, and proficiency in social media management tools.</p>
<p><strong>Responsibilities include:</strong><br>
• Assisting in the development of marketing campaigns<br>
• Managing company social media accounts<br>
• Coordinating with external vendors and agencies<br>
• Preparing weekly performance reports</p>
<p><strong>Salary range:</strong> $48,000–$58,000 per year, depending on experience.<br>
<strong>Application deadline:</strong> April 20. Send resume and cover letter to careers@brightpathmedia.com</p>` },
      { label: "Cover Letter", content: `<div class="doc-label">Cover Letter</div>
<p>April 14</p>
<p>Hiring Manager<br>BrightPath Media</p>
<p>Dear Hiring Manager,</p>
<p>I am writing to apply for the Marketing Coordinator position advertised on your website. I hold a Bachelor's degree in Communications and have three years of experience managing digital marketing campaigns for a mid-size retail company.</p>
<p>In my current role, I oversee our social media presence across five platforms and regularly prepare detailed analytics reports for senior management. I am proficient in Hootsuite, Sprout Social, and Google Analytics.</p>
<p>I am particularly excited about this opportunity because of BrightPath's reputation for innovative storytelling and client-focused campaigns. I believe my skills and enthusiasm align closely with your team's needs.</p>
<p>I have attached my resume and look forward to the opportunity to discuss my qualifications further.</p>
<p>Sincerely,<br>Priya Mehta</p>` }
    ],
    qs: [
      { n:181, q:"What type of work arrangement does BrightPath Media offer?", opts:["Fully remote","Fully in-office","Hybrid","Contract only"], ans:2, exp:"The job posting specifies 'Hybrid — 3 days in office'.", zh:"職位說明指明為混合辦公模式，選 (C)。" },
      { n:182, q:"What is the minimum experience required for the position?", opts:["One year","Two years","Three years","Five years"], ans:1, exp:"The posting requires 'at least two years of experience in digital marketing'.", zh:"要求至少兩年數位行銷經驗，選 (B)。" },
      { n:183, q:"How does Priya Mehta exceed the experience requirement?", opts:["She has a graduate degree","She has three years of experience","She has managed a team of 10 people","She has worked at a media company before"], ans:1, exp:"Priya has three years of experience, exceeding the required two years.", zh:"Priya 有三年經驗，超過所需的兩年，選 (B)。" },
      { n:184, q:"Which tool mentioned in the job posting does Priya confirm she is proficient in?", opts:["Adobe Creative Suite","Salesforce","Google Analytics","Microsoft Teams"], ans:2, exp:"The job posting mentions social media management tools; Priya mentions Google Analytics, which fits.", zh:"Priya 提及 Google Analytics，符合職缺要求，選 (C)。" },
      { n:185, q:"By what date must applications be submitted?", opts:["April 1","April 14","April 20","April 30"], ans:2, exp:"The application deadline is April 20.", zh:"申請截止日為 4 月 20 日，選 (C)。" }
    ]
  },
  {
    type: "double",
    meta: "Questions 186–190: Product Review + Company Response",
    passages: [
      { label: "Customer Review", content: `<div class="doc-label">Online Review — AquaPure Water Purifier</div>
<p><strong>★★★☆☆ &nbsp; Works well, but filter cost is high</strong><br>Posted by: T. Bergmann</p>
<p>I purchased the AquaPure Model 5 water purifier six months ago and have been mostly satisfied with its performance. The water quality is noticeably better, and the machine is quiet and easy to use. Setup took about 20 minutes and required no special tools.</p>
<p>My main concern is the cost of replacement filters. At $45 per filter with a recommended replacement every two months, the annual maintenance cost comes to $270. This was not clearly communicated at the point of purchase. I feel the total cost of ownership should be more prominently displayed on the product packaging.</p>
<p>I would still recommend this product for those who prioritize water quality, but buyers should be aware of the ongoing maintenance costs.</p>` },
      { label: "Company Response", content: `<div class="doc-label">Response from AquaPure Customer Service</div>
<p>Dear T. Bergmann,</p>
<p>Thank you for taking the time to share your feedback. We are glad to hear you are satisfied with the purification performance of the Model 5.</p>
<p>We appreciate your suggestion regarding filter cost transparency. We have shared your comments with our product packaging team, and we are in the process of updating our packaging to more clearly display the estimated annual maintenance costs.</p>
<p>As a token of appreciation for your feedback, we would like to offer you two complimentary replacement filters, which will be shipped to your registered address within 5–7 business days.</p>
<p>We value your continued support and hope this gesture demonstrates our commitment to customer satisfaction.</p>
<p>Best regards,<br>AquaPure Customer Care Team</p>` }
    ],
    qs: [
      { n:186, q:"What does T. Bergmann say about the product setup?", opts:["It required professional installation","It took about 20 minutes with no special tools","It was confusing and took several hours","It required a phone call to support"], ans:1, exp:"The reviewer says setup took about 20 minutes and required no special tools.", zh:"評論者說安裝約需 20 分鐘且不需專業工具，選 (B)。" },
      { n:187, q:"What is T. Bergmann's main complaint?", opts:["The water quality is poor","The machine is too noisy","The replacement filter cost was not clearly communicated","The setup instructions were unclear"], ans:2, exp:"The main complaint is the high filter cost was not clearly communicated before purchase.", zh:"主要投訴是濾芯費用事先未清楚告知，選 (C)。" },
      { n:188, q:"According to T. Bergmann, how much does annual filter maintenance cost?", opts:["$45","$90","$180","$270"], ans:3, exp:"$45 per filter × 6 filters per year (every 2 months) = $270.", zh:"每 2 個月換一次，每年 6 次 × $45 = $270，選 (D)。" },
      { n:189, q:"What action is AquaPure taking in response to the feedback?", opts:["Lowering the price of replacement filters","Offering a full refund","Updating packaging to display maintenance costs","Recalling the Model 5"], ans:2, exp:"AquaPure is updating packaging to more clearly display annual maintenance costs.", zh:"AquaPure 正在更新包裝以更清楚顯示年度維護費用，選 (C)。" },
      { n:190, q:"What will T. Bergmann receive from AquaPure?", opts:["A full refund","A $45 discount coupon","Two complimentary replacement filters","A free upgraded model"], ans:2, exp:"AquaPure is sending two complimentary replacement filters.", zh:"AquaPure 將寄送兩個免費替換濾芯，選 (C)。" }
    ]
  },
  // ── TRIPLE PASSAGE ──
  {
    type: "triple",
    meta: "Questions 191–195: E-mail + Policy + Form",
    passages: [
      { label: "E-mail", content: `<div class="doc-label">E-mail</div>
<p><strong>From:</strong> sarah.wong@deltalogistics.com<br><strong>To:</strong> hr@deltalogistics.com<br><strong>Subject:</strong> Professional Development Request</p>
<p>Hi,</p>
<p>I would like to apply for the company's professional development fund to attend the Supply Chain Management Conference in Boston from June 10–12. The registration fee is $650, and I estimate travel and accommodation costs to be approximately $800.</p>
<p>I believe this conference will directly enhance my skills in demand forecasting and inventory optimization, which align with our current team goals. Please let me know what I need to submit for approval.</p>
<p>Thanks,<br>Sarah Wong, Logistics Analyst</p>` },
      { label: "Policy", content: `<div class="doc-label">Company Policy — Professional Development Fund</div>
<p><strong>Eligibility:</strong> Full-time employees who have completed at least one year of service.</p>
<p><strong>Annual Limit:</strong> Up to $1,500 per employee per fiscal year.</p>
<p><strong>Covered Expenses:</strong> Conference registration, travel, and accommodation directly related to professional development activities.</p>
<p><strong>Approval Process:</strong> Employees must submit a completed PD Request Form along with supporting documentation (event registration confirmation, cost estimates) to HR at least 30 days before the event.</p>
<p><strong>Reimbursement:</strong> Expenses are reimbursed within 15 business days following submission of receipts after the event.</p>` },
      { label: "Form Excerpt", content: `<div class="doc-label">PD Request Form — Excerpt</div>
<p><strong>Employee Name:</strong> Sarah Wong<br><strong>Department:</strong> Logistics<br><strong>Event Name:</strong> Supply Chain Management Conference<br><strong>Event Dates:</strong> June 10–12<br><strong>Location:</strong> Boston, MA<br><strong>Total Estimated Cost:</strong> $1,450<br><strong>Submission Date:</strong> May 5</p>` }
    ],
    qs: [
      { n:191, q:"Why is Sarah Wong contacting the HR department?", opts:["To request a salary review","To apply for professional development funding","To report a workplace issue","To request a schedule change"], ans:1, exp:"Sarah is applying for the professional development fund to attend a conference.", zh:"Sarah 申請專業發展基金參加研討會，選 (B)。" },
      { n:192, q:"What is the maximum amount Sarah can receive under the policy?", opts:["$650","$800","$1,450","$1,500"], ans:3, exp:"The policy states the annual limit is up to $1,500 per employee.", zh:"政策規定每名員工每年最多 1,500 美元，選 (D)。" },
      { n:193, q:"How far in advance must a PD Request Form be submitted?", opts:["7 days","14 days","30 days","60 days"], ans:2, exp:"The policy requires submission at least 30 days before the event.", zh:"需在活動前至少 30 天提交，選 (C)。" },
      { n:194, q:"Based on the form, does Sarah's request satisfy the advance submission requirement?", opts:["Yes, it was submitted more than 30 days before the event","No, it was submitted fewer than 30 days before the event","Yes, but only because of a special exception","The information is not provided"], ans:0, exp:"The event is June 10, and the submission date is May 5 — which is 36 days before the event.", zh:"5月5日提交，距6月10日有36天，超過30天要求，選 (A)。" },
      { n:195, q:"What will Sarah need to do after the conference to receive reimbursement?", opts:["Submit a new request form","Submit receipts and wait up to 15 business days","Request a direct bank transfer","Provide a written report on the conference"], ans:1, exp:"The policy states expenses are reimbursed within 15 business days after submitting receipts.", zh:"活動後提交收據，15個工作日內報帳，選 (B)。" }
    ]
  },
  {
    type: "triple",
    meta: "Questions 196–200: Notice + Survey + E-mail",
    passages: [
      { label: "Notice", content: `<div class="doc-label">Notice</div>
<h4>STAFF CAFETERIA — UPCOMING CHANGES</h4>
<p>Following feedback collected over the past quarter, the Operations team has worked with FreshServe Catering to redesign the staff cafeteria menu. Starting Monday, May 12, the cafeteria will introduce a new menu featuring expanded vegetarian and vegan options, a daily hot meal rotation, and a new grab-and-go section for employees with limited lunch breaks.</p>
<p>Operating hours will be extended to 7:30 A.M.–4:00 P.M. (previously 8:00 A.M.–3:00 P.M.). Prices will remain unchanged.</p>` },
      { label: "Survey Results", content: `<div class="doc-label">Staff Survey Summary — Cafeteria Feedback</div>
<p><strong>Survey period:</strong> January–March<br><strong>Responses received:</strong> 142</p>
<p><strong>Top requests:</strong><br>
1. More vegetarian/vegan options — 78%<br>
2. Extended operating hours — 65%<br>
3. Faster service / grab-and-go options — 54%<br>
4. Lower prices — 48%<br>
5. More international cuisine — 41%</p>` },
      { label: "E-mail", content: `<div class="doc-label">E-mail</div>
<p><strong>From:</strong> m.russo@company.com<br><strong>To:</strong> operations@company.com<br><strong>Subject:</strong> Cafeteria Changes — Question</p>
<p>Hi Operations Team,</p>
<p>Thanks for the notice about the cafeteria updates — very welcome news! I just wanted to confirm: will the new grab-and-go section be ready from day one on May 12, or will it be introduced later?</p>
<p>Also, I noticed that lower prices was a top request from the survey. Was there a reason prices weren't adjusted?</p>
<p>Thanks,<br>Marco Russo</p>` }
    ],
    qs: [
      { n:196, q:"What is one change to the cafeteria's operating hours?", opts:["It will now open 30 minutes earlier","It will close one hour later","It will be closed on Fridays","It will only serve lunch"], ans:0, exp:"Hours extended from 8:00 A.M. to 7:30 A.M. — opening 30 minutes earlier.", zh:"開放時間從早上 8:00 提前至 7:30，提早 30 分鐘，選 (A)。" },
      { n:197, q:"According to the survey, what was the most commonly requested improvement?", opts:["Lower prices","Extended hours","More vegetarian/vegan options","International cuisine"], ans:2, exp:"More vegetarian/vegan options was requested by 78% — the highest percentage.", zh:"78% 員工要求更多素食/純素選項，比例最高，選 (C)。" },
      { n:198, q:"Which survey request was NOT addressed in the cafeteria changes?", opts:["More vegetarian options","Extended hours","Grab-and-go section","Lower prices"], ans:3, exp:"The notice says prices will remain unchanged, so the request for lower prices was not met.", zh:"通知指出價格不變，未回應降價需求，選 (D)。" },
      { n:199, q:"What does Marco Russo want to know?", opts:["When the new menu will be published","Whether prices will change","If the grab-and-go section will be ready on May 12","How to submit cafeteria feedback"], ans:2, exp:"Marco asks whether the grab-and-go section will be ready from day one.", zh:"Marco 詢問 grab-and-go 區是否於 5 月 12 日起即可使用，選 (C)。" },
      { n:200, q:"What can be inferred about the cafeteria changes?", opts:["They were based entirely on management's preferences","They were developed in response to employee feedback","They will result in higher prices","They will eliminate all hot meal options"], ans:1, exp:"The notice states changes were made 'following feedback collected over the past quarter'.", zh:"通知明確說明改變源自員工反饋，選 (B)。" }
    ]
  }
];

// ── 模擬測驗 第 02 回 ────────────────────────────────────────
const Q_P5_T02 = [
  // Q101 — Gerund after "enjoy"
  { q:"The new interns enjoy ------- in cross-departmental projects because it broadens their skill sets.", opts:["participate","participating","participated","to participate"], ans:1, exp:"'Enjoy' is always followed by a gerund (verb + -ing), not an infinitive.", zh:"'enjoy' 後只能接動名詞（V-ing），選 (B)。", trans:"新進實習生喜歡參與跨部門專案，因為這能拓展他們的技能。" },
  // Q102 — Word form: noun
  { q:"The ------- of the new branch office will create over fifty permanent positions in the region.", opts:["establish","established","establishment","establishing"], ans:2, exp:"A noun is required as the subject of the sentence; 'establishment' is the correct noun form.", zh:"句子需名詞作主詞，'establishment'（設立），選 (C)。", trans:"新分公司的設立將在該地區創造超過五十個固定職位。" },
  // Q103 — Passive voice: present perfect
  { q:"The contract ------- by both parties, and the project will begin next Monday.", opts:["signs","is signing","has been signed","signing"], ans:2, exp:"Present perfect passive 'has been signed' indicates a completed action relevant to the present.", zh:"現在完成被動式 'has been signed' 表示已完成的動作，選 (C)。", trans:"合約已由雙方簽署，專案將於下週一開始。" },
  // Q104 — Relative pronoun: whose
  { q:"The engineer ------- innovative design won the company award has been promoted to senior director.", opts:["who","whom","whose","which"], ans:2, exp:"'Whose' is a relative pronoun showing possession (the engineer's design).", zh:"'whose' 為關係代詞所有格，表示「工程師的設計」，選 (C)。", trans:"其創新設計榮獲公司獎項的工程師已晉升為資深總監。" },
  // Q105 — Correlative: not only...but also
  { q:"The new policy will benefit ------- full-time employees but also contractors who work on long-term assignments.", opts:["either","not only","both","neither"], ans:1, exp:"'Not only ... but also' is a correlative conjunction pairing two elements.", zh:"'not only ... but also' 為對等相關連接詞，表示兩者皆是，選 (B)。", trans:"新政策不僅惠及全職員工，也惠及長期任務的承包商。" },
  // Q106 — Conditional: unless
  { q:"The shipment cannot be dispatched ------- all customs documentation has been verified and approved.", opts:["if","unless","provided that","as long as"], ans:1, exp:"'Unless' introduces a negative condition meaning 'except if'.", zh:"'unless' 引導否定條件，意為「除非……否則不」，選 (B)。", trans:"除非所有海關文件均已核實並獲批准，否則貨物不能發出。" },
  // Q107 — Quantifier: fewer vs. less
  { q:"The revised timetable requires ------- revision cycles than the original plan.", opts:["less","fewer","much","little"], ans:1, exp:"'Fewer' is used with countable nouns (revision cycles); 'less' is for uncountable nouns.", zh:"'fewer' 用於可數名詞（revision cycles），'less' 用於不可數名詞，選 (B)。", trans:"修訂後的時間表比原計畫需要更少的修訂週期。" },
  // Q108 — Preposition: on behalf of
  { q:"Ms. Rivera signed the agreement ------- the entire executive committee.", opts:["on behalf of","in spite of","regardless of","prior to"], ans:0, exp:"'On behalf of' means 'as a representative of' and is the correct fixed phrase here.", zh:"'on behalf of' 表代表，為正確固定搭配，選 (A)。", trans:"Rivera 女士代表整個執行委員會簽署了協議。" },
  // Q109 — Present perfect vs. past simple
  { q:"The finance team ------- the quarterly figures three times before the board presentation.", opts:["checked","has checked","have checked","is checking"], ans:0, exp:"The past simple 'checked' is used because the action is finished at a specific past point (before the presentation).", zh:"動作在特定過去時間點已完成，用過去簡單式，選 (A)。", trans:"財務團隊在董事會簡報前已核對了三次季度數字。" },
  // Q110 — Future perfect
  { q:"By the time the auditors arrive next week, the accounting team ------- all the financial records.", opts:["will prepare","prepares","will have prepared","has prepared"], ans:2, exp:"'By the time + present, future perfect' shows an action that will be completed before a future point.", zh:"'By the time' 搭配未來完成式，表到某未來時間點前已完成，選 (C)。", trans:"到下週審計員抵達時，會計團隊將已準備好所有財務記錄。" },
  // Q111 — Causative: have + obj + base form
  { q:"The director will have the IT team ------- all company laptops with the latest security patch.", opts:["update","updates","updated","to update"], ans:0, exp:"Causative 'have + object + base form' requires the base verb (no 'to').", zh:"使役動詞 'have + 受詞 + 原形動詞'，選 (A)。", trans:"總監將讓 IT 團隊用最新安全補丁更新所有公司筆記型電腦。" },
  // Q112 — Modal: had better
  { q:"You ------- review the contract carefully before signing, as it contains several binding clauses.", opts:["had better","would rather","used to","ought have"], ans:0, exp:"'Had better + base verb' gives strong advice or warning.", zh:"'had better + 原形動詞' 表強烈建議或警告，選 (A)。", trans:"您最好在簽署前仔細閱讀合約，因為其中包含若干具約束力的條款。" },
  // Q113 — So...that
  { q:"The demand for the new smartphone model was ------- high that the manufacturer had to increase production immediately.", opts:["very","too","so","such"], ans:2, exp:"'So + adjective + that' expresses a degree leading to a result.", zh:"'so + 形容詞 + that' 表程度導致結果，選 (C)。", trans:"新款智慧型手機的需求如此之高，製造商不得不立即增加產量。" },
  // Q114 — Parallel structure
  { q:"The team leader praised the staff for their dedication, their creativity, and their ------- to meet tight deadlines.", opts:["able","ability","abilities","ability"], ans:3, exp:"Parallel structure requires a noun to match 'dedication' and 'creativity'; 'ability' is the singular noun.", zh:"平行結構需與 'dedication'、'creativity' 同為名詞，用單數 'ability'，選 (D)。", trans:"團隊領導稱讚員工的奉獻精神、創造力以及在緊迫期限下完成任務的能力。" },
  // Q115 — Subjunctive after recommend
  { q:"The consultant recommended that the company ------- its pricing strategy to remain competitive.", opts:["revises","revise","revised","revising"], ans:1, exp:"After 'recommend that', the subjunctive mood requires the base form of the verb.", zh:"'recommend that' 後接假設語氣，動詞用原形，選 (B)。", trans:"顧問建議公司修訂定價策略以保持競爭力。" },
  // Q116 — Gerund after "avoid"
  { q:"To reduce energy costs, the building manager suggested ------- all non-essential lights during off-peak hours.", opts:["turn off","to turn off","turned off","turning off"], ans:3, exp:"'Suggest' is followed by a gerund (verb + -ing).", zh:"'suggest' 後接動名詞（V-ing），選 (D)。", trans:"為降低能源成本，大樓管理員建議在離峰時段關閉所有非必要燈具。" },
  // Q117 — Word form: adjective from noun
  { q:"The HR department issued a memo outlining the ------- benefits available to all permanent employees.", opts:["comprehend","comprehension","comprehensive","comprehensively"], ans:2, exp:"An adjective is required before the noun 'benefits'; 'comprehensive' fits the context.", zh:"修飾名詞需形容詞，'comprehensive'（全面的），選 (C)。", trans:"人資部門發布了一份備忘錄，列出所有正式員工可享有的全面福利。" },
  // Q118 — Passive voice: future
  { q:"All personal data collected during the registration process ------- in accordance with current privacy regulations.", opts:["will protect","will be protected","is protecting","protects"], ans:1, exp:"Future passive 'will be protected' is needed because the data is the object being acted upon.", zh:"資料是被保護的對象，用未來被動式 'will be protected'，選 (B)。", trans:"在報名過程中收集的所有個人資料將依照現行隱私法規受到保護。" },
  // Q119 — Preposition: prior to
  { q:"All attendees must submit their presentation slides ------- the conference to allow time for technical review.", opts:["prior to","in spite of","regardless of","on behalf of"], ans:0, exp:"'Prior to' means 'before' and is used with noun phrases.", zh:"'prior to' 意為「在……之前」，後接名詞片語，選 (A)。", trans:"所有出席者必須在會議前提交簡報投影片，以便進行技術審查。" },
  // Q120 — Word form: adverb
  { q:"The new warehouse system has ------- reduced processing time, cutting delivery delays by 40 percent.", opts:["drama","dramatic","dramatically","dramatize"], ans:2, exp:"An adverb is needed to modify the verb 'reduced'.", zh:"修飾動詞 'reduced' 需副詞，'dramatically'，選 (C)。", trans:"新倉儲系統已顯著縮短了處理時間，將配送延誤減少了 40%。" },
  // Q121 — Gerund after "consider"
  { q:"Management is ------- relocating the headquarters to a more central location to improve accessibility.", opts:["consider","considered","considering","to consider"], ans:2, exp:"'Is considering' is the present progressive; 'consider' also takes a gerund as its complement.", zh:"'be considering' 為現在進行式，且 'consider' 後接動名詞，選 (C)。", trans:"管理層正在考慮將總部遷至更中心的地點，以提升交通便利性。" },
  // Q122 — Preposition: in spite of
  { q:"------- the technical difficulties encountered during setup, the product demonstration went ahead as scheduled.", opts:["In spite of","On behalf of","Prior to","Regardless of"], ans:0, exp:"'In spite of' introduces a concession before a noun phrase, meaning 'despite'.", zh:"'In spite of' 表讓步，後接名詞片語，意為「儘管」，選 (A)。", trans:"儘管在安裝過程中遇到技術困難，產品示範仍按計畫進行。" },
  // Q123 — Correlative: either...or
  { q:"Please submit your leave request ------- by e-mail or through the company's online HR portal.", opts:["neither","either","both","not only"], ans:1, exp:"'Either ... or' presents two alternatives.", zh:"'either ... or' 表兩選一，選 (B)。", trans:"請透過電子郵件或公司的線上人資入口網站提交您的請假申請。" },
  // Q124 — Relative pronoun: whom
  { q:"The candidate ------- the panel interviewed yesterday has accepted the job offer.", opts:["who","whom","whose","which"], ans:1, exp:"'Whom' is used as the object of the verb 'interviewed' (the panel interviewed whom).", zh:"'whom' 作動詞 'interviewed' 的受詞，選 (B)。", trans:"面試小組昨天面試的候選人已接受了工作邀約。" },
  // Q125 — Modal: would rather
  { q:"The project manager ------- receive weekly status updates than wait for a monthly report.", opts:["had better","would rather","used to","ought to"], ans:1, exp:"'Would rather + base verb' expresses preference.", zh:"'would rather + 原形動詞' 表偏好，選 (B)。", trans:"專案經理寧可每週收到進度更新，也不願等待每月報告。" },
  // Q126 — Such...that
  { q:"It was ------- a successful product launch that the company immediately began planning a follow-up model.", opts:["so","such","very","too"], ans:1, exp:"'Such + a/an + adjective + noun + that' expresses a degree leading to a result.", zh:"'such + a/an + 形容詞 + 名詞 + that' 表程度導致結果，選 (B)。", trans:"這次產品發布非常成功，公司隨即開始規劃後續型號。" },
  // Q127 — Preposition: divided into
  { q:"The orientation program is ------- three modules: company overview, safety training, and role-specific skills.", opts:["divided into","separated by","combined with","compared to"], ans:0, exp:"'Divided into' means split into parts and is the standard colocation here.", zh:"'divided into' 表「分為」，為固定搭配，選 (A)。", trans:"入職培訓計畫分為三個模組：公司概述、安全培訓和職能技能。" },
  // Q128 — Infinitive after "plan"
  { q:"The company plans ------- a new research and development center in the northern district next year.", opts:["opening","opened","to open","open"], ans:2, exp:"'Plan' is followed by an infinitive (to + base form).", zh:"'plan' 後接不定詞（to + 原形動詞），選 (C)。", trans:"公司計畫明年在北區開設一個新的研發中心。" },
  // Q129 — Quantifier: various
  { q:"The proposal outlines ------- strategies for increasing market share in the Asia-Pacific region.", opts:["many","much","various","several of"], ans:2, exp:"'Various' (= of different types) collocates naturally with the noun 'strategies' without a preposition.", zh:"'various' 意為「各式各樣的」，直接修飾可數名詞，選 (C)。", trans:"該提案概述了在亞太地區提升市場份額的各種策略。" },
  // Q130 — Preposition: regardless of
  { q:"All employees are eligible for the year-end bonus ------- their department or seniority level.", opts:["in spite of","on behalf of","regardless of","prior to"], ans:2, exp:"'Regardless of' means 'without considering' and fits the inclusive context.", zh:"'regardless of' 意為「不論」，表不受……影響，選 (C)。", trans:"所有員工均有資格獲得年終獎金，無論其部門或資歷等級。" }
];

const Q_P6_T02 = [
  {
    meta: "Questions 131–134: Payment Reminder Email",
    text: `Dear Ms. Watanabe,\n\nThis is a reminder that Invoice #4892 for the amount of $3,450.00 is now [131] by 30 days. We kindly ask that you arrange payment at your earliest convenience.\n\nIf you have already processed this payment, please disregard this notice. [132], please contact our billing department at billing@axiomservices.com to discuss payment options.\n\nWe value our ongoing business [133] and hope to resolve this matter promptly. Please note that continued non-payment may result in the [134] of services as outlined in your service agreement.\n\nThank you for your attention to this matter.\n\nSincerely,\nAxiom Services Accounts Receivable`,
    qs: [
      { n:131, opts:["overdue","pending","issued","submitted"], ans:0, exp:"'Overdue by 30 days' means the payment is late by 30 days; this is standard billing language.", zh:"'overdue by 30 days' 意為逾期 30 天，為帳單標準用語，選 (A)。" },
      { n:132, opts:["Otherwise","Therefore","However","Moreover"], ans:0, exp:"'Otherwise' introduces the alternative action if payment hasn't been made yet.", zh:"'Otherwise' 引導相反情況的後續行動，選 (A)。" },
      { n:133, opts:["relation","relating","relationship","relatedly"], ans:2, exp:"'Business relationship' is a fixed collocation requiring the noun 'relationship'.", zh:"'business relationship' 為固定搭配，需名詞，選 (C)。" },
      { n:134, opts:["suspension","suspending","suspend","suspended"], ans:0, exp:"'The suspension of services' uses the noun form as the object of the preposition 'in'.", zh:"介系詞 'in' 後需名詞，'suspension of services' 為正確用法，選 (A)。" }
    ]
  },
  {
    meta: "Questions 135–138: Office Relocation Announcement",
    text: `ANNOUNCEMENT TO ALL STAFF\n\nWe are pleased to inform you that Meridian Consulting will be [135] its headquarters to a new location effective March 1. Our new address will be 450 Lakeview Boulevard, Suite 1200.\n\nThe move is [136] to take three days (February 26–28). During this period, staff are asked to work remotely. IT support will be available throughout the transition to ensure minimal disruption.\n\nAll client meetings [137] during the relocation period should be rescheduled. Please coordinate with your clients directly. [138]\n\nWe appreciate your flexibility and cooperation during this exciting transition.\n\nManagement`,
    qs: [
      { n:135, opts:["relocating","relocated","to relocate","relocation"], ans:0, exp:"'Will be relocating' is the future progressive; here 'relocating' completes 'will be relocating'.", zh:"填入 'relocating' 構成未來進行式 'will be relocating'，選 (A)。" },
      { n:136, opts:["expected","expecting","expectation","expects"], ans:0, exp:"'Is expected to' is the correct passive construction meaning 'is anticipated to'.", zh:"'is expected to' 為正式被動結構，表預計，選 (A)。" },
      { n:137, opts:["scheduling","scheduled","schedule","to schedule"], ans:1, exp:"Past participle 'scheduled' acts as an adjective modifying 'client meetings'.", zh:"過去分詞作形容詞修飾 'client meetings'，選 (B)。" },
      { n:138, opts:["Updated contact information will be circulated by February 20.","The old office will remain open until further notice.","Please report to the new office starting February 26.","All staff must submit a relocation request form."], ans:0, exp:"This sentence provides a practical follow-up action — sharing updated contact details — which fits naturally after the scheduling instruction.", zh:"此句提供實際後續行動（發布新聯絡資訊），語意最自然，選 (A)。" }
    ]
  },
  {
    meta: "Questions 139–142: Training Workshop Registration Notice",
    text: `PROFESSIONAL DEVELOPMENT WORKSHOP\nEffective Business Communication Skills\n\nThe Human Resources Department is pleased to [139] a two-day workshop on business communication for all mid-level managers. The workshop will cover written, verbal, and presentation skills.\n\nDates: May 14–15 | Location: Training Room B, 3rd Floor\nRegistration Deadline: May 7\n\nParticipation is strongly [140], as these skills are directly linked to individual performance evaluations. Seats are limited to 20 participants per session, so early registration is [141].\n\nTo register, please complete the online form on the company intranet. [142] any questions regarding the content or scheduling, contact Ms. Park at extension 215.\n\nWe look forward to your participation.`,
    qs: [
      { n:139, opts:["announce","announcing","announced","announcement"], ans:0, exp:"'Is pleased to announce' uses the base form after the infinitive marker 'to'.", zh:"'is pleased to' 後接原形動詞，選 (A)。" },
      { n:140, opts:["encourage","encouragement","encouraged","encouraging"], ans:2, exp:"'Is strongly encouraged' is a passive construction; 'encouraged' is the past participle.", zh:"'is strongly encouraged' 為被動式，需過去分詞，選 (C)。" },
      { n:141, opts:["advised","advisable","advising","advise"], ans:1, exp:"'Is advisable' means 'is recommended'; it is an adjective used after a linking verb.", zh:"'is advisable' 意為「建議的」，形容詞接連綴動詞，選 (B)。" },
      { n:142, opts:["For","About","To have","Should you have"], ans:3, exp:"'Should you have any questions' is a formal conditional inversion common in professional notices.", zh:"'Should you have' 為正式倒裝條件句，適用於公告，選 (D)。" }
    ]
  },
  {
    meta: "Questions 143–146: New Product Launch Press Release",
    text: `FOR IMMEDIATE RELEASE\n\nVortex Technologies [143] Its Next-Generation Smart Home Hub\n\nSan Francisco, CA — Vortex Technologies today announced the official launch of the VortexHome 3, its most [144] smart home hub to date. The device integrates seamlessly with all major home automation platforms and features an upgraded AI assistant.\n\n"We designed VortexHome 3 with the consumer [145] mind," said CEO James Thornton. "Every feature has been refined based on user feedback."\n\nThe VortexHome 3 will be [146] exclusively through the Vortex online store and select retail partners beginning June 15. Retail price is set at $199.\n\nFor media inquiries, contact press@vortextech.com.`,
    qs: [
      { n:143, opts:["Launches","Launching","Launched","Launch"], ans:0, exp:"Press releases typically use third-person present simple for immediate announcements.", zh:"新聞稿使用第三人稱現在簡單式表即時宣告，選 (A)。" },
      { n:144, opts:["advance","advancing","advanced","advancement"], ans:2, exp:"'Most advanced' is the superlative adjective form needed before the noun 'smart home hub'.", zh:"最高級形容詞 'most advanced' 修飾名詞，選 (C)。" },
      { n:145, opts:["in","on","at","with"], ans:0, exp:"'With the consumer in mind' is a fixed idiom meaning 'considering the consumer'.", zh:"'with ... in mind' 為固定慣用語，表「以……為考量」，選 (A)。" },
      { n:146, opts:["available","availability","availably","avail"], ans:0, exp:"'Will be available' uses the adjective 'available' after the linking verb 'be'.", zh:"'will be available' 中 'available' 為形容詞接 'be'，選 (A)。" }
    ]
  }
];

const Q_P7_T02 = [
  // ── Set 1: Short email — business trip approval (Q147–148, 2q) ──
  {
    type: "single",
    meta: "Questions 147–148: E-mail",
    passage: `<div class="doc-label">E-mail</div>
<p><strong>From:</strong> d.kim@globalpartners.com<br><strong>To:</strong> s.lee@globalpartners.com<br><strong>Subject:</strong> RE: Business Trip to Tokyo — Approval Request<br><strong>Date:</strong> Monday, April 14</p>
<p>Dear Mr. Lee,</p>
<p>Thank you for submitting your travel request for the Tokyo client summit scheduled for May 5–7. After reviewing the details, I am pleased to approve the trip.</p>
<p>Please book your flights and hotel through the corporate travel portal and ensure all bookings are completed by April 25. Keep all receipts for reimbursement. The daily meal allowance is $60.</p>
<p>Safe travels,<br>Diana Kim<br>Finance Manager, Global Partners Inc.</p>`,
    qs: [
      { n:147, q:"What is the purpose of this e-mail?", opts:["To request approval for a business trip","To approve a business trip","To cancel a conference","To introduce a new travel policy"], ans:1, exp:"Diana Kim writes to confirm she is approving Mr. Lee's travel request.", zh:"Diana Kim 回覆以批准出差申請，選 (B)。" },
      { n:148, q:"What is Mr. Lee asked to do by April 25?", opts:["Submit his expense report","Complete flight and hotel bookings","Attend a budget meeting","Send a client summary"], ans:1, exp:"The e-mail instructs that all bookings must be completed by April 25.", zh:"郵件指示需在 4 月 25 日前完成機票和酒店預訂，選 (B)。" }
    ]
  },
  // ── Set 2: Notice — parking garage closure (Q149–151, 3q) ──
  {
    type: "single",
    meta: "Questions 149–151: Notice",
    passage: `<div class="doc-label">Notice</div>
<h4>PARKING GARAGE CLOSURE — LEVEL B2</h4>
<p>Please be advised that Level B2 of the Harrington Tower parking garage will be closed for structural maintenance from Monday, June 2, through Friday, June 13. The closure is necessary to complete safety inspections required by the city.</p>
<p>During this period, employees who normally park on Level B2 are encouraged to use the overflow parking lot located at 88 Commerce Street, approximately a five-minute walk from the main entrance. A shuttle service will operate between the overflow lot and the building entrance from 7:30 A.M. to 7:00 P.M. on business days.</p>
<p>Monthly pass holders will not be charged for the affected period. For questions, contact Facilities Management at ext. 350.</p>`,
    qs: [
      { n:149, q:"Why is Level B2 being closed?", opts:["For construction of additional spaces","For safety inspections required by the city","Due to flooding damage","To install new lighting systems"], ans:1, exp:"The notice states the closure is necessary to complete safety inspections required by the city.", zh:"公告指出關閉是為了完成城市規定的安全檢查，選 (B)。" },
      { n:150, q:"Where is the overflow parking lot located?", opts:["In Level B1 of Harrington Tower","At 88 Commerce Street","In front of the main entrance","On Level B3"], ans:1, exp:"The overflow parking lot is at 88 Commerce Street.", zh:"臨時停車場位於商業街 88 號，選 (B)。" },
      { n:151, q:"What benefit do monthly pass holders receive during the closure?", opts:["Free shuttle service upgrades","A refund of their annual fee","No charge for the affected period","A temporary parking permit"], ans:2, exp:"Monthly pass holders will not be charged for the affected period.", zh:"月票持有者在受影響期間無需繳費，選 (C)。" }
    ]
  },
  // ── Set 3: Article — company sustainability initiative (Q152–154, 3q) ──
  {
    type: "single",
    meta: "Questions 152–154: Article",
    passage: `<div class="doc-label">Business News</div>
<h4>PINNACLE INDUSTRIES LAUNCHES AMBITIOUS SUSTAINABILITY INITIATIVE</h4>
<p>Pinnacle Industries announced on Wednesday a comprehensive environmental sustainability program aimed at reducing its carbon footprint by 50 percent by 2030. The initiative, called GreenCore, will include switching all manufacturing facilities to renewable energy sources and eliminating single-use plastics from all operations by 2026.</p>
<p>Chief Sustainability Officer Dr. Elena Vasquez stated that the company had already reduced energy consumption by 18 percent last year through facility upgrades. "GreenCore represents our long-term commitment to responsible business practice," she said.</p>
<p>Pinnacle will invest $40 million over five years in green technology and employee sustainability training. The company also plans to partner with three local universities to conduct joint research on sustainable manufacturing processes.</p>`,
    qs: [
      { n:152, q:"What is the main goal of the GreenCore initiative?", opts:["To increase annual revenue by 50 percent","To reduce carbon footprint by 50 percent by 2030","To hire 40 million new employees","To partner with international universities"], ans:1, exp:"The article states GreenCore aims to reduce the carbon footprint by 50 percent by 2030.", zh:"文中指出 GreenCore 目標為在 2030 年前減少 50% 碳足跡，選 (B)。" },
      { n:153, q:"According to Dr. Vasquez, what did Pinnacle achieve last year?", opts:["Reduced energy consumption by 18 percent","Eliminated all single-use plastics","Invested $40 million in technology","Hired a new sustainability team"], ans:0, exp:"Dr. Vasquez says the company reduced energy consumption by 18 percent last year.", zh:"Vasquez 博士表示去年能源消耗減少了 18%，選 (A)。" },
      { n:154, q:"What does Pinnacle plan to do with local universities?", opts:["Hire their graduates for green roles","Fund new campus buildings","Conduct joint research on sustainable manufacturing","Offer employee scholarships"], ans:2, exp:"Pinnacle plans to partner with three local universities for joint research on sustainable manufacturing.", zh:"計畫與三所大學合作進行永續製造研究，選 (C)。" }
    ]
  },
  // ── Set 4: Advertisement — online certification course (Q155–157, 3q) ──
  {
    type: "single",
    meta: "Questions 155–157: Advertisement",
    passage: `<div class="doc-label">Advertisement</div>
<h4>ADVANCE YOUR CAREER WITH SKILLBRIDGE PRO</h4>
<p>Are you ready to take your professional skills to the next level? SkillBridge Pro offers industry-recognized online certification courses in project management, data analytics, digital marketing, and supply chain operations.</p>
<p><strong>Why choose SkillBridge Pro?</strong></p>
<p>• Self-paced learning — study at your own schedule<br>• Expert instructors with 10+ years of industry experience<br>• Certificate recognized by over 500 global employers<br>• 30-day money-back guarantee</p>
<p>Enroll before May 31 and receive 20% off any course. Use promo code <strong>CAREER20</strong> at checkout.</p>
<p>Visit www.skillbridgepro.com or call 1-800-555-0193 to speak with an enrollment advisor.</p>`,
    qs: [
      { n:155, q:"What type of courses does SkillBridge Pro offer?", opts:["Language and translation programs","Industry-recognized professional certification courses","University degree programs","On-site corporate training only"], ans:1, exp:"The advertisement describes industry-recognized online certification courses.", zh:"廣告描述業界認可的線上認證課程，選 (B)。" },
      { n:156, q:"What discount is available before May 31?", opts:["10% off with any promo code","Free enrollment for new users","20% off any course","30% off project management courses"], ans:2, exp:"Enrolling before May 31 with promo code CAREER20 gives 20% off.", zh:"在 5 月 31 日前報名可享九折優惠，選 (C)。" },
      { n:157, q:"What is mentioned as a benefit of SkillBridge Pro?", opts:["Guaranteed job placement","A 30-day money-back guarantee","Free textbooks for all courses","Unlimited access for life"], ans:1, exp:"The advertisement lists a 30-day money-back guarantee as one of the benefits.", zh:"廣告列出 30 天退款保證為優點之一，選 (B)。" }
    ]
  },
  // ── Set 5: Business letter — price quotation request (Q158–160, 3q) ──
  {
    type: "single",
    meta: "Questions 158–160: Business Letter",
    passage: `<div class="doc-label">Business Letter</div>
<p>April 10<br>Purchasing Department<br>Orion Manufacturing Co.<br>14 Industrial Park Road<br>Detroit, MI 48201</p>
<p>Dear Purchasing Manager,</p>
<p>I am writing on behalf of Westfield Supplies Ltd. to request a price quotation for bulk orders of stainless steel fasteners (catalog nos. SS-204 and SS-310). We are currently evaluating suppliers for a 12-month contract beginning July 1.</p>
<p>We anticipate ordering approximately 50,000 units per quarter. We would appreciate a breakdown of unit pricing at various volume levels, along with your standard delivery lead times and payment terms.</p>
<p>Please send your quotation by April 28. If you have any questions, contact me directly at r.santos@westfieldsupplies.com or at (313) 555-0187.</p>
<p>Yours sincerely,<br>Robert Santos<br>Procurement Manager, Westfield Supplies Ltd.</p>`,
    qs: [
      { n:158, q:"What is the purpose of this letter?", opts:["To confirm a purchase order","To request a price quotation","To report a product defect","To cancel an existing contract"], ans:1, exp:"Robert Santos writes to request a price quotation from Orion Manufacturing.", zh:"Robert Santos 致函請求報價，選 (B)。" },
      { n:159, q:"How many units does Westfield anticipate ordering per quarter?", opts:["12,000","50,000","100,000","204,000"], ans:1, exp:"The letter states approximately 50,000 units per quarter.", zh:"信中預估每季訂購約 50,000 件，選 (B)。" },
      { n:160, q:"By what date should the quotation be sent?", opts:["April 10","April 20","April 28","July 1"], ans:2, exp:"The letter requests the quotation by April 28.", zh:"信中要求於 4 月 28 日前送達報價，選 (C)。" }
    ]
  },
  // ── Set 6: Online FAQ — membership service (Q161–163, 3q) ──
  {
    type: "single",
    meta: "Questions 161–163: Online FAQ",
    passage: `<div class="doc-label">Online FAQ</div>
<h4>NEXREAD PREMIUM — FREQUENTLY ASKED QUESTIONS</h4>
<p><strong>Q: Can I cancel my subscription at any time?</strong><br>Yes. You may cancel your NexRead Premium subscription at any time through your account settings. Cancellations take effect at the end of your current billing cycle. You will continue to have access to all premium content until that date.</p>
<p><strong>Q: Is there a free trial available?</strong><br>New subscribers are eligible for a 14-day free trial. No credit card is required during the trial period. If you choose not to continue, simply cancel before the trial ends.</p>
<p><strong>Q: Can I share my account with family members?</strong><br>The Individual Plan supports one user per account. However, the Family Plan allows up to five users to share a single subscription at a reduced per-person cost. You can upgrade your plan at any time from the account dashboard.</p>`,
    qs: [
      { n:161, q:"When does a cancellation take effect?", opts:["Immediately upon cancellation","At the end of the current billing cycle","After 30 days","On the first of the following month"], ans:1, exp:"The FAQ states cancellations take effect at the end of the current billing cycle.", zh:"FAQ 說明取消在當前計費週期結束時生效，選 (B)。" },
      { n:162, q:"What is required to start a free trial?", opts:["A valid credit card","Referral from an existing member","Payment of a registration fee","Nothing — no credit card required"], ans:3, exp:"The FAQ states no credit card is required during the trial period.", zh:"試用期不需信用卡，選 (D)。" },
      { n:163, q:"How many users can share a Family Plan?", opts:["One","Two","Three","Five"], ans:3, exp:"The Family Plan allows up to five users to share a single subscription.", zh:"家庭方案最多可供五位用戶共用，選 (D)。" }
    ]
  },
  // ── Set 7: Internal memo — travel expense policy (Q164–167, 4q) ──
  {
    type: "single",
    meta: "Questions 164–167: Internal Memo",
    passage: `<div class="doc-label">Internal Memo</div>
<p><strong>To:</strong> All Staff<br><strong>From:</strong> Finance Department<br><strong>Re:</strong> Updated Business Travel Expense Policy<br><strong>Date:</strong> April 1</p>
<p>Effective May 1, the company is implementing several updates to the Business Travel Expense Policy. Please review the following key changes:</p>
<p><strong>1. Pre-Approval Requirement:</strong> All domestic travel costing more than $500 must be pre-approved by your department head at least five business days before departure. International travel requires Finance Department approval.</p>
<p><strong>2. Meal Allowances:</strong> Daily meal allowances have been revised. Domestic travel: $75 per day. International travel: $120 per day. Receipts are required for all individual meal expenses exceeding $25.</p>
<p><strong>3. Hotel Standards:</strong> Employees should book hotels at or below the government per diem rate for the destination city. Any hotel exceeding this rate requires prior written approval.</p>
<p><strong>4. Submission Deadline:</strong> All expense reports must be submitted within 15 business days of returning from travel. Late submissions may not be reimbursed.</p>
<p>The updated policy document is available on the company intranet. For questions, contact the Finance Department at finance@company.com.</p>`,
    qs: [
      { n:164, q:"When does the updated travel policy take effect?", opts:["April 1","April 5","May 1","May 15"], ans:2, exp:"The memo states the policy is effective May 1.", zh:"備忘錄指出新政策自 5 月 1 日起生效，選 (C)。" },
      { n:165, q:"Who must approve domestic travel costing more than $500?", opts:["The Finance Department","A travel coordinator","The employee's department head","The CEO"], ans:1, exp:"Domestic travel over $500 must be pre-approved by the department head.", zh:"超過 500 美元的國內出差需部門主管預先批准，選 (B)。" },
      { n:166, q:"What is the daily meal allowance for international travel?", opts:["$50","$75","$100","$120"], ans:3, exp:"The revised international daily meal allowance is $120 per day.", zh:"國際出差每日餐費津貼為 120 美元，選 (D)。" },
      { n:167, q:"What happens if an expense report is submitted late?", opts:["The employee receives a warning","The report is automatically rejected","The expense may not be reimbursed","The employee must resubmit within 5 days"], ans:2, exp:"The memo states that late submissions may not be reimbursed.", zh:"備忘錄指出逾期提交可能不獲報銷，選 (C)。" }
    ]
  },
  // ── Set 8: Article — new corporate headquarters (Q168–171, 4q) ──
  {
    type: "single",
    meta: "Questions 168–171: Article",
    passage: `<div class="doc-label">Business News</div>
<h4>CRESTLINE FINANCIAL OPENS STATE-OF-THE-ART HEADQUARTERS IN AUSTIN</h4>
<p>Crestline Financial Group officially opened its new corporate headquarters in Austin, Texas, on Friday. The 22-story tower, located at 1 Capital Plaza, consolidates operations from three separate locations into a single, modern facility.</p>
<p>The building features open-plan workspaces, four dedicated innovation labs, a rooftop garden, and an on-site fitness center. Crestline CEO Patricia Huang called the opening "a defining moment" for the company, which was founded in 1998 and now employs over 3,500 people globally.</p>
<p>The construction project, which began in January 2023, was completed on time and within its $180 million budget. The building has received LEED Gold certification for its energy-efficient design, including solar panels covering 30 percent of the rooftop.</p>
<p>Approximately 1,200 employees from the Austin region have relocated to the new headquarters. The company has no plans to reduce its workforce at other locations.</p>`,
    qs: [
      { n:168, q:"What is the main purpose of the new headquarters?", opts:["To house a new research division","To consolidate operations from three separate locations","To serve as a training center for new hires","To replace the company's overseas offices"], ans:1, exp:"The article states the new tower consolidates operations from three separate locations.", zh:"新大樓將三個分散地點的業務整合在一處，選 (B)。" },
      { n:169, q:"When was Crestline Financial founded?", opts:["1988","1998","2003","2023"], ans:1, exp:"The article states Crestline was founded in 1998.", zh:"文中指出 Crestline 成立於 1998 年，選 (B)。" },
      { n:170, q:"What environmental recognition did the building receive?", opts:["LEED Platinum certification","LEED Gold certification","ISO 14001 certification","Green Star rating"], ans:1, exp:"The building received LEED Gold certification for its energy-efficient design.", zh:"大樓因節能設計獲得 LEED 黃金認證，選 (B)。" },
      { n:171, q:"How many employees relocated to the new headquarters?", opts:["1,200","1,800","3,500","4,700"], ans:0, exp:"Approximately 1,200 employees from the Austin region relocated to the new headquarters.", zh:"奧斯汀地區約 1,200 名員工遷至新總部，選 (A)。" }
    ]
  },
  // ── Set 9: Meeting agenda — quarterly business review (Q172–175, 4q) ──
  {
    type: "single",
    meta: "Questions 172–175: Meeting Agenda",
    passage: `<div class="doc-label">Meeting Agenda</div>
<h4>QUARTERLY BUSINESS REVIEW — Q1 AGENDA</h4>
<p><strong>Date:</strong> April 18 &nbsp;|&nbsp; <strong>Time:</strong> 9:00 A.M. – 12:00 P.M. &nbsp;|&nbsp; <strong>Location:</strong> Boardroom C, 8th Floor</p>
<p><strong>Attendees:</strong> All Department Heads, Finance Team, CEO</p>
<p><strong>9:00–9:10</strong> &nbsp; Welcome and housekeeping — CEO Sandra Park<br>
<strong>9:10–9:40</strong> &nbsp; Q1 Financial Results — CFO Mark Osei<br>
<strong>9:40–10:10</strong> &nbsp; Sales Performance Review — VP Sales, Laura Chin<br>
<strong>10:10–10:25</strong> &nbsp; Break<br>
<strong>10:25–11:00</strong> &nbsp; Operations Update — COO David Reyes<br>
<strong>11:00–11:30</strong> &nbsp; Q2 Strategy and Budget Proposal — CFO Mark Osei<br>
<strong>11:30–11:55</strong> &nbsp; Open Discussion / Q&amp;A<br>
<strong>11:55–12:00</strong> &nbsp; Closing Remarks — CEO Sandra Park</p>
<p><em>Note: All department heads are requested to prepare a brief 5-minute status summary for the Open Discussion segment. Presentations should be submitted to admin@company.com by April 16.</em></p>`,
    qs: [
      { n:172, q:"Who will present the Q1 financial results?", opts:["CEO Sandra Park","CFO Mark Osei","VP Sales Laura Chin","COO David Reyes"], ans:1, exp:"The agenda shows CFO Mark Osei will present the Q1 Financial Results at 9:10.", zh:"議程顯示財務長 Mark Osei 將於 9:10 報告 Q1 財務成果，選 (B)。" },
      { n:173, q:"What are department heads asked to prepare?", opts:["A written quarterly report","A 5-minute status summary","A detailed budget proposal","A sales forecast for Q2"], ans:1, exp:"The note requests department heads to prepare a brief 5-minute status summary.", zh:"注意事項要求各部門主管準備 5 分鐘狀態摘要，選 (B)。" },
      { n:174, q:"By when must presentations be submitted?", opts:["April 14","April 16","April 17","April 18"], ans:1, exp:"Presentations must be submitted by April 16.", zh:"簡報需在 4 月 16 日前提交，選 (B)。" },
      { n:175, q:"How long is the Open Discussion / Q&A segment?", opts:["15 minutes","25 minutes","30 minutes","55 minutes"], ans:1, exp:"Open Discussion runs from 11:30 to 11:55, which is 25 minutes.", zh:"公開討論從 11:30 至 11:55，共 25 分鐘，選 (B)。" }
    ]
  },
  // ── Set 10: Annual report extract — tech company (Q176–180, 5q) ──
  {
    type: "single",
    meta: "Questions 176–180: Annual Report Extract",
    passage: `<div class="doc-label">Annual Report — Extract</div>
<h4>HELIX SYSTEMS INC. — FISCAL YEAR SUMMARY</h4>
<p>Helix Systems Inc. concluded fiscal year 2025 with record-breaking performance across all key metrics. Total revenue reached $2.8 billion, a 22 percent increase from the prior year, driven primarily by cloud services, which grew 41 percent year-over-year and now account for 58 percent of total revenue.</p>
<p>The company expanded its global workforce to 14,200 employees, adding 1,800 new positions during the year. New offices were established in Dublin, Singapore, and São Paulo to support growing regional demand.</p>
<p>Net income for fiscal year 2025 was $420 million, compared to $310 million in fiscal year 2024. The board of directors approved a dividend of $1.20 per share, up from $0.90 in the prior year.</p>
<p>Looking ahead, Helix plans to invest $350 million in research and development in fiscal year 2026, focusing on artificial intelligence applications and cybersecurity solutions. The company expects revenue growth of 15–18 percent for the coming fiscal year.</p>`,
    qs: [
      { n:176, q:"What was Helix Systems' total revenue in fiscal year 2025?", opts:["$420 million","$2.1 billion","$2.8 billion","$3.5 billion"], ans:2, exp:"Total revenue reached $2.8 billion in fiscal year 2025.", zh:"2025 財年總營收達 28 億美元，選 (C)。" },
      { n:177, q:"What drove the revenue growth?", opts:["Hardware sales","Consulting services","Cloud services","International licensing"], ans:2, exp:"Revenue growth was driven primarily by cloud services, which grew 41 percent.", zh:"營收成長主要由雲端服務推動，成長 41%，選 (C)。" },
      { n:178, q:"How much net income did Helix report in fiscal year 2024?", opts:["$310 million","$350 million","$420 million","$520 million"], ans:0, exp:"Net income was $310 million in fiscal year 2024, compared to $420 million in 2025.", zh:"2024 財年淨收入為 3.1 億美元，選 (A)。" },
      { n:179, q:"What is Helix planning to focus on in its R&D investment?", opts:["Cloud infrastructure and hardware","AI applications and cybersecurity","Marketing technology and analytics","Supply chain and logistics software"], ans:1, exp:"The report states R&D investment will focus on artificial intelligence applications and cybersecurity solutions.", zh:"研發投資將聚焦於人工智慧應用與資安解決方案，選 (B)。" },
      { n:180, q:"What revenue growth does Helix expect for fiscal year 2026?", opts:["10–12 percent","12–15 percent","15–18 percent","20–22 percent"], ans:2, exp:"The company expects revenue growth of 15–18 percent for the coming fiscal year.", zh:"公司預期下一財年營收成長 15 至 18%，選 (C)。" }
    ]
  },
  // ── Set 11: Double — warranty card + claim email (Q181–185, 5q) ──
  {
    type: "double",
    meta: "Questions 181–185: Warranty Registration + Warranty Claim E-mail",
    passages: [
      { content: `<div class="doc-label">Warranty Registration Card</div>
<h4>CLARITEK AUDIO — LIMITED WARRANTY</h4>
<p><strong>Product:</strong> ClaraPro X500 Wireless Headphones<br><strong>Model No.:</strong> CP-X500<br><strong>Purchase Date:</strong> February 3<br><strong>Registered Owner:</strong> Thomas Bauer</p>
<p>This product is covered by a <strong>24-month limited warranty</strong> from the date of purchase. The warranty covers manufacturing defects and hardware malfunctions under normal use conditions. It does not cover damage caused by accidents, misuse, or unauthorized modifications.</p>
<p>To make a warranty claim, contact our support team at support@claritek.com or call 1-800-555-0244. Please retain your proof of purchase at all times.</p>` },
      { content: `<div class="doc-label">E-mail</div>
<p><strong>From:</strong> t.bauer@mailbox.com<br><strong>To:</strong> support@claritek.com<br><strong>Subject:</strong> Warranty Claim — ClaraPro X500<br><strong>Date:</strong> November 10</p>
<p>To Whom It May Concern,</p>
<p>I am writing to submit a warranty claim for my ClaraPro X500 headphones (Model No. CP-X500), which I purchased on February 3. The right earcup has stopped producing sound. I have not made any modifications to the device, and it has been used only under normal conditions.</p>
<p>I have attached a copy of my original receipt as proof of purchase. Please advise on the next steps for repair or replacement.</p>
<p>Best regards,<br>Thomas Bauer</p>` }
    ],
    qs: [
      { n:181, q:"How long is the warranty on the ClaraPro X500?", opts:["12 months","18 months","24 months","36 months"], ans:2, exp:"The warranty card states a 24-month limited warranty.", zh:"保固卡說明提供 24 個月有限保固，選 (C)。" },
      { n:182, q:"What problem is Thomas Bauer reporting?", opts:["The headphones will not charge","The right earcup produces no sound","The Bluetooth connection fails","The headband is broken"], ans:1, exp:"Thomas reports that the right earcup has stopped producing sound.", zh:"Thomas 報告右耳罩無聲，選 (B)。" },
      { n:183, q:"Is Thomas Bauer's claim likely to be covered under the warranty?", opts:["No, because the warranty has expired","No, because he misused the product","Yes, because the defect appears to be a hardware malfunction","Yes, because all damage is covered"], ans:2, exp:"The defect (no sound from earcup) appears to be a hardware malfunction under normal use, which the warranty covers. The warranty period (24 months from February 3) would not expire until February of the following year, and the email is dated November 10 — within the warranty period.", zh:"此問題似為硬體故障且在正常使用下發生，屬保固範圍；且日期在保固期限內，選 (C)。" },
      { n:184, q:"What did Thomas attach to his e-mail?", opts:["A photo of the damaged headphones","A video showing the defect","A copy of his original receipt","His warranty registration form"], ans:2, exp:"Thomas attached a copy of his original receipt as proof of purchase.", zh:"Thomas 附上購買收據正本影本，選 (C)。" },
      { n:185, q:"According to the warranty card, what should customers always keep?", opts:["The original packaging","The serial number label","Proof of purchase","The warranty registration number"], ans:2, exp:"The warranty card instructs customers to retain proof of purchase at all times.", zh:"保固卡指示客戶隨時保留購買證明，選 (C)。" }
    ]
  },
  // ── Set 12: Double — venue invitation + booking confirmation (Q186–190, 5q) ──
  {
    type: "double",
    meta: "Questions 186–190: Event Venue Brochure + Booking Confirmation",
    passages: [
      { content: `<div class="doc-label">Event Venue Brochure</div>
<h4>THE GRAND PAVILION — EVENT SPACES</h4>
<p>The Grand Pavilion offers three versatile event spaces for corporate and private functions:</p>
<p><strong>Crystal Hall:</strong> Seats up to 300 guests. Full A/V system, dance floor, and catering kitchen included. Ideal for galas, product launches, and large receptions.<br>
<strong>Garden Terrace:</strong> Outdoor space for up to 120 guests. Heated canopy available. Perfect for cocktail receptions and outdoor ceremonies.<br>
<strong>Executive Suite:</strong> Intimate boardroom-style space for 20–40 guests. Includes projector, whiteboard, and catering service. Suitable for corporate meetings and private dinners.</p>
<p>All spaces include complimentary parking, event coordinator support, and customizable décor packages. Rates available upon request. Contact events@grandpavilion.com.</p>` },
      { content: `<div class="doc-label">Booking Confirmation</div>
<p><strong>Booking Reference:</strong> GP-20251104<br><strong>Client:</strong> Prism Innovations Ltd.<br><strong>Contact:</strong> Claire Yoon (c.yoon@prisminnovations.com)<br><strong>Event Type:</strong> Annual Awards Dinner<br><strong>Date:</strong> November 22<br><strong>Time:</strong> 6:30 P.M. – 10:30 P.M.<br><strong>Venue:</strong> Crystal Hall<br><strong>Expected Guests:</strong> 240</p>
<p>A deposit of 30% of the total venue fee has been received. The remaining balance is due no later than November 8. Cancellations made within 14 days of the event are non-refundable.</p>
<p>Please contact your event coordinator, Ms. Hartley, at ext. 214 for any changes or questions.</p>` }
    ],
    qs: [
      { n:186, q:"Which venue does Prism Innovations plan to use?", opts:["The Garden Terrace","The Executive Suite","The Crystal Hall","A combination of all three"], ans:2, exp:"The booking confirmation shows the Crystal Hall was booked.", zh:"預訂確認顯示租用 Crystal Hall，選 (C)。" },
      { n:187, q:"How many guests is Prism Innovations expecting?", opts:["120","200","240","300"], ans:2, exp:"The booking confirmation lists 240 expected guests.", zh:"預訂確認列出預計 240 位賓客，選 (C)。" },
      { n:188, q:"What is included in all venue packages at The Grand Pavilion?", opts:["Complimentary catering","Live entertainment","Complimentary parking","Photography services"], ans:2, exp:"The brochure states all spaces include complimentary parking.", zh:"宣傳冊說明所有場地包含免費停車，選 (C)。" },
      { n:189, q:"When is the remaining balance due?", opts:["November 1","November 8","November 14","November 22"], ans:1, exp:"The booking confirmation states the remaining balance is due no later than November 8.", zh:"確認函指出尾款須在 11 月 8 日前支付，選 (B)。" },
      { n:190, q:"What happens if Prism Innovations cancels within 14 days of the event?", opts:["They receive a partial refund","The deposit is returned","The booking is rescheduled","The payment is non-refundable"], ans:3, exp:"The confirmation states cancellations within 14 days are non-refundable.", zh:"確認函指出活動 14 天內取消不予退款，選 (D)。" }
    ]
  },
  // ── Set 13: Triple — job description + candidate summary + interview schedule (Q191–195, 5q) ──
  {
    type: "triple",
    meta: "Questions 191–195: Job Description + Candidate Summary + Interview Schedule",
    passages: [
      { content: `<div class="doc-label">Job Description</div>
<h4>SENIOR FINANCIAL ANALYST</h4>
<p><strong>Company:</strong> Falcon Capital Group<br><strong>Location:</strong> New York, NY (On-site)</p>
<p>We are seeking a Senior Financial Analyst to join our Corporate Finance team. The successful candidate will be responsible for financial modelling, budget forecasting, and investment analysis.</p>
<p><strong>Requirements:</strong> Bachelor's degree in Finance or Accounting; CFA designation preferred; minimum 5 years of relevant experience; advanced proficiency in Excel and financial modelling software.<br><strong>Salary:</strong> $90,000–$110,000<br><strong>Deadline:</strong> Rolling basis</p>` },
      { content: `<div class="doc-label">Candidate Summary</div>
<p><strong>Applicant:</strong> Mei-Ling Chen<br><strong>Education:</strong> B.S. Finance, Columbia University; CFA Level III Candidate<br><strong>Experience:</strong> 7 years in corporate finance at two major investment banks<br><strong>Skills:</strong> Financial modelling (DCF, LBO), Excel (advanced), Bloomberg Terminal, Python for data analysis<br><strong>Notable Achievement:</strong> Led a cross-functional team that identified $12 million in cost savings at previous employer.</p>` },
      { content: `<div class="doc-label">Interview Schedule</div>
<p><strong>Candidate:</strong> Mei-Ling Chen<br><strong>Position:</strong> Senior Financial Analyst<br><strong>Round 1:</strong> April 21, 10:00 A.M. — HR screening (30 min, video call)<br><strong>Round 2:</strong> April 24, 2:00 P.M. — Technical interview with CFO (60 min, on-site)<br><strong>Round 3:</strong> April 28, 11:00 A.M. — Panel interview with Finance Team (45 min, on-site)<br><strong>Decision Expected:</strong> By May 2</p>` }
    ],
    qs: [
      { n:191, q:"What professional designation is preferred for the position?", opts:["MBA","CPA","CFA","PMP"], ans:2, exp:"The job description states the CFA designation is preferred.", zh:"職缺說明偏好具備特許財務分析師（CFA）資格，選 (C)。" },
      { n:192, q:"How does Mei-Ling Chen exceed the experience requirement?", opts:["She has an MBA from Columbia","She has 7 years of experience instead of the required 5","She holds a CFA charterholder title","She speaks multiple languages"], ans:1, exp:"Mei-Ling has 7 years of experience, which exceeds the minimum requirement of 5 years.", zh:"Mei-Ling 擁有 7 年經驗，超過要求的 5 年，選 (B)。" },
      { n:193, q:"What was Mei-Ling Chen's notable achievement at her previous employer?", opts:["She launched a new investment fund","She negotiated a major acquisition","She led a team that identified $12 million in cost savings","She developed a proprietary trading algorithm"], ans:2, exp:"Her notable achievement was leading a team that identified $12 million in cost savings.", zh:"她帶領團隊找出 1,200 萬美元的成本節省空間，選 (C)。" },
      { n:194, q:"Where will the Round 2 technical interview take place?", opts:["Video call","Phone call","On-site","At a partner office"], ans:2, exp:"Round 2 is an on-site technical interview with the CFO.", zh:"第二輪為現場技術面試，選 (C)。" },
      { n:195, q:"When is the hiring decision expected?", opts:["April 21","April 28","May 2","May 10"], ans:2, exp:"The interview schedule states the decision is expected by May 2.", zh:"面試排程指出決定預計在 5 月 2 日前作出，選 (C)。" }
    ]
  },
  // ── Set 14: Triple — policy notice + employee email + HR response (Q196–200, 5q) ──
  {
    type: "triple",
    meta: "Questions 196–200: Policy Change Notice + Employee E-mail + HR Response",
    passages: [
      { content: `<div class="doc-label">Policy Notice</div>
<h4>UPDATED REMOTE WORK POLICY — EFFECTIVE JUNE 1</h4>
<p>After a comprehensive review, the company is revising its remote work policy. Beginning June 1, all employees in non-client-facing roles are permitted to work remotely up to three days per week. Employees in client-facing roles are required to be on-site a minimum of four days per week.</p>
<p>All remote work arrangements must be approved in advance by the employee's direct supervisor. Employees working remotely are expected to be available during core business hours (9:00 A.M. – 3:00 P.M.) and must attend all scheduled team meetings via video conference.</p>
<p>This policy does not apply to staff currently on fixed-term contracts. Questions should be directed to HR at hr@company.com.</p>` },
      { content: `<div class="doc-label">Employee E-mail</div>
<p><strong>From:</strong> n.foster@company.com<br><strong>To:</strong> hr@company.com<br><strong>Subject:</strong> Question About New Remote Work Policy<br><strong>Date:</strong> May 15</p>
<p>Dear HR Team,</p>
<p>I have read the updated remote work policy and have a question. I am a graphic designer in the Marketing Department, which I believe is a non-client-facing role. However, I also occasionally attend client presentations. Does this mean I am classified as a client-facing employee and required to be on-site four days per week?</p>
<p>I would appreciate clarification before June 1.</p>
<p>Best regards,<br>Nicole Foster</p>` },
      { content: `<div class="doc-label">HR Response E-mail</div>
<p><strong>From:</strong> hr@company.com<br><strong>To:</strong> n.foster@company.com<br><strong>Subject:</strong> RE: Question About New Remote Work Policy<br><strong>Date:</strong> May 16</p>
<p>Dear Ms. Foster,</p>
<p>Thank you for reaching out. After consulting with your department head, we can confirm that your primary role as a graphic designer is classified as non-client-facing. Occasional attendance at client presentations does not change your classification.</p>
<p>Therefore, you are eligible to work remotely up to three days per week under the new policy, subject to your supervisor's approval. Please submit your preferred remote work schedule to your supervisor by May 28.</p>
<p>Kind regards,<br>Human Resources Department</p>` }
    ],
    qs: [
      { n:196, q:"Under the new policy, how many days per week may non-client-facing employees work remotely?", opts:["One","Two","Three","Four"], ans:2, exp:"Non-client-facing employees may work remotely up to three days per week.", zh:"非面客職位員工每週最多可遠端工作三天，選 (C)。" },
      { n:197, q:"What is the core business hours requirement for remote workers?", opts:["8:00 A.M. – 5:00 P.M.","9:00 A.M. – 3:00 P.M.","9:00 A.M. – 5:00 P.M.","10:00 A.M. – 4:00 P.M."], ans:1, exp:"Remote employees must be available during core hours of 9:00 A.M. – 3:00 P.M.", zh:"遠端工作者須在核心工時 9:00 至 15:00 保持可聯繫，選 (B)。" },
      { n:198, q:"Why did Nicole Foster send an e-mail to HR?", opts:["To request a change in her job title","To report a problem with the remote work system","To ask about her classification under the new policy","To complain about being required to attend client meetings"], ans:2, exp:"Nicole sent the e-mail to ask whether her role is classified as client-facing or non-client-facing.", zh:"Nicole 發信詢問她的職位分類，選 (C)。" },
      { n:199, q:"What did HR confirm about Nicole's classification?", opts:["She is classified as a client-facing employee","She must work on-site four days per week","Her primary role is non-client-facing","She is not eligible for remote work"], ans:2, exp:"HR confirmed that Nicole's primary role as a graphic designer is non-client-facing.", zh:"人資確認 Nicole 作為平面設計師的主要職務屬非面客性質，選 (C)。" },
      { n:200, q:"By when must Nicole submit her preferred remote work schedule?", opts:["May 16","May 20","May 28","June 1"], ans:2, exp:"The HR response asks Nicole to submit her preferred schedule by May 28.", zh:"人資回覆要求 Nicole 在 5 月 28 日前提交偏好的遠端工作排程，選 (C)。" }
    ]
  }
];

// ── 單項練習題庫（合併所有回） ──────────────────────────────
const Q_P5_ALL = [
  { qn:101, q:"The project manager requested that all team members ------- their progress reports by Friday.", opts:["submits","submit","submitted","submitting"], ans:1, exp:"After 'request that', the verb uses subjunctive mood (base form).", zh:"'request that' 後接假設語氣，動詞用原形，選 (B)。", trans:"專案經理要求所有團隊成員在週五前提交進度報告。" },
  { qn:102, q:"The new employee quickly became ------- with the company's internal software system.", opts:["familiar","familiarly","familiarity","familiarize"], ans:0, exp:"'Became' is a linking verb; it takes an adjective. 'Familiar with' = comfortable knowing.", zh:"連綴動詞後接形容詞，'familiar with' 表熟悉，選 (A)。", trans:"新進員工很快就熟悉了公司的內部軟體系統。" },
  { qn:103, q:"------- the budget cuts, the research team managed to complete the study on schedule.", opts:["Because of","Despite","Although","While"], ans:1, exp:"'Despite' is a preposition used before a noun phrase to show contrast.", zh:"'Despite' 為介系詞，後接名詞，表讓步對比，選 (B)。", trans:"儘管遭遇預算刪減，研究團隊仍設法按時完成了這項研究。" },
  { qn:104, q:"Employees are encouraged to submit ------- suggestions for improving workplace safety.", opts:["construct","constructs","constructive","constructively"], ans:2, exp:"An adjective is needed before the noun 'suggestions'.", zh:"修飾名詞需形容詞，'constructive'（有建設性的），選 (C)。", trans:"員工被鼓勵提出有建設性的建議，以改善工作場所的安全。" },
  { qn:105, q:"The annual conference will be held ------- the downtown convention center this November.", opts:["at","in","on","by"], ans:0, exp:"'At' is used with specific named venues and buildings.", zh:"特定建築物或場所前用 'at'，選 (A)。", trans:"年度會議將於今年十一月在市中心會議中心舉行。" },
  { qn:106, q:"Sales figures for the third quarter were ------- higher than originally projected.", opts:["significance","significant","significantly","signify"], ans:2, exp:"An adverb modifies the comparative adjective 'higher'.", zh:"修飾形容詞比較級需副詞，選 (C) significantly。", trans:"第三季的銷售數字顯著高於原本的預測。" },
  { qn:107, q:"The CEO announced the company would ------- its operations into three new Asian markets.", opts:["expand","expands","expanded","expansion"], ans:0, exp:"Modal 'would' is followed by the base form of the verb.", zh:"情態動詞 'would' 後接動詞原形，選 (A)。", trans:"執行長宣布公司將把業務擴展到三個新的亞洲市場。" },
  { qn:108, q:"All applicants ------- submit a cover letter along with their resume to be considered.", opts:["should","must","can","might"], ans:1, exp:"'Must' expresses a strict mandatory requirement in official instructions.", zh:"'must' 語氣最強，表必要條件，選 (B)。", trans:"所有申請人必須隨履歷一併提交求職信，才能被列入考慮。" },
  { qn:109, q:"The ------- of the new product exceeded management's expectations in design and functionality.", opts:["develop","developer","development","developing"], ans:2, exp:"A noun is needed as the subject of the sentence.", zh:"句子需名詞作主詞，'development'，選 (C)。", trans:"新產品的開發在設計和功能方面都超越了管理層的預期。" },
  { qn:110, q:"Please contact our customer service department ------- you experience any difficulties.", opts:["if","unless","so that","even though"], ans:0, exp:"'If' introduces a conditional clause.", zh:"'if' 引導條件子句，選 (A)。", trans:"如果您遇到任何困難，請聯繫我們的客服部門。" },
  { qn:111, q:"The marketing team worked ------- to ensure the product launch was a success.", opts:["tire","tireless","tirelessly","tirelessness"], ans:2, exp:"An adverb modifies the verb 'worked'.", zh:"修飾動詞需副詞，'tirelessly'（不倦地），選 (C)。", trans:"行銷團隊不懈努力，確保產品發布圓滿成功。" },
  { qn:112, q:"The board of directors will meet ------- a week to review the company's financial performance.", opts:["once","one","every","each"], ans:0, exp:"'Once a week' is a fixed expression meaning one time per week.", zh:"'once a week' 為固定搭配，選 (A)。", trans:"董事會將每週召開一次會議，審查公司的財務狀況。" },
  { qn:113, q:"The training seminar is ------- for all new hires in the sales and marketing departments.", opts:["mandate","mandatory","mandatorily","mandating"], ans:1, exp:"An adjective is needed after the linking verb 'is'.", zh:"連綴動詞後接形容詞，'mandatory'（強制的），選 (B)。", trans:"培訓研討會對銷售和行銷部門的所有新進員工為強制性。" },
  { qn:114, q:"Ms. Tanaka was ------- for her outstanding contributions to the international marketing campaign.", opts:["recognize","recognition","recognized","recognizing"], ans:2, exp:"Passive voice: 'was + past participle'.", zh:"被動語態 'was + Vpp'，選 (C)。", trans:"田中女士因對國際行銷活動的傑出貢獻而獲得表彰。" },
  { qn:115, q:"The report indicates that consumer confidence has risen ------- over the past six months.", opts:["steady","steadier","steadily","steadiness"], ans:2, exp:"An adverb modifies the verb 'risen'.", zh:"修飾動詞需副詞，'steadily'，選 (C)。", trans:"報告顯示，消費者信心在過去六個月中穩定上升。" },
  { qn:116, q:"The company policy ------- employees from using personal devices during working hours.", opts:["prohibits","prohibitions","prohibitive","prohibit"], ans:0, exp:"Third-person singular subject requires verb + -s.", zh:"第三人稱單數主詞，動詞加 -s，選 (A)。", trans:"公司政策禁止員工在工作時間使用個人裝置。" },
  { qn:117, q:"We are pleased to inform you that your application has been ------- reviewed by our hiring committee.", opts:["thorough","thoroughly","thoroughness","thoroughgoing"], ans:1, exp:"An adverb modifies the passive verb phrase.", zh:"修飾動詞片語需副詞，'thoroughly'，選 (B)。", trans:"我們很高興地通知您，您的申請已由本公司招聘委員會徹底審閱。" },
  { qn:118, q:"The new facility will be large ------- to accommodate up to five hundred employees.", opts:["enough","too","very","so"], ans:0, exp:"'Adj + enough + to V' expresses sufficiency.", zh:"'adj + enough + to V' 句型，選 (A)。", trans:"新設施將足夠大，可容納多達五百名員工。" },
  { qn:119, q:"The revised budget proposal must be submitted ------- Monday at the latest.", opts:["until","by","at","since"], ans:1, exp:"'By' with a deadline means 'no later than'.", zh:"'by' 表期限，「不遲於」，選 (B)。", trans:"修訂後的預算提案最遲必須在週一前提交。" },
  { qn:120, q:"The ------- of the merger between the two companies is expected to create thousands of new jobs.", opts:["complete","completes","completing","completion"], ans:3, exp:"A noun is needed as the subject; 'completion of the merger' is a natural phrase.", zh:"需名詞作主詞，'completion'，選 (D)。", trans:"兩家公司完成合併後，預計將創造數千個新就業機會。" },
  { qn:121, q:"The shipment will arrive ------- two weeks, depending on customs clearance.", opts:["within","during","among","between"], ans:0, exp:"'Within' indicates a time frame before a deadline.", zh:"'within' 表「在……之內」，選 (A)。", trans:"貨物將在兩週內到達，視清關情況而定。" },
  { qn:122, q:"The supervisor asked the intern to make ------- copies of the financial report.", opts:["addition","additional","additionally","add"], ans:1, exp:"An adjective is needed before the noun 'copies'.", zh:"修飾名詞需形容詞，'additional'，選 (B)。", trans:"主管要求實習生多印幾份財務報告。" },
  { qn:123, q:"The new software upgrade is ------- with all operating systems released after 2018.", opts:["compatible","compatibility","compatibly","compatibleness"], ans:0, exp:"Adjective needed after linking verb 'is'; 'compatible with' is a fixed phrase.", zh:"'is' 後接形容詞，'compatible with' 為固定搭配，選 (A)。", trans:"新的軟體升級與 2018 年後發布的所有作業系統相容。" },
  { qn:124, q:"Customers who place orders before noon will ------- same-day delivery.", opts:["receive","receiving","received","to receive"], ans:0, exp:"'Will' is a modal followed by the base form.", zh:"情態動詞 'will' 後接原形，選 (A)。", trans:"在中午前下訂單的顧客將享有當日配送服務。" },
  { qn:125, q:"The ------- renovations to the office building will be completed by the end of the quarter.", opts:["schedule","scheduled","scheduling","scheduler"], ans:1, exp:"Past participle 'scheduled' acts as an adjective modifying 'renovations'.", zh:"過去分詞作形容詞修飾名詞，'scheduled'，選 (B)。", trans:"辦公大樓的預定翻修工程將於本季末完成。" },
  { qn:126, q:"Due to heavy traffic, the delivery truck arrived ------- than expected.", opts:["late","later","latest","lately"], ans:1, exp:"Comparative form 'later' follows 'than'.", zh:"'than' 前需比較級，'later'，選 (B)。", trans:"由於交通壅塞，送貨卡車比預期晚到。" },
  { qn:127, q:"The company's new dress code policy applies to ------- full-time and part-time employees.", opts:["either","both","neither","each"], ans:1, exp:"'Both ... and ...' connects two items inclusively.", zh:"'both ... and ...' 表兩者皆是，選 (B)。", trans:"公司的新服裝規定適用於全職和兼職員工。" },
  { qn:128, q:"Participants are asked to ------- their seats before the keynote speech begins.", opts:["find","finding","found","be find"], ans:0, exp:"After 'are asked to', the base form (infinitive) is used.", zh:"'asked to' 後接動詞原形，選 (A)。", trans:"與會者被要求在主題演講開始前就座。" },
  { qn:129, q:"The manager was ------- by the quality of the intern's final report.", opts:["impress","impression","impressive","impressed"], ans:3, exp:"Passive adjective 'impressed' describes the manager's emotional state.", zh:"表情緒狀態用過去分詞，'impressed'，選 (D)。", trans:"經理對實習生最終報告的品質印象深刻。" },
  { qn:130, q:"All ------- materials for the training workshop will be provided at no extra cost.", opts:["require","required","requirement","requiring"], ans:1, exp:"Past participle 'required' modifies the noun 'materials'.", zh:"過去分詞修飾名詞，'required'（所需的），選 (B)。", trans:"培訓工作坊所需的所有材料將免費提供。" },
  // ── Test-02 questions (qn 201–230) ──
  { qn:201, q:"The new interns enjoy ------- in cross-departmental projects because it broadens their skill sets.", opts:["participate","participating","participated","to participate"], ans:1, exp:"'Enjoy' is always followed by a gerund (verb + -ing), not an infinitive.", zh:"'enjoy' 後只能接動名詞（V-ing），選 (B)。", trans:"新進實習生喜歡參與跨部門專案，因為這能拓展他們的技能。" },
  { qn:202, q:"The ------- of the new branch office will create over fifty permanent positions in the region.", opts:["establish","established","establishment","establishing"], ans:2, exp:"A noun is required as the subject of the sentence; 'establishment' is the correct noun form.", zh:"句子需名詞作主詞，'establishment'（設立），選 (C)。", trans:"新分公司的設立將在該地區創造超過五十個固定職位。" },
  { qn:203, q:"The contract ------- by both parties, and the project will begin next Monday.", opts:["signs","is signing","has been signed","signing"], ans:2, exp:"Present perfect passive 'has been signed' indicates a completed action relevant to the present.", zh:"現在完成被動式 'has been signed' 表示已完成的動作，選 (C)。", trans:"合約已由雙方簽署，專案將於下週一開始。" },
  { qn:204, q:"The engineer ------- innovative design won the company award has been promoted to senior director.", opts:["who","whom","whose","which"], ans:2, exp:"'Whose' is a relative pronoun showing possession (the engineer's design).", zh:"'whose' 為關係代詞所有格，表示「工程師的設計」，選 (C)。", trans:"其創新設計榮獲公司獎項的工程師已晉升為資深總監。" },
  { qn:205, q:"The new policy will benefit ------- full-time employees but also contractors who work on long-term assignments.", opts:["either","not only","both","neither"], ans:1, exp:"'Not only ... but also' is a correlative conjunction pairing two elements.", zh:"'not only ... but also' 為對等相關連接詞，表示兩者皆是，選 (B)。", trans:"新政策不僅惠及全職員工，也惠及長期任務的承包商。" },
  { qn:206, q:"The shipment cannot be dispatched ------- all customs documentation has been verified and approved.", opts:["if","unless","provided that","as long as"], ans:1, exp:"'Unless' introduces a negative condition meaning 'except if'.", zh:"'unless' 引導否定條件，意為「除非……否則不」，選 (B)。", trans:"除非所有海關文件均已核實並獲批准，否則貨物不能發出。" },
  { qn:207, q:"The revised timetable requires ------- revision cycles than the original plan.", opts:["less","fewer","much","little"], ans:1, exp:"'Fewer' is used with countable nouns (revision cycles); 'less' is for uncountable nouns.", zh:"'fewer' 用於可數名詞（revision cycles），'less' 用於不可數名詞，選 (B)。", trans:"修訂後的時間表比原計畫需要更少的修訂週期。" },
  { qn:208, q:"Ms. Rivera signed the agreement ------- the entire executive committee.", opts:["on behalf of","in spite of","regardless of","prior to"], ans:0, exp:"'On behalf of' means 'as a representative of' and is the correct fixed phrase here.", zh:"'on behalf of' 表代表，為正確固定搭配，選 (A)。", trans:"Rivera 女士代表整個執行委員會簽署了協議。" },
  { qn:209, q:"The finance team ------- the quarterly figures three times before the board presentation.", opts:["checked","has checked","have checked","is checking"], ans:0, exp:"The past simple 'checked' is used because the action is finished at a specific past point (before the presentation).", zh:"動作在特定過去時間點已完成，用過去簡單式，選 (A)。", trans:"財務團隊在董事會簡報前已核對了三次季度數字。" },
  { qn:210, q:"By the time the auditors arrive next week, the accounting team ------- all the financial records.", opts:["will prepare","prepares","will have prepared","has prepared"], ans:2, exp:"'By the time + present, future perfect' shows an action that will be completed before a future point.", zh:"'By the time' 搭配未來完成式，表到某未來時間點前已完成，選 (C)。", trans:"到下週審計員抵達時，會計團隊將已準備好所有財務記錄。" },
  { qn:211, q:"The director will have the IT team ------- all company laptops with the latest security patch.", opts:["update","updates","updated","to update"], ans:0, exp:"Causative 'have + object + base form' requires the base verb (no 'to').", zh:"使役動詞 'have + 受詞 + 原形動詞'，選 (A)。", trans:"總監將讓 IT 團隊用最新安全補丁更新所有公司筆記型電腦。" },
  { qn:212, q:"You ------- review the contract carefully before signing, as it contains several binding clauses.", opts:["had better","would rather","used to","ought have"], ans:0, exp:"'Had better + base verb' gives strong advice or warning.", zh:"'had better + 原形動詞' 表強烈建議或警告，選 (A)。", trans:"您最好在簽署前仔細閱讀合約，因為其中包含若干具約束力的條款。" },
  { qn:213, q:"The demand for the new smartphone model was ------- high that the manufacturer had to increase production immediately.", opts:["very","too","so","such"], ans:2, exp:"'So + adjective + that' expresses a degree leading to a result.", zh:"'so + 形容詞 + that' 表程度導致結果，選 (C)。", trans:"新款智慧型手機的需求如此之高，製造商不得不立即增加產量。" },
  { qn:214, q:"The team leader praised the staff for their dedication, their creativity, and their ------- to meet tight deadlines.", opts:["able","ability","abilities","ability"], ans:3, exp:"Parallel structure requires a noun to match 'dedication' and 'creativity'; 'ability' is the singular noun.", zh:"平行結構需與 'dedication'、'creativity' 同為名詞，用單數 'ability'，選 (D)。", trans:"團隊領導稱讚員工的奉獻精神、創造力以及在緊迫期限下完成任務的能力。" },
  { qn:215, q:"The consultant recommended that the company ------- its pricing strategy to remain competitive.", opts:["revises","revise","revised","revising"], ans:1, exp:"After 'recommend that', the subjunctive mood requires the base form of the verb.", zh:"'recommend that' 後接假設語氣，動詞用原形，選 (B)。", trans:"顧問建議公司修訂定價策略以保持競爭力。" },
  { qn:216, q:"To reduce energy costs, the building manager suggested ------- all non-essential lights during off-peak hours.", opts:["turn off","to turn off","turned off","turning off"], ans:3, exp:"'Suggest' is followed by a gerund (verb + -ing).", zh:"'suggest' 後接動名詞（V-ing），選 (D)。", trans:"為降低能源成本，大樓管理員建議在離峰時段關閉所有非必要燈具。" },
  { qn:217, q:"The HR department issued a memo outlining the ------- benefits available to all permanent employees.", opts:["comprehend","comprehension","comprehensive","comprehensively"], ans:2, exp:"An adjective is required before the noun 'benefits'; 'comprehensive' fits the context.", zh:"修飾名詞需形容詞，'comprehensive'（全面的），選 (C)。", trans:"人資部門發布了一份備忘錄，列出所有正式員工可享有的全面福利。" },
  { qn:218, q:"All personal data collected during the registration process ------- in accordance with current privacy regulations.", opts:["will protect","will be protected","is protecting","protects"], ans:1, exp:"Future passive 'will be protected' is needed because the data is the object being acted upon.", zh:"資料是被保護的對象，用未來被動式 'will be protected'，選 (B)。", trans:"在報名過程中收集的所有個人資料將依照現行隱私法規受到保護。" },
  { qn:219, q:"All attendees must submit their presentation slides ------- the conference to allow time for technical review.", opts:["prior to","in spite of","regardless of","on behalf of"], ans:0, exp:"'Prior to' means 'before' and is used with noun phrases.", zh:"'prior to' 意為「在……之前」，後接名詞片語，選 (A)。", trans:"所有出席者必須在會議前提交簡報投影片，以便進行技術審查。" },
  { qn:220, q:"The new warehouse system has ------- reduced processing time, cutting delivery delays by 40 percent.", opts:["drama","dramatic","dramatically","dramatize"], ans:2, exp:"An adverb is needed to modify the verb 'reduced'.", zh:"修飾動詞 'reduced' 需副詞，'dramatically'，選 (C)。", trans:"新倉儲系統已顯著縮短了處理時間，將配送延誤減少了 40%。" },
  { qn:221, q:"Management is ------- relocating the headquarters to a more central location to improve accessibility.", opts:["consider","considered","considering","to consider"], ans:2, exp:"'Is considering' is the present progressive; 'consider' also takes a gerund as its complement.", zh:"'be considering' 為現在進行式，且 'consider' 後接動名詞，選 (C)。", trans:"管理層正在考慮將總部遷至更中心的地點，以提升交通便利性。" },
  { qn:222, q:"------- the technical difficulties encountered during setup, the product demonstration went ahead as scheduled.", opts:["In spite of","On behalf of","Prior to","Regardless of"], ans:0, exp:"'In spite of' introduces a concession before a noun phrase, meaning 'despite'.", zh:"'In spite of' 表讓步，後接名詞片語，意為「儘管」，選 (A)。", trans:"儘管在安裝過程中遇到技術困難，產品示範仍按計畫進行。" },
  { qn:223, q:"Please submit your leave request ------- by e-mail or through the company's online HR portal.", opts:["neither","either","both","not only"], ans:1, exp:"'Either ... or' presents two alternatives.", zh:"'either ... or' 表兩選一，選 (B)。", trans:"請透過電子郵件或公司的線上人資入口網站提交您的請假申請。" },
  { qn:224, q:"The candidate ------- the panel interviewed yesterday has accepted the job offer.", opts:["who","whom","whose","which"], ans:1, exp:"'Whom' is used as the object of the verb 'interviewed' (the panel interviewed whom).", zh:"'whom' 作動詞 'interviewed' 的受詞，選 (B)。", trans:"面試小組昨天面試的候選人已接受了工作邀約。" },
  { qn:225, q:"The project manager ------- receive weekly status updates than wait for a monthly report.", opts:["had better","would rather","used to","ought to"], ans:1, exp:"'Would rather + base verb' expresses preference.", zh:"'would rather + 原形動詞' 表偏好，選 (B)。", trans:"專案經理寧可每週收到進度更新，也不願等待每月報告。" },
  { qn:226, q:"It was ------- a successful product launch that the company immediately began planning a follow-up model.", opts:["so","such","very","too"], ans:1, exp:"'Such + a/an + adjective + noun + that' expresses a degree leading to a result.", zh:"'such + a/an + 形容詞 + 名詞 + that' 表程度導致結果，選 (B)。", trans:"這次產品發布非常成功，公司隨即開始規劃後續型號。" },
  { qn:227, q:"The orientation program is ------- three modules: company overview, safety training, and role-specific skills.", opts:["divided into","separated by","combined with","compared to"], ans:0, exp:"'Divided into' means split into parts and is the standard colocation here.", zh:"'divided into' 表「分為」，為固定搭配，選 (A)。", trans:"入職培訓計畫分為三個模組：公司概述、安全培訓和職能技能。" },
  { qn:228, q:"The company plans ------- a new research and development center in the northern district next year.", opts:["opening","opened","to open","open"], ans:2, exp:"'Plan' is followed by an infinitive (to + base form).", zh:"'plan' 後接不定詞（to + 原形動詞），選 (C)。", trans:"公司計畫明年在北區開設一個新的研發中心。" },
  { qn:229, q:"The proposal outlines ------- strategies for increasing market share in the Asia-Pacific region.", opts:["many","much","various","several of"], ans:2, exp:"'Various' (= of different types) collocates naturally with the noun 'strategies' without a preposition.", zh:"'various' 意為「各式各樣的」，直接修飾可數名詞，選 (C)。", trans:"該提案概述了在亞太地區提升市場份額的各種策略。" },
  { qn:230, q:"All employees are eligible for the year-end bonus ------- their department or seniority level.", opts:["in spite of","on behalf of","regardless of","prior to"], ans:2, exp:"'Regardless of' means 'without considering' and fits the inclusive context.", zh:"'regardless of' 意為「不論」，表不受……影響，選 (C)。", trans:"所有員工均有資格獲得年終獎金，無論其部門或資歷等級。" }
];

const Q_P6_ALL = [
  { idx:0, meta:"段落填空 — Email", label:"第 1 組",
    text:`Dear Mr. Chen,\n\nI am writing to confirm your reservation at the Meridian Hotel for the nights of March 15–17. Your room will be [131] upon your arrival at 3:00 P.M. As requested, we have arranged a non-smoking room on the tenth floor with a city view.\n\nPlease note that our complimentary breakfast is [132] from 7:00 to 10:00 A.M. in the main dining area. Should you require early check-in, we kindly ask that you contact the front desk [133] advance so that we may accommodate your request.\n\n[134] any assistance prior to your visit, please do not hesitate to contact us directly.\n\nWarm regards,\nMeridian Hotel Guest Services`,
    qs:[
      { n:131, opts:["ready","readiness","readily","readying"], ans:0, exp:"'Be ready' is the correct predicate adjective after the linking verb 'will be'.", zh:"'will be' 後接形容詞，'ready'（已準備好），選 (A)。" },
      { n:132, opts:["serve","served","serving","service"], ans:1, exp:"Passive voice: breakfast 'is served' during specific hours.", zh:"早餐「被供應」用被動，'served'，選 (B)。" },
      { n:133, opts:["in","on","with","for"], ans:0, exp:"'In advance' is a fixed prepositional phrase meaning ahead of time.", zh:"'in advance' 為固定搭配，表提前，選 (A)。" },
      { n:134, opts:["If you need","Should you require","Requiring","You need"], ans:1, exp:"'Should + subject + verb' is a formal conditional inversion used in business writing.", zh:"'Should you require' 為正式倒裝條件句，選 (B)。" }
    ]
  },
  { idx:1, meta:"段落填空 — Notice", label:"第 2 組",
    text:`NOTICE TO ALL STAFF\n\nEffective Monday, April 7, the building management will [135] routine maintenance on the elevators in the north wing. As a result, these elevators will be [136] from 8:00 A.M. to 5:00 P.M. on weekdays for approximately two weeks.\n\nDuring this period, employees are encouraged to use the south wing elevators or the stairwells, which remain fully accessible. We apologize for any [137] this may cause. [138]\n\nThank you for your cooperation.\nBuilding Management`,
    qs:[
      { n:135, opts:["conduct","conducts","conducted","be conducting"], ans:0, exp:"'Will + base form' is the standard future tense construction.", zh:"'will' 後接原形動詞，選 (A)。" },
      { n:136, opts:["operational","unavailable","expanded","relocated"], ans:1, exp:"The context says maintenance will occur, so elevators will be 'unavailable'.", zh:"進行維護期間電梯「無法使用」，選 (B)。" },
      { n:137, opts:["convenient","inconvenience","convenience","inconveniently"], ans:1, exp:"A noun is needed after 'any'; 'inconvenience' fits the context.", zh:"'any' 後接名詞，不便之處用 'inconvenience'，選 (B)。" },
      { n:138, opts:["We look forward to serving you.","Your patience and understanding are greatly appreciated.","Please submit your complaints in writing.","The elevator will not return to service."], ans:1, exp:"A closing sentence thanking people for patience fits the apology context.", zh:"結尾感謝耐心配合，語意最自然，選 (B)。" }
    ]
  },
  { idx:2, meta:"段落填空 — Memorandum", label:"第 3 組",
    text:`MEMORANDUM\n\nTo: All Department Heads\nFrom: Human Resources\nRe: Annual Performance Review Schedule\n\nThis memo is to inform you that the annual performance review cycle will begin on May 1. All department heads are [139] to submit completed evaluation forms for each of their direct reports no later than May 31.\n\nThe forms are available for download on the company intranet. Please ensure that evaluations are [140] and objective, focusing on measurable achievements and areas for professional growth. Reviews that are [141] incomplete or improperly completed will be returned for revision.\n\n[142] questions about the process, please contact the HR department at extension 204.\n\nThank you.`,
    qs:[
      { n:139, opts:["requested","requesting","request","to request"], ans:0, exp:"'Are requested to' is a formal passive construction meaning 'are asked to'.", zh:"'are requested to' 為正式被動，表要求，選 (A)。" },
      { n:140, opts:["thorough","thoroughly","thoroughness","thoroughfare"], ans:0, exp:"Two adjectives joined by 'and' are needed: 'thorough and objective'.", zh:"與 'objective' 並列需形容詞，'thorough'，選 (A)。" },
      { n:141, opts:["considered","determined","deemed","found"], ans:2, exp:"'Deemed' means 'judged to be'; it collocates naturally with 'incomplete'.", zh:"'deemed' 表判定為，搭配 'incomplete' 最自然，選 (C)。" },
      { n:142, opts:["For","About","Regarding","Should you have"], ans:3, exp:"'Should you have questions' is a formal conditional inversion appropriate for memos.", zh:"正式備忘錄常用 'Should you have...' 倒裝條件句，選 (D)。" }
    ]
  },
  { idx:3, meta:"段落填空 — Advertisement", label:"第 4 組",
    text:`GREENLEAF CORPORATE CATERING\nFresh · Flexible · Reliable\n\nIs your office [143] the right catering partner? Look no further than Greenleaf Corporate Catering, your trusted provider of healthy, delicious meals for business events of all sizes.\n\nWe offer fully customizable menus [144] a variety of dietary requirements, including vegetarian, vegan, and gluten-free options. Whether you are planning a team lunch, a board meeting, or a company-wide celebration, our professional staff will ensure your event runs [145].\n\nContact us today to receive a complimentary quote. [146] orders placed at least 72 hours in advance will qualify for our early-booking discount of 10%.\n\nVisit us at www.greenleafcatering.com`,
    qs:[
      { n:143, opts:["searching for","searched","in search","to search"], ans:0, exp:"'Is your office searching for...' is the natural progressive form for a question.", zh:"疑問句用進行式，'searching for'，選 (A)。" },
      { n:144, opts:["catered to","accommodating","satisfying","meeting"], ans:1, exp:"'Accommodating a variety of dietary requirements' means catering to different dietary needs.", zh:"'accommodating' 表顧及各種需求，搭配最自然，選 (B)。" },
      { n:145, opts:["smooth","smoothly","smoothness","smoother"], ans:1, exp:"An adverb modifies the verb 'runs'.", zh:"修飾動詞 'runs' 需副詞，'smoothly'，選 (B)。" },
      { n:146, opts:["All","Any","Every","Each"], ans:0, exp:"'All orders' refers collectively to the entire category of orders meeting the condition.", zh:"'All orders' 指所有符合條件的訂單，選 (A)。" }
    ]
  },
  // ── Test-02 P6 passages (第 5–8 組) ──
  { idx:4, meta:"段落填空 — Email", label:"第 5 組",
    text:`Dear Ms. Watanabe,\n\nThis is a reminder that Invoice #4892 for the amount of $3,450.00 is now [1] by 30 days. We kindly ask that you arrange payment at your earliest convenience.\n\nIf you have already processed this payment, please disregard this notice. [2], please contact our billing department at billing@axiomservices.com to discuss payment options.\n\nWe value our ongoing business [3] and hope to resolve this matter promptly. Please note that continued non-payment may result in the [4] of services as outlined in your service agreement.\n\nThank you for your attention to this matter.\n\nSincerely,\nAxiom Services Accounts Receivable`,
    qs:[
      { n:1, opts:["overdue","pending","issued","submitted"], ans:0, exp:"'Overdue by 30 days' means the payment is late by 30 days; this is standard billing language.", zh:"'overdue by 30 days' 意為逾期 30 天，為帳單標準用語，選 (A)。" },
      { n:2, opts:["Otherwise","Therefore","However","Moreover"], ans:0, exp:"'Otherwise' introduces the alternative action if payment hasn't been made yet.", zh:"'Otherwise' 引導相反情況的後續行動，選 (A)。" },
      { n:3, opts:["relation","relating","relationship","relatedly"], ans:2, exp:"'Business relationship' is a fixed collocation requiring the noun 'relationship'.", zh:"'business relationship' 為固定搭配，需名詞，選 (C)。" },
      { n:4, opts:["suspension","suspending","suspend","suspended"], ans:0, exp:"'The suspension of services' uses the noun form as the object of the preposition 'in'.", zh:"介系詞 'in' 後需名詞，'suspension of services' 為正確用法，選 (A)。" }
    ]
  },
  { idx:5, meta:"段落填空 — Announcement", label:"第 6 組",
    text:`ANNOUNCEMENT TO ALL STAFF\n\nWe are pleased to inform you that Meridian Consulting will be [1] its headquarters to a new location effective March 1. Our new address will be 450 Lakeview Boulevard, Suite 1200.\n\nThe move is [2] to take three days (February 26–28). During this period, staff are asked to work remotely. IT support will be available throughout the transition to ensure minimal disruption.\n\nAll client meetings [3] during the relocation period should be rescheduled. Please coordinate with your clients directly. [4]\n\nWe appreciate your flexibility and cooperation during this exciting transition.\n\nManagement`,
    qs:[
      { n:1, opts:["relocating","relocated","to relocate","relocation"], ans:0, exp:"'Will be relocating' is the future progressive; here 'relocating' completes 'will be relocating'.", zh:"填入 'relocating' 構成未來進行式 'will be relocating'，選 (A)。" },
      { n:2, opts:["expected","expecting","expectation","expects"], ans:0, exp:"'Is expected to' is the correct passive construction meaning 'is anticipated to'.", zh:"'is expected to' 為正式被動結構，表預計，選 (A)。" },
      { n:3, opts:["scheduling","scheduled","schedule","to schedule"], ans:1, exp:"Past participle 'scheduled' acts as an adjective modifying 'client meetings'.", zh:"過去分詞作形容詞修飾 'client meetings'，選 (B)。" },
      { n:4, opts:["Updated contact information will be circulated by February 20.","The old office will remain open until further notice.","Please report to the new office starting February 26.","All staff must submit a relocation request form."], ans:0, exp:"This sentence provides a practical follow-up action — sharing updated contact details — which fits naturally after the scheduling instruction.", zh:"此句提供實際後續行動（發布新聯絡資訊），語意最自然，選 (A)。" }
    ]
  },
  { idx:6, meta:"段落填空 — Notice", label:"第 7 組",
    text:`PROFESSIONAL DEVELOPMENT WORKSHOP\nEffective Business Communication Skills\n\nThe Human Resources Department is pleased to [1] a two-day workshop on business communication for all mid-level managers. The workshop will cover written, verbal, and presentation skills.\n\nDates: May 14–15 | Location: Training Room B, 3rd Floor\nRegistration Deadline: May 7\n\nParticipation is strongly [2], as these skills are directly linked to individual performance evaluations. Seats are limited to 20 participants per session, so early registration is [3].\n\nTo register, please complete the online form on the company intranet. [4] any questions regarding the content or scheduling, contact Ms. Park at extension 215.\n\nWe look forward to your participation.`,
    qs:[
      { n:1, opts:["announce","announcing","announced","announcement"], ans:0, exp:"'Is pleased to announce' uses the base form after the infinitive marker 'to'.", zh:"'is pleased to' 後接原形動詞，選 (A)。" },
      { n:2, opts:["encourage","encouragement","encouraged","encouraging"], ans:2, exp:"'Is strongly encouraged' is a passive construction; 'encouraged' is the past participle.", zh:"'is strongly encouraged' 為被動式，需過去分詞，選 (C)。" },
      { n:3, opts:["advised","advisable","advising","advise"], ans:1, exp:"'Is advisable' means 'is recommended'; it is an adjective used after a linking verb.", zh:"'is advisable' 意為「建議的」，形容詞接連綴動詞，選 (B)。" },
      { n:4, opts:["For","About","To have","Should you have"], ans:3, exp:"'Should you have any questions' is a formal conditional inversion common in professional notices.", zh:"'Should you have' 為正式倒裝條件句，適用於公告，選 (D)。" }
    ]
  },
  { idx:7, meta:"段落填空 — Press Release", label:"第 8 組",
    text:`FOR IMMEDIATE RELEASE\n\nVortex Technologies [1] Its Next-Generation Smart Home Hub\n\nSan Francisco, CA — Vortex Technologies today announced the official launch of the VortexHome 3, its most [2] smart home hub to date. The device integrates seamlessly with all major home automation platforms and features an upgraded AI assistant.\n\n"We designed VortexHome 3 with the consumer [3] mind," said CEO James Thornton. "Every feature has been refined based on user feedback."\n\nThe VortexHome 3 will be [4] exclusively through the Vortex online store and select retail partners beginning June 15. Retail price is set at $199.\n\nFor media inquiries, contact press@vortextech.com.`,
    qs:[
      { n:1, opts:["Launches","Launching","Launched","Launch"], ans:0, exp:"Press releases typically use third-person present simple for immediate announcements.", zh:"新聞稿使用第三人稱現在簡單式表即時宣告，選 (A)。" },
      { n:2, opts:["advance","advancing","advanced","advancement"], ans:2, exp:"'Most advanced' is the superlative adjective form needed before the noun 'smart home hub'.", zh:"最高級形容詞 'most advanced' 修飾名詞，選 (C)。" },
      { n:3, opts:["in","on","at","with"], ans:0, exp:"'With the consumer in mind' is a fixed idiom meaning 'considering the consumer'.", zh:"'with ... in mind' 為固定慣用語，表「以……為考量」，選 (A)。" },
      { n:4, opts:["available","availability","availably","avail"], ans:0, exp:"'Will be available' uses the adjective 'available' after the linking verb 'be'.", zh:"'will be available' 中 'available' 為形容詞接 'be'，選 (A)。" }
    ]
  }
];

const Q_P7_ALL = [
  { label:"第 1 組 — E-mail", type:"single",
    passage:`<div class="doc-label">E-mail</div><p><strong>From:</strong> j.harris@veritastech.com<br><strong>To:</strong> allstaff@veritastech.com<br><strong>Subject:</strong> Office Closure — Public Holiday</p><p>Dear Team,</p><p>This is a reminder that the office will be closed on Monday, April 7, in observance of the national public holiday. Normal business hours will resume on Tuesday, April 8.</p><p>If you have any urgent matters that require attention during the closure, please contact the on-call support team at support@veritastech.com. Response times may be longer than usual.</p><p>Enjoy the long weekend!</p><p>Best,<br>Janet Harris<br>Office Manager, Veritas Technology</p>`,
    qs:[
      { n:1, q:"Why was the e-mail sent?", opts:["To announce a new support policy","To inform staff of an office closure","To introduce a new office manager","To reschedule a team meeting"], ans:1, exp:"The e-mail clearly states the office will be closed on April 7.", zh:"郵件主旨為告知辦公室關閉，選 (B)。" },
      { n:2, q:"What are employees told to do for urgent matters?", opts:["Call Janet Harris directly","Submit a written request","E-mail the on-call support team","Wait until Tuesday"], ans:2, exp:"The e-mail says to contact the on-call support team at support@veritastech.com.", zh:"郵件指示聯繫 on-call 支援小組，選 (C)。" }
    ]
  },
  { label:"第 2 組 — Notice", type:"single",
    passage:`<div class="doc-label">Notice</div><h4>CITY LIBRARY — SUMMER READING PROGRAM</h4><p>The City Library is pleased to announce the launch of its annual Summer Reading Program, running from June 1 to August 31. This year's theme is <em>"Explore the World Through Books."</em></p><p>Participants of all ages are welcome. Children aged 5–12 who complete at least eight books will receive a Certificate of Achievement. Adults who log 15 or more books will be entered into a prize draw for a $200 gift card.</p><p>To register, visit the front desk or sign up online at www.citylibrary.org/summer. Registration is free. The program begins June 1; registration closes May 25.</p>`,
    qs:[
      { n:1, q:"What is the theme of this year's Summer Reading Program?", opts:["Discovering Local Heroes","Explore the World Through Books","Science and Technology","Celebrating Community Stories"], ans:1, exp:"The notice states the theme is 'Explore the World Through Books'.", zh:"公告明確指出主題，選 (B)。" },
      { n:2, q:"What will children who complete at least eight books receive?", opts:["A gift card","A free library membership","A Certificate of Achievement","A prize draw entry"], ans:2, exp:"Children completing eight books receive a Certificate of Achievement.", zh:"8本以上獲頒成就證書，選 (C)。" },
      { n:3, q:"When is the deadline for registration?", opts:["June 1","August 31","May 25","July 1"], ans:2, exp:"Registration closes May 25.", zh:"報名截止 5 月 25 日，選 (C)。" }
    ]
  },
  { label:"第 3 組 — Article", type:"single",
    passage:`<div class="doc-label">Business News</div><h4>NEXWAVE COMMUNICATIONS EXPANDS INTO SOUTHEAST ASIA</h4><p>NexWave Communications, a leading provider of cloud-based business software, announced on Tuesday that it will open regional offices in Singapore and Jakarta by the end of the year. The expansion is part of the company's five-year growth strategy.</p><p>CEO Maria Delgado stated the company plans to hire approximately 200 local employees across both locations. "Southeast Asia represents an enormous growth opportunity," said Delgado. "We are committed to hiring local talent and building solutions tailored to regional needs."</p><p>NexWave currently operates in 14 countries and reported annual revenues of $1.2 billion last year.</p>`,
    qs:[
      { n:1, q:"What did NexWave Communications announce?", opts:["A new software product launch","Quarterly revenue results","Plans to open offices in Southeast Asia","A merger with a competitor"], ans:2, exp:"The article states NexWave will open offices in Singapore and Jakarta.", zh:"宣布將在東南亞開設辦事處，選 (C)。" },
      { n:2, q:"According to the CEO, what is one of NexWave's goals?", opts:["Reducing operational costs","Hiring local talent","Acquiring a local company","Relocating its headquarters"], ans:1, exp:"Delgado says they are 'committed to hiring local talent'.", zh:"CEO 表示致力於雇用當地人才，選 (B)。" },
      { n:3, q:"How many countries does NexWave currently operate in?", opts:["2","8","14","20"], ans:2, exp:"The article states NexWave currently operates in 14 countries.", zh:"文中明確指出 14 個國家，選 (C)。" }
    ]
  },
  { label:"第 4 組 — Memo", type:"single",
    passage:`<div class="doc-label">Internal Memo</div><p><strong>To:</strong> All Staff<br><strong>From:</strong> IT Department<br><strong>Re:</strong> Mandatory System Update</p><p>The IT department will perform a critical security update to all company computers this weekend. The update will be applied automatically on Saturday evening between 10:00 P.M. and 3:00 A.M.</p><p>All employees must leave their computers powered on and connected to the company network before leaving on Friday afternoon. Laptops taken home should be left connected to power and Wi-Fi.</p><p>After the update, you may notice the login screen has a slightly different appearance. Your username and password will remain unchanged. For issues, contact the IT help desk at extension 301 or helpdesk@company.com.</p>`,
    qs:[
      { n:1, q:"What is the purpose of this memo?", opts:["To announce a new company policy","To notify staff of a mandatory IT update","To introduce new login credentials","To schedule a system shutdown"], ans:1, exp:"The memo informs staff about a mandatory security update.", zh:"備忘錄通知員工進行強制安全更新，選 (B)。" },
      { n:2, q:"What must employees do before leaving on Friday?", opts:["Back up all their files","Log out of all applications","Leave computers on and connected to the network","Submit a support request"], ans:2, exp:"Staff must leave computers powered on and connected to the company network.", zh:"員工須讓電腦保持開機並連接公司網路，選 (C)。" },
      { n:3, q:"What will change after the update?", opts:["Login credentials","The login screen appearance","The company Wi-Fi password","The email system"], ans:1, exp:"The login screen may have a slightly different appearance.", zh:"登入畫面外觀可能略有不同，選 (B)。" },
      { n:4, q:"Who should employees contact if they have problems?", opts:["Their direct supervisor","The HR department","The IT help desk","The building manager"], ans:2, exp:"Contact the IT help desk at extension 301 or helpdesk@company.com.", zh:"聯繫 IT 服務台，選 (C)。" }
    ]
  },
  { label:"第 5 組 — Double Passage", type:"double",
    passages:[
      { content:`<div class="doc-label">Job Posting</div><h4>MARKETING COORDINATOR</h4><p><strong>Company:</strong> BrightPath Media &nbsp;·&nbsp; Chicago, IL (Hybrid)</p><p>BrightPath Media seeks a creative Marketing Coordinator. The ideal candidate will have at least two years of digital marketing experience, excellent written communication skills, and proficiency in social media management tools.</p><p><strong>Responsibilities:</strong> Developing campaigns, managing social media, coordinating vendors, preparing weekly reports.<br><strong>Salary:</strong> $48,000–$58,000/year.<br><strong>Deadline:</strong> April 20. Send resume to careers@brightpathmedia.com</p>` },
      { content:`<div class="doc-label">Cover Letter</div><p>April 14</p><p>Dear Hiring Manager,</p><p>I am writing to apply for the Marketing Coordinator position. I hold a Bachelor's degree in Communications and have three years of experience managing digital marketing campaigns for a mid-size retail company.</p><p>I oversee social media across five platforms and prepare detailed analytics reports. I am proficient in Hootsuite, Sprout Social, and Google Analytics.</p><p>I am excited about BrightPath's reputation for innovative storytelling. I believe my skills align closely with your team's needs.</p><p>Sincerely,<br>Priya Mehta</p>` }
    ],
    qs:[
      { n:1, q:"What type of work arrangement does BrightPath Media offer?", opts:["Fully remote","Fully in-office","Hybrid","Contract only"], ans:2, exp:"The job posting specifies 'Hybrid'.", zh:"職位說明指明為混合辦公模式，選 (C)。" },
      { n:2, q:"How does Priya Mehta exceed the experience requirement?", opts:["She has a graduate degree","She has three years of experience","She has managed a team of 10 people","She has worked at a media company before"], ans:1, exp:"Priya has three years, exceeding the required two years.", zh:"Priya 有三年經驗，超過所需的兩年，選 (B)。" },
      { n:3, q:"By what date must applications be submitted?", opts:["April 1","April 14","April 20","April 30"], ans:2, exp:"The application deadline is April 20.", zh:"申請截止日為 4 月 20 日，選 (C)。" }
    ]
  },
  { label:"第 6 組 — Report", type:"single",
    passage:`<div class="doc-label">Quarterly Report</div><h4>BLOOMFIELD RETAIL GROUP — Q1 SUMMARY</h4><p>Bloomfield Retail Group reported total revenues of $84.7 million for Q1, a 12% increase year-over-year. Growth was driven by online sales, which grew 34% and now account for 41% of total revenue.</p><p>In contrast, in-store sales declined by 3% due to construction near two flagship locations in the downtown district.</p><p>The company plans to invest $15 million in logistics infrastructure over the next 18 months. CEO Thomas Bloom stated, "We are confident our digital-first strategy positions us for sustainable long-term growth."</p><p>Bloomfield expects Q2 revenues of $88–$92 million.</p>`,
    qs:[
      { n:1, q:"What was Bloomfield's total Q1 revenue?", opts:["$74.7 million","$84.7 million","$88 million","$92 million"], ans:1, exp:"The report states total revenues of $84.7 million for Q1.", zh:"Q1 總營收為 8,470 萬美元，選 (B)。" },
      { n:2, q:"Why did in-store sales decline?", opts:["Poor product selection","Price competition","Construction near flagship stores","Decreased marketing spending"], ans:2, exp:"The decline is attributed to construction near downtown stores.", zh:"市中心旗艦店附近施工導致客流量減少，選 (C)。" },
      { n:3, q:"What investment does Bloomfield plan to make?", opts:["$84.7 million in renovations","$15 million in logistics infrastructure","$34 million in digital marketing","$12 million in new stores"], ans:1, exp:"Bloomfield plans to invest $15 million in logistics infrastructure.", zh:"計畫投資 1,500 萬美元於物流基礎設施，選 (B)。" },
      { n:4, q:"What are the expected Q2 revenues?", opts:["$80–84 million","$84–88 million","$88–92 million","Over $100 million"], ans:2, exp:"The company expects Q2 revenues between $88 and $92 million.", zh:"Q2 預期營收 8,800 至 9,200 萬美元，選 (C)。" }
    ]
  },
  // ── Test-02 P7 sets (第 7–20 組) ──
  { label:"第 7 組 — E-mail", type:"single",
    passage:`<div class="doc-label">E-mail</div><p><strong>From:</strong> d.kim@globalpartners.com<br><strong>To:</strong> s.lee@globalpartners.com<br><strong>Subject:</strong> RE: Business Trip to Tokyo — Approval Request<br><strong>Date:</strong> Monday, April 14</p><p>Dear Mr. Lee,</p><p>Thank you for submitting your travel request for the Tokyo client summit scheduled for May 5–7. After reviewing the details, I am pleased to approve the trip.</p><p>Please book your flights and hotel through the corporate travel portal and ensure all bookings are completed by April 25. Keep all receipts for reimbursement. The daily meal allowance is $60.</p><p>Safe travels,<br>Diana Kim<br>Finance Manager, Global Partners Inc.</p>`,
    qs:[
      { n:1, q:"What is the purpose of this e-mail?", opts:["To request approval for a business trip","To approve a business trip","To cancel a conference","To introduce a new travel policy"], ans:1, exp:"Diana Kim writes to confirm she is approving Mr. Lee's travel request.", zh:"Diana Kim 回覆以批准出差申請，選 (B)。" },
      { n:2, q:"What is Mr. Lee asked to do by April 25?", opts:["Submit his expense report","Complete flight and hotel bookings","Attend a budget meeting","Send a client summary"], ans:1, exp:"The e-mail instructs that all bookings must be completed by April 25.", zh:"郵件指示需在 4 月 25 日前完成機票和酒店預訂，選 (B)。" }
    ]
  },
  { label:"第 8 組 — Notice", type:"single",
    passage:`<div class="doc-label">Notice</div><h4>PARKING GARAGE CLOSURE — LEVEL B2</h4><p>Please be advised that Level B2 of the Harrington Tower parking garage will be closed for structural maintenance from Monday, June 2, through Friday, June 13. The closure is necessary to complete safety inspections required by the city.</p><p>During this period, employees who normally park on Level B2 are encouraged to use the overflow parking lot located at 88 Commerce Street, approximately a five-minute walk from the main entrance. A shuttle service will operate between the overflow lot and the building entrance from 7:30 A.M. to 7:00 P.M. on business days.</p><p>Monthly pass holders will not be charged for the affected period. For questions, contact Facilities Management at ext. 350.</p>`,
    qs:[
      { n:1, q:"Why is Level B2 being closed?", opts:["For construction of additional spaces","For safety inspections required by the city","Due to flooding damage","To install new lighting systems"], ans:1, exp:"The notice states the closure is necessary to complete safety inspections required by the city.", zh:"公告指出關閉是為了完成城市規定的安全檢查，選 (B)。" },
      { n:2, q:"Where is the overflow parking lot located?", opts:["In Level B1 of Harrington Tower","At 88 Commerce Street","In front of the main entrance","On Level B3"], ans:1, exp:"The overflow parking lot is at 88 Commerce Street.", zh:"臨時停車場位於商業街 88 號，選 (B)。" },
      { n:3, q:"What benefit do monthly pass holders receive during the closure?", opts:["Free shuttle service upgrades","A refund of their annual fee","No charge for the affected period","A temporary parking permit"], ans:2, exp:"Monthly pass holders will not be charged for the affected period.", zh:"月票持有者在受影響期間無需繳費，選 (C)。" }
    ]
  },
  { label:"第 9 組 — Article", type:"single",
    passage:`<div class="doc-label">Business News</div><h4>PINNACLE INDUSTRIES LAUNCHES AMBITIOUS SUSTAINABILITY INITIATIVE</h4><p>Pinnacle Industries announced on Wednesday a comprehensive environmental sustainability program aimed at reducing its carbon footprint by 50 percent by 2030. The initiative, called GreenCore, will include switching all manufacturing facilities to renewable energy sources and eliminating single-use plastics from all operations by 2026.</p><p>Chief Sustainability Officer Dr. Elena Vasquez stated that the company had already reduced energy consumption by 18 percent last year through facility upgrades. "GreenCore represents our long-term commitment to responsible business practice," she said.</p><p>Pinnacle will invest $40 million over five years in green technology and employee sustainability training. The company also plans to partner with three local universities to conduct joint research on sustainable manufacturing processes.</p>`,
    qs:[
      { n:1, q:"What is the main goal of the GreenCore initiative?", opts:["To increase annual revenue by 50 percent","To reduce carbon footprint by 50 percent by 2030","To hire 40 million new employees","To partner with international universities"], ans:1, exp:"The article states GreenCore aims to reduce the carbon footprint by 50 percent by 2030.", zh:"文中指出 GreenCore 目標為在 2030 年前減少 50% 碳足跡，選 (B)。" },
      { n:2, q:"According to Dr. Vasquez, what did Pinnacle achieve last year?", opts:["Reduced energy consumption by 18 percent","Eliminated all single-use plastics","Invested $40 million in technology","Hired a new sustainability team"], ans:0, exp:"Dr. Vasquez says the company reduced energy consumption by 18 percent last year.", zh:"Vasquez 博士表示去年能源消耗減少了 18%，選 (A)。" },
      { n:3, q:"What does Pinnacle plan to do with local universities?", opts:["Hire their graduates for green roles","Fund new campus buildings","Conduct joint research on sustainable manufacturing","Offer employee scholarships"], ans:2, exp:"Pinnacle plans to partner with three local universities for joint research on sustainable manufacturing.", zh:"計畫與三所大學合作進行永續製造研究，選 (C)。" }
    ]
  },
  { label:"第 10 組 — Advertisement", type:"single",
    passage:`<div class="doc-label">Advertisement</div><h4>ADVANCE YOUR CAREER WITH SKILLBRIDGE PRO</h4><p>Are you ready to take your professional skills to the next level? SkillBridge Pro offers industry-recognized online certification courses in project management, data analytics, digital marketing, and supply chain operations.</p><p><strong>Why choose SkillBridge Pro?</strong></p><p>• Self-paced learning — study at your own schedule<br>• Expert instructors with 10+ years of industry experience<br>• Certificate recognized by over 500 global employers<br>• 30-day money-back guarantee</p><p>Enroll before May 31 and receive 20% off any course. Use promo code <strong>CAREER20</strong> at checkout.</p><p>Visit www.skillbridgepro.com or call 1-800-555-0193 to speak with an enrollment advisor.</p>`,
    qs:[
      { n:1, q:"What type of courses does SkillBridge Pro offer?", opts:["Language and translation programs","Industry-recognized professional certification courses","University degree programs","On-site corporate training only"], ans:1, exp:"The advertisement describes industry-recognized online certification courses.", zh:"廣告描述業界認可的線上認證課程，選 (B)。" },
      { n:2, q:"What discount is available before May 31?", opts:["10% off with any promo code","Free enrollment for new users","20% off any course","30% off project management courses"], ans:2, exp:"Enrolling before May 31 with promo code CAREER20 gives 20% off.", zh:"在 5 月 31 日前報名可享九折優惠，選 (C)。" },
      { n:3, q:"What is mentioned as a benefit of SkillBridge Pro?", opts:["Guaranteed job placement","A 30-day money-back guarantee","Free textbooks for all courses","Unlimited access for life"], ans:1, exp:"The advertisement lists a 30-day money-back guarantee as one of the benefits.", zh:"廣告列出 30 天退款保證為優點之一，選 (B)。" }
    ]
  },
  { label:"第 11 組 — Business Letter", type:"single",
    passage:`<div class="doc-label">Business Letter</div><p>April 10<br>Purchasing Department<br>Orion Manufacturing Co.<br>14 Industrial Park Road<br>Detroit, MI 48201</p><p>Dear Purchasing Manager,</p><p>I am writing on behalf of Westfield Supplies Ltd. to request a price quotation for bulk orders of stainless steel fasteners (catalog nos. SS-204 and SS-310). We are currently evaluating suppliers for a 12-month contract beginning July 1.</p><p>We anticipate ordering approximately 50,000 units per quarter. We would appreciate a breakdown of unit pricing at various volume levels, along with your standard delivery lead times and payment terms.</p><p>Please send your quotation by April 28. If you have any questions, contact me directly at r.santos@westfieldsupplies.com or at (313) 555-0187.</p><p>Yours sincerely,<br>Robert Santos<br>Procurement Manager, Westfield Supplies Ltd.</p>`,
    qs:[
      { n:1, q:"What is the purpose of this letter?", opts:["To confirm a purchase order","To request a price quotation","To report a product defect","To cancel an existing contract"], ans:1, exp:"Robert Santos writes to request a price quotation from Orion Manufacturing.", zh:"Robert Santos 致函請求報價，選 (B)。" },
      { n:2, q:"How many units does Westfield anticipate ordering per quarter?", opts:["12,000","50,000","100,000","204,000"], ans:1, exp:"The letter states approximately 50,000 units per quarter.", zh:"信中預估每季訂購約 50,000 件，選 (B)。" },
      { n:3, q:"By what date should the quotation be sent?", opts:["April 10","April 20","April 28","July 1"], ans:2, exp:"The letter requests the quotation by April 28.", zh:"信中要求於 4 月 28 日前送達報價，選 (C)。" }
    ]
  },
  { label:"第 12 組 — Online FAQ", type:"single",
    passage:`<div class="doc-label">Online FAQ</div><h4>NEXREAD PREMIUM — FREQUENTLY ASKED QUESTIONS</h4><p><strong>Q: Can I cancel my subscription at any time?</strong><br>Yes. You may cancel your NexRead Premium subscription at any time through your account settings. Cancellations take effect at the end of your current billing cycle. You will continue to have access to all premium content until that date.</p><p><strong>Q: Is there a free trial available?</strong><br>New subscribers are eligible for a 14-day free trial. No credit card is required during the trial period. If you choose not to continue, simply cancel before the trial ends.</p><p><strong>Q: Can I share my account with family members?</strong><br>The Individual Plan supports one user per account. However, the Family Plan allows up to five users to share a single subscription at a reduced per-person cost. You can upgrade your plan at any time from the account dashboard.</p>`,
    qs:[
      { n:1, q:"When does a cancellation take effect?", opts:["Immediately upon cancellation","At the end of the current billing cycle","After 30 days","On the first of the following month"], ans:1, exp:"The FAQ states cancellations take effect at the end of the current billing cycle.", zh:"FAQ 說明取消在當前計費週期結束時生效，選 (B)。" },
      { n:2, q:"What is required to start a free trial?", opts:["A valid credit card","Referral from an existing member","Payment of a registration fee","Nothing — no credit card required"], ans:3, exp:"The FAQ states no credit card is required during the trial period.", zh:"試用期不需信用卡，選 (D)。" },
      { n:3, q:"How many users can share a Family Plan?", opts:["One","Two","Three","Five"], ans:3, exp:"The Family Plan allows up to five users to share a single subscription.", zh:"家庭方案最多可供五位用戶共用，選 (D)。" }
    ]
  },
  { label:"第 13 組 — Internal Memo", type:"single",
    passage:`<div class="doc-label">Internal Memo</div><p><strong>To:</strong> All Staff<br><strong>From:</strong> Finance Department<br><strong>Re:</strong> Updated Business Travel Expense Policy<br><strong>Date:</strong> April 1</p><p>Effective May 1, the company is implementing several updates to the Business Travel Expense Policy. Please review the following key changes:</p><p><strong>1. Pre-Approval Requirement:</strong> All domestic travel costing more than $500 must be pre-approved by your department head at least five business days before departure. International travel requires Finance Department approval.</p><p><strong>2. Meal Allowances:</strong> Daily meal allowances have been revised. Domestic travel: $75 per day. International travel: $120 per day. Receipts are required for all individual meal expenses exceeding $25.</p><p><strong>3. Hotel Standards:</strong> Employees should book hotels at or below the government per diem rate for the destination city. Any hotel exceeding this rate requires prior written approval.</p><p><strong>4. Submission Deadline:</strong> All expense reports must be submitted within 15 business days of returning from travel. Late submissions may not be reimbursed.</p><p>The updated policy document is available on the company intranet. For questions, contact the Finance Department at finance@company.com.</p>`,
    qs:[
      { n:1, q:"When does the updated travel policy take effect?", opts:["April 1","April 5","May 1","May 15"], ans:2, exp:"The memo states the policy is effective May 1.", zh:"備忘錄指出新政策自 5 月 1 日起生效，選 (C)。" },
      { n:2, q:"Who must approve domestic travel costing more than $500?", opts:["The Finance Department","A travel coordinator","The employee's department head","The CEO"], ans:1, exp:"Domestic travel over $500 must be pre-approved by the department head.", zh:"超過 500 美元的國內出差需部門主管預先批准，選 (B)。" },
      { n:3, q:"What is the daily meal allowance for international travel?", opts:["$50","$75","$100","$120"], ans:3, exp:"The revised international daily meal allowance is $120 per day.", zh:"國際出差每日餐費津貼為 120 美元，選 (D)。" },
      { n:4, q:"What happens if an expense report is submitted late?", opts:["The employee receives a warning","The report is automatically rejected","The expense may not be reimbursed","The employee must resubmit within 5 days"], ans:2, exp:"The memo states that late submissions may not be reimbursed.", zh:"備忘錄指出逾期提交可能不獲報銷，選 (C)。" }
    ]
  },
  { label:"第 14 組 — Article", type:"single",
    passage:`<div class="doc-label">Business News</div><h4>CRESTLINE FINANCIAL OPENS STATE-OF-THE-ART HEADQUARTERS IN AUSTIN</h4><p>Crestline Financial Group officially opened its new corporate headquarters in Austin, Texas, on Friday. The 22-story tower, located at 1 Capital Plaza, consolidates operations from three separate locations into a single, modern facility.</p><p>The building features open-plan workspaces, four dedicated innovation labs, a rooftop garden, and an on-site fitness center. Crestline CEO Patricia Huang called the opening "a defining moment" for the company, which was founded in 1998 and now employs over 3,500 people globally.</p><p>The construction project, which began in January 2023, was completed on time and within its $180 million budget. The building has received LEED Gold certification for its energy-efficient design, including solar panels covering 30 percent of the rooftop.</p><p>Approximately 1,200 employees from the Austin region have relocated to the new headquarters. The company has no plans to reduce its workforce at other locations.</p>`,
    qs:[
      { n:1, q:"What is the main purpose of the new headquarters?", opts:["To house a new research division","To consolidate operations from three separate locations","To serve as a training center for new hires","To replace the company's overseas offices"], ans:1, exp:"The article states the new tower consolidates operations from three separate locations.", zh:"新大樓將三個分散地點的業務整合在一處，選 (B)。" },
      { n:2, q:"When was Crestline Financial founded?", opts:["1988","1998","2003","2023"], ans:1, exp:"The article states Crestline was founded in 1998.", zh:"文中指出 Crestline 成立於 1998 年，選 (B)。" },
      { n:3, q:"What environmental recognition did the building receive?", opts:["LEED Platinum certification","LEED Gold certification","ISO 14001 certification","Green Star rating"], ans:1, exp:"The building received LEED Gold certification for its energy-efficient design.", zh:"大樓因節能設計獲得 LEED 黃金認證，選 (B)。" },
      { n:4, q:"How many employees relocated to the new headquarters?", opts:["1,200","1,800","3,500","4,700"], ans:0, exp:"Approximately 1,200 employees from the Austin region relocated to the new headquarters.", zh:"奧斯汀地區約 1,200 名員工遷至新總部，選 (A)。" }
    ]
  },
  { label:"第 15 組 — Meeting Agenda", type:"single",
    passage:`<div class="doc-label">Meeting Agenda</div><h4>QUARTERLY BUSINESS REVIEW — Q1 AGENDA</h4><p><strong>Date:</strong> April 18 &nbsp;|&nbsp; <strong>Time:</strong> 9:00 A.M. – 12:00 P.M. &nbsp;|&nbsp; <strong>Location:</strong> Boardroom C, 8th Floor</p><p><strong>Attendees:</strong> All Department Heads, Finance Team, CEO</p><p><strong>9:00–9:10</strong> &nbsp; Welcome and housekeeping — CEO Sandra Park<br><strong>9:10–9:40</strong> &nbsp; Q1 Financial Results — CFO Mark Osei<br><strong>9:40–10:10</strong> &nbsp; Sales Performance Review — VP Sales, Laura Chin<br><strong>10:10–10:25</strong> &nbsp; Break<br><strong>10:25–11:00</strong> &nbsp; Operations Update — COO David Reyes<br><strong>11:00–11:30</strong> &nbsp; Q2 Strategy and Budget Proposal — CFO Mark Osei<br><strong>11:30–11:55</strong> &nbsp; Open Discussion / Q&amp;A<br><strong>11:55–12:00</strong> &nbsp; Closing Remarks — CEO Sandra Park</p><p><em>Note: All department heads are requested to prepare a brief 5-minute status summary for the Open Discussion segment. Presentations should be submitted to admin@company.com by April 16.</em></p>`,
    qs:[
      { n:1, q:"Who will present the Q1 financial results?", opts:["CEO Sandra Park","CFO Mark Osei","VP Sales Laura Chin","COO David Reyes"], ans:1, exp:"The agenda shows CFO Mark Osei will present the Q1 Financial Results at 9:10.", zh:"議程顯示財務長 Mark Osei 將於 9:10 報告 Q1 財務成果，選 (B)。" },
      { n:2, q:"What are department heads asked to prepare?", opts:["A written quarterly report","A 5-minute status summary","A detailed budget proposal","A sales forecast for Q2"], ans:1, exp:"The note requests department heads to prepare a brief 5-minute status summary.", zh:"注意事項要求各部門主管準備 5 分鐘狀態摘要，選 (B)。" },
      { n:3, q:"By when must presentations be submitted?", opts:["April 14","April 16","April 17","April 18"], ans:1, exp:"Presentations must be submitted by April 16.", zh:"簡報需在 4 月 16 日前提交，選 (B)。" },
      { n:4, q:"How long is the Open Discussion / Q&A segment?", opts:["15 minutes","25 minutes","30 minutes","55 minutes"], ans:1, exp:"Open Discussion runs from 11:30 to 11:55, which is 25 minutes.", zh:"公開討論從 11:30 至 11:55，共 25 分鐘，選 (B)。" }
    ]
  },
  { label:"第 16 組 — Annual Report", type:"single",
    passage:`<div class="doc-label">Annual Report — Extract</div><h4>HELIX SYSTEMS INC. — FISCAL YEAR SUMMARY</h4><p>Helix Systems Inc. concluded fiscal year 2025 with record-breaking performance across all key metrics. Total revenue reached $2.8 billion, a 22 percent increase from the prior year, driven primarily by cloud services, which grew 41 percent year-over-year and now account for 58 percent of total revenue.</p><p>The company expanded its global workforce to 14,200 employees, adding 1,800 new positions during the year. New offices were established in Dublin, Singapore, and São Paulo to support growing regional demand.</p><p>Net income for fiscal year 2025 was $420 million, compared to $310 million in fiscal year 2024. The board of directors approved a dividend of $1.20 per share, up from $0.90 in the prior year.</p><p>Looking ahead, Helix plans to invest $350 million in research and development in fiscal year 2026, focusing on artificial intelligence applications and cybersecurity solutions. The company expects revenue growth of 15–18 percent for the coming fiscal year.</p>`,
    qs:[
      { n:1, q:"What was Helix Systems' total revenue in fiscal year 2025?", opts:["$420 million","$2.1 billion","$2.8 billion","$3.5 billion"], ans:2, exp:"Total revenue reached $2.8 billion in fiscal year 2025.", zh:"2025 財年總營收達 28 億美元，選 (C)。" },
      { n:2, q:"What drove the revenue growth?", opts:["Hardware sales","Consulting services","Cloud services","International licensing"], ans:2, exp:"Revenue growth was driven primarily by cloud services, which grew 41 percent.", zh:"營收成長主要由雲端服務推動，成長 41%，選 (C)。" },
      { n:3, q:"How much net income did Helix report in fiscal year 2024?", opts:["$310 million","$350 million","$420 million","$520 million"], ans:0, exp:"Net income was $310 million in fiscal year 2024, compared to $420 million in 2025.", zh:"2024 財年淨收入為 3.1 億美元，選 (A)。" },
      { n:4, q:"What is Helix planning to focus on in its R&D investment?", opts:["Cloud infrastructure and hardware","AI applications and cybersecurity","Marketing technology and analytics","Supply chain and logistics software"], ans:1, exp:"The report states R&D investment will focus on artificial intelligence applications and cybersecurity solutions.", zh:"研發投資將聚焦於人工智慧應用與資安解決方案，選 (B)。" },
      { n:5, q:"What revenue growth does Helix expect for fiscal year 2026?", opts:["10–12 percent","12–15 percent","15–18 percent","20–22 percent"], ans:2, exp:"The company expects revenue growth of 15–18 percent for the coming fiscal year.", zh:"公司預期下一財年營收成長 15 至 18%，選 (C)。" }
    ]
  },
  { label:"第 17 組 — Double Passage", type:"double",
    passages:[
      { content:`<div class="doc-label">Warranty Registration Card</div><h4>CLARITEK AUDIO — LIMITED WARRANTY</h4><p><strong>Product:</strong> ClaraPro X500 Wireless Headphones<br><strong>Model No.:</strong> CP-X500<br><strong>Purchase Date:</strong> February 3<br><strong>Registered Owner:</strong> Thomas Bauer</p><p>This product is covered by a <strong>24-month limited warranty</strong> from the date of purchase. The warranty covers manufacturing defects and hardware malfunctions under normal use conditions. It does not cover damage caused by accidents, misuse, or unauthorized modifications.</p><p>To make a warranty claim, contact our support team at support@claritek.com or call 1-800-555-0244. Please retain your proof of purchase at all times.</p>` },
      { content:`<div class="doc-label">E-mail</div><p><strong>From:</strong> t.bauer@mailbox.com<br><strong>To:</strong> support@claritek.com<br><strong>Subject:</strong> Warranty Claim — ClaraPro X500<br><strong>Date:</strong> November 10</p><p>To Whom It May Concern,</p><p>I am writing to submit a warranty claim for my ClaraPro X500 headphones (Model No. CP-X500), which I purchased on February 3. The right earcup has stopped producing sound. I have not made any modifications to the device, and it has been used only under normal conditions.</p><p>I have attached a copy of my original receipt as proof of purchase. Please advise on the next steps for repair or replacement.</p><p>Best regards,<br>Thomas Bauer</p>` }
    ],
    qs:[
      { n:1, q:"How long is the warranty on the ClaraPro X500?", opts:["12 months","18 months","24 months","36 months"], ans:2, exp:"The warranty card states a 24-month limited warranty.", zh:"保固卡說明提供 24 個月有限保固，選 (C)。" },
      { n:2, q:"What problem is Thomas Bauer reporting?", opts:["The headphones will not charge","The right earcup produces no sound","The Bluetooth connection fails","The headband is broken"], ans:1, exp:"Thomas reports that the right earcup has stopped producing sound.", zh:"Thomas 報告右耳罩無聲，選 (B)。" },
      { n:3, q:"Is Thomas Bauer's claim likely to be covered under the warranty?", opts:["No, because the warranty has expired","No, because he misused the product","Yes, because the defect appears to be a hardware malfunction","Yes, because all damage is covered"], ans:2, exp:"The defect appears to be a hardware malfunction under normal use, which the warranty covers, and the claim is within the 24-month warranty period.", zh:"此問題似為硬體故障且在正常使用下發生，屬保固範圍；且日期在保固期限內，選 (C)。" },
      { n:4, q:"What did Thomas attach to his e-mail?", opts:["A photo of the damaged headphones","A video showing the defect","A copy of his original receipt","His warranty registration form"], ans:2, exp:"Thomas attached a copy of his original receipt as proof of purchase.", zh:"Thomas 附上購買收據正本影本，選 (C)。" },
      { n:5, q:"According to the warranty card, what should customers always keep?", opts:["The original packaging","The serial number label","Proof of purchase","The warranty registration number"], ans:2, exp:"The warranty card instructs customers to retain proof of purchase at all times.", zh:"保固卡指示客戶隨時保留購買證明，選 (C)。" }
    ]
  },
  { label:"第 18 組 — Double Passage", type:"double",
    passages:[
      { content:`<div class="doc-label">Event Venue Brochure</div><h4>THE GRAND PAVILION — EVENT SPACES</h4><p>The Grand Pavilion offers three versatile event spaces for corporate and private functions:</p><p><strong>Crystal Hall:</strong> Seats up to 300 guests. Full A/V system, dance floor, and catering kitchen included. Ideal for galas, product launches, and large receptions.<br><strong>Garden Terrace:</strong> Outdoor space for up to 120 guests. Heated canopy available. Perfect for cocktail receptions and outdoor ceremonies.<br><strong>Executive Suite:</strong> Intimate boardroom-style space for 20–40 guests. Includes projector, whiteboard, and catering service. Suitable for corporate meetings and private dinners.</p><p>All spaces include complimentary parking, event coordinator support, and customizable décor packages. Rates available upon request. Contact events@grandpavilion.com.</p>` },
      { content:`<div class="doc-label">Booking Confirmation</div><p><strong>Booking Reference:</strong> GP-20251104<br><strong>Client:</strong> Prism Innovations Ltd.<br><strong>Contact:</strong> Claire Yoon (c.yoon@prisminnovations.com)<br><strong>Event Type:</strong> Annual Awards Dinner<br><strong>Date:</strong> November 22<br><strong>Time:</strong> 6:30 P.M. – 10:30 P.M.<br><strong>Venue:</strong> Crystal Hall<br><strong>Expected Guests:</strong> 240</p><p>A deposit of 30% of the total venue fee has been received. The remaining balance is due no later than November 8. Cancellations made within 14 days of the event are non-refundable.</p><p>Please contact your event coordinator, Ms. Hartley, at ext. 214 for any changes or questions.</p>` }
    ],
    qs:[
      { n:1, q:"Which venue does Prism Innovations plan to use?", opts:["The Garden Terrace","The Executive Suite","The Crystal Hall","A combination of all three"], ans:2, exp:"The booking confirmation shows the Crystal Hall was booked.", zh:"預訂確認顯示租用 Crystal Hall，選 (C)。" },
      { n:2, q:"How many guests is Prism Innovations expecting?", opts:["120","200","240","300"], ans:2, exp:"The booking confirmation lists 240 expected guests.", zh:"預訂確認列出預計 240 位賓客，選 (C)。" },
      { n:3, q:"What is included in all venue packages at The Grand Pavilion?", opts:["Complimentary catering","Live entertainment","Complimentary parking","Photography services"], ans:2, exp:"The brochure states all spaces include complimentary parking.", zh:"宣傳冊說明所有場地包含免費停車，選 (C)。" },
      { n:4, q:"When is the remaining balance due?", opts:["November 1","November 8","November 14","November 22"], ans:1, exp:"The booking confirmation states the remaining balance is due no later than November 8.", zh:"確認函指出尾款須在 11 月 8 日前支付，選 (B)。" },
      { n:5, q:"What happens if Prism Innovations cancels within 14 days of the event?", opts:["They receive a partial refund","The deposit is returned","The booking is rescheduled","The payment is non-refundable"], ans:3, exp:"The confirmation states cancellations within 14 days are non-refundable.", zh:"確認函指出活動 14 天內取消不予退款，選 (D)。" }
    ]
  },
  { label:"第 19 組 — Triple Passage", type:"triple",
    passages:[
      { content:`<div class="doc-label">Job Description</div><h4>SENIOR FINANCIAL ANALYST</h4><p><strong>Company:</strong> Falcon Capital Group<br><strong>Location:</strong> New York, NY (On-site)</p><p>We are seeking a Senior Financial Analyst to join our Corporate Finance team. The successful candidate will be responsible for financial modelling, budget forecasting, and investment analysis.</p><p><strong>Requirements:</strong> Bachelor's degree in Finance or Accounting; CFA designation preferred; minimum 5 years of relevant experience; advanced proficiency in Excel and financial modelling software.<br><strong>Salary:</strong> $90,000–$110,000<br><strong>Deadline:</strong> Rolling basis</p>` },
      { content:`<div class="doc-label">Candidate Summary</div><p><strong>Applicant:</strong> Mei-Ling Chen<br><strong>Education:</strong> B.S. Finance, Columbia University; CFA Level III Candidate<br><strong>Experience:</strong> 7 years in corporate finance at two major investment banks<br><strong>Skills:</strong> Financial modelling (DCF, LBO), Excel (advanced), Bloomberg Terminal, Python for data analysis<br><strong>Notable Achievement:</strong> Led a cross-functional team that identified $12 million in cost savings at previous employer.</p>` },
      { content:`<div class="doc-label">Interview Schedule</div><p><strong>Candidate:</strong> Mei-Ling Chen<br><strong>Position:</strong> Senior Financial Analyst<br><strong>Round 1:</strong> April 21, 10:00 A.M. — HR screening (30 min, video call)<br><strong>Round 2:</strong> April 24, 2:00 P.M. — Technical interview with CFO (60 min, on-site)<br><strong>Round 3:</strong> April 28, 11:00 A.M. — Panel interview with Finance Team (45 min, on-site)<br><strong>Decision Expected:</strong> By May 2</p>` }
    ],
    qs:[
      { n:1, q:"What professional designation is preferred for the position?", opts:["MBA","CPA","CFA","PMP"], ans:2, exp:"The job description states the CFA designation is preferred.", zh:"職缺說明偏好具備特許財務分析師（CFA）資格，選 (C)。" },
      { n:2, q:"How does Mei-Ling Chen exceed the experience requirement?", opts:["She has an MBA from Columbia","She has 7 years of experience instead of the required 5","She holds a CFA charterholder title","She speaks multiple languages"], ans:1, exp:"Mei-Ling has 7 years of experience, which exceeds the minimum requirement of 5 years.", zh:"Mei-Ling 擁有 7 年經驗，超過要求的 5 年，選 (B)。" },
      { n:3, q:"What was Mei-Ling Chen's notable achievement at her previous employer?", opts:["She launched a new investment fund","She negotiated a major acquisition","She led a team that identified $12 million in cost savings","She developed a proprietary trading algorithm"], ans:2, exp:"Her notable achievement was leading a team that identified $12 million in cost savings.", zh:"她帶領團隊找出 1,200 萬美元的成本節省空間，選 (C)。" },
      { n:4, q:"Where will the Round 2 technical interview take place?", opts:["Video call","Phone call","On-site","At a partner office"], ans:2, exp:"Round 2 is an on-site technical interview with the CFO.", zh:"第二輪為現場技術面試，選 (C)。" },
      { n:5, q:"When is the hiring decision expected?", opts:["April 21","April 28","May 2","May 10"], ans:2, exp:"The interview schedule states the decision is expected by May 2.", zh:"面試排程指出決定預計在 5 月 2 日前作出，選 (C)。" }
    ]
  },
  { label:"第 20 組 — Triple Passage", type:"triple",
    passages:[
      { content:`<div class="doc-label">Policy Notice</div><h4>UPDATED REMOTE WORK POLICY — EFFECTIVE JUNE 1</h4><p>After a comprehensive review, the company is revising its remote work policy. Beginning June 1, all employees in non-client-facing roles are permitted to work remotely up to three days per week. Employees in client-facing roles are required to be on-site a minimum of four days per week.</p><p>All remote work arrangements must be approved in advance by the employee's direct supervisor. Employees working remotely are expected to be available during core business hours (9:00 A.M. – 3:00 P.M.) and must attend all scheduled team meetings via video conference.</p><p>This policy does not apply to staff currently on fixed-term contracts. Questions should be directed to HR at hr@company.com.</p>` },
      { content:`<div class="doc-label">Employee E-mail</div><p><strong>From:</strong> n.foster@company.com<br><strong>To:</strong> hr@company.com<br><strong>Subject:</strong> Question About New Remote Work Policy<br><strong>Date:</strong> May 15</p><p>Dear HR Team,</p><p>I have read the updated remote work policy and have a question. I am a graphic designer in the Marketing Department, which I believe is a non-client-facing role. However, I also occasionally attend client presentations. Does this mean I am classified as a client-facing employee and required to be on-site four days per week?</p><p>I would appreciate clarification before June 1.</p><p>Best regards,<br>Nicole Foster</p>` },
      { content:`<div class="doc-label">HR Response E-mail</div><p><strong>From:</strong> hr@company.com<br><strong>To:</strong> n.foster@company.com<br><strong>Subject:</strong> RE: Question About New Remote Work Policy<br><strong>Date:</strong> May 16</p><p>Dear Ms. Foster,</p><p>Thank you for reaching out. After consulting with your department head, we can confirm that your primary role as a graphic designer is classified as non-client-facing. Occasional attendance at client presentations does not change your classification.</p><p>Therefore, you are eligible to work remotely up to three days per week under the new policy, subject to your supervisor's approval. Please submit your preferred remote work schedule to your supervisor by May 28.</p><p>Kind regards,<br>Human Resources Department</p>` }
    ],
    qs:[
      { n:1, q:"Under the new policy, how many days per week may non-client-facing employees work remotely?", opts:["One","Two","Three","Four"], ans:2, exp:"Non-client-facing employees may work remotely up to three days per week.", zh:"非面客職位員工每週最多可遠端工作三天，選 (C)。" },
      { n:2, q:"What is the core business hours requirement for remote workers?", opts:["8:00 A.M. – 5:00 P.M.","9:00 A.M. – 3:00 P.M.","9:00 A.M. – 5:00 P.M.","10:00 A.M. – 4:00 P.M."], ans:1, exp:"Remote employees must be available during core hours of 9:00 A.M. – 3:00 P.M.", zh:"遠端工作者須在核心工時 9:00 至 15:00 保持可聯繫，選 (B)。" },
      { n:3, q:"Why did Nicole Foster send an e-mail to HR?", opts:["To request a change in her job title","To report a problem with the remote work system","To ask about her classification under the new policy","To complain about being required to attend client meetings"], ans:2, exp:"Nicole sent the e-mail to ask whether her role is classified as client-facing or non-client-facing.", zh:"Nicole 發信詢問她的職位分類，選 (C)。" },
      { n:4, q:"What did HR confirm about Nicole's classification?", opts:["She is classified as a client-facing employee","She must work on-site four days per week","Her primary role is non-client-facing","She is not eligible for remote work"], ans:2, exp:"HR confirmed that Nicole's primary role as a graphic designer is non-client-facing.", zh:"人資確認 Nicole 作為平面設計師的主要職務屬非面客性質，選 (C)。" },
      { n:5, q:"By when must Nicole submit her preferred remote work schedule?", opts:["May 16","May 20","May 28","June 1"], ans:2, exp:"The HR response asks Nicole to submit her preferred schedule by May 28.", zh:"人資回覆要求 Nicole 在 5 月 28 日前提交偏好的遠端工作排程，選 (C)。" }
    ]
  }
];

window.Q_P5_T01 = typeof Q_P5_T01 !== 'undefined' ? Q_P5_T01 : null;
window.Q_P6_T01 = typeof Q_P6_T01 !== 'undefined' ? Q_P6_T01 : null;
window.Q_P7_T01 = typeof Q_P7_T01 !== 'undefined' ? Q_P7_T01 : null;