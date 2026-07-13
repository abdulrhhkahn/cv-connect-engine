/**
 * job-templates.ts — Job posting template library
 *
 * ~40 templates covering technical and non-technical roles.
 * Matching: score-based — every matched keyword adds its length to the
 * score, so longer (more specific) keywords beat short generic ones.
 * e.g. "data scientist" (14) beats "data" (4).
 */

export interface JobTemplate {
  keywords:           string[];
  title:              string;
  description:        string;
  requirements:       string[];
  preferredSkills:    string[];
  experience:         string;
  industryExperience: string[];
  softSkills:         string[];
  culturalFit:        string[];
}

export const jobTemplates: Record<string, JobTemplate> = {

  // ═══════════════════ TECHNICAL / ENGINEERING ═══════════════════

  frontend: {
    keywords: ["frontend", "front-end", "front end", "react developer", "vue developer", "angular developer", "ui developer", "web developer", "javascript developer"],
    title: "Frontend Engineer",
    description: "We're seeking a talented Frontend Engineer to build beautiful, performant user interfaces. You'll work closely with design and product teams to create exceptional user experiences.",
    requirements: ["3+ years React/TypeScript experience", "Strong HTML5/CSS3 fundamentals", "Experience with state management (Redux, Zustand, or Context API)", "Understanding of web performance optimization and Core Web Vitals", "Familiarity with responsive design and cross-browser compatibility"],
    preferredSkills: ["Next.js or Remix", "Tailwind CSS or CSS-in-JS", "Testing (Jest, Cypress, Playwright)", "Figma-to-code workflow", "GraphQL or tRPC"],
    experience: "3+ years",
    industryExperience: ["SaaS", "B2C products"],
    softSkills: ["Attention to detail", "Communication", "Collaboration"],
    culturalFit: ["Design-driven", "User-centric", "Agile methodology"],
  },

  backend: {
    keywords: ["backend", "back-end", "back end", "api developer", "server-side", "microservices", "node.js developer", "python developer", "go developer", "java developer", "php developer", ".net developer", "ruby developer"],
    title: "Backend Engineer",
    description: "Join our engineering team to design and build scalable backend services. You'll architect APIs, optimize databases, and ensure our systems handle growing traffic reliably.",
    requirements: ["3+ years backend development (Node.js, Python, Go, or Java)", "Strong database design skills (PostgreSQL, MySQL, or MongoDB)", "RESTful and/or GraphQL API design", "Experience with cloud platforms (AWS, GCP, or Azure)", "Understanding of authentication, authorization, and security best practices"],
    preferredSkills: ["Docker and Kubernetes", "Message queues (Kafka, RabbitMQ, or SQS)", "CI/CD pipelines (GitHub Actions, GitLab CI)", "Observability tools (Datadog, Grafana, Prometheus)", "Infrastructure as Code (Terraform, Pulumi)"],
    experience: "3+ years",
    industryExperience: ["Cloud infrastructure", "Fintech"],
    softSkills: ["Problem-solving", "Autonomy", "Analytical thinking"],
    culturalFit: ["Engineering excellence", "Data-driven decisions", "Remote-friendly"],
  },

  fullstack: {
    keywords: ["fullstack", "full-stack", "full stack"],
    title: "Full Stack Engineer",
    description: "We're looking for a versatile Full Stack Engineer comfortable working across the entire stack — from crafting responsive UIs to building robust APIs and managing databases.",
    requirements: ["3+ years full-stack development experience", "Proficiency in a modern frontend framework (React, Vue, or Angular)", "Backend experience with Node.js, Python, or similar", "Database design and query optimization (SQL and/or NoSQL)", "Version control with Git and code review practices"],
    preferredSkills: ["TypeScript end-to-end", "DevOps and CI/CD pipelines", "Cloud services (AWS, GCP, Vercel, or similar)", "Testing at all levels (unit, integration, e2e)", "WebSocket or real-time communication"],
    experience: "3+ years",
    industryExperience: ["Startups", "SaaS"],
    softSkills: ["Adaptability", "Communication", "Self-motivation"],
    culturalFit: ["Ownership mindset", "Fast-paced environment", "Collaborative"],
  },

  mobile: {
    keywords: ["mobile developer", "mobile engineer", "ios developer", "android developer", "react native", "flutter", "swift developer", "kotlin developer", "mobile app"],
    title: "Mobile Developer",
    description: "We're looking for a Mobile Developer to build and maintain high-quality mobile applications. You'll own the full mobile development lifecycle from architecture to App Store deployment.",
    requirements: ["3+ years mobile development experience", "Proficiency in React Native, Flutter, Swift, or Kotlin", "Understanding of mobile UI/UX patterns and guidelines", "Experience with RESTful APIs and offline-first architecture", "App Store and Google Play submission process"],
    preferredSkills: ["Native iOS and Android development", "Push notifications and deep linking", "Mobile analytics and crash reporting", "Accessibility on mobile platforms", "CI/CD for mobile (Fastlane, Bitrise)"],
    experience: "3+ years",
    industryExperience: ["Consumer apps", "E-commerce"],
    softSkills: ["Attention to detail", "User empathy", "Self-direction"],
    culturalFit: ["Mobile-first mindset", "Quality-focused", "Iterative development"],
  },

  devops: {
    keywords: ["devops", "sre", "site reliability", "platform engineer", "cloud engineer", "infrastructure engineer", "release engineer"],
    title: "DevOps Engineer",
    description: "We're hiring a DevOps Engineer to build and maintain our cloud infrastructure, CI/CD pipelines, and monitoring systems. You'll ensure our services are reliable, scalable, and secure.",
    requirements: ["3+ years DevOps or SRE experience", "Strong Linux systems administration", "Container orchestration (Kubernetes, Docker Swarm)", "CI/CD pipeline design (Jenkins, GitHub Actions, GitLab CI)", "Infrastructure as Code (Terraform, CloudFormation, or Pulumi)"],
    preferredSkills: ["Service mesh (Istio, Linkerd)", "Monitoring and alerting (Prometheus, Grafana, PagerDuty)", "Security hardening and compliance", "Cost optimization on cloud platforms", "Scripting (Bash, Python)"],
    experience: "3+ years",
    industryExperience: ["Cloud-native", "High-traffic systems"],
    softSkills: ["Problem-solving under pressure", "Documentation", "Collaboration"],
    culturalFit: ["Reliability-focused", "Automation-first", "Blameless culture"],
  },

  dataScience: {
    keywords: ["data scientist", "data science"],
    title: "Data Scientist",
    description: "Join our data team to uncover insights that drive business decisions. You'll build predictive models, analyze large datasets, and collaborate with stakeholders to translate data into action.",
    requirements: ["3+ years data science experience", "Strong Python/R proficiency for data analysis", "Statistical modeling and hypothesis testing", "Advanced SQL and data pipeline experience", "Experience with ML frameworks (scikit-learn, TensorFlow, or PyTorch)"],
    preferredSkills: ["Deep learning and NLP", "Apache Spark or Databricks", "A/B testing and experimentation platforms", "Data visualization (Tableau, Looker, or D3.js)", "MLOps and model deployment"],
    experience: "3+ years",
    industryExperience: ["Analytics", "AI/ML"],
    softSkills: ["Analytical thinking", "Communication", "Intellectual curiosity"],
    culturalFit: ["Data-driven culture", "Research-oriented", "Collaborative"],
  },

  dataEngineer: {
    keywords: ["data engineer", "data engineering", "etl developer", "data pipeline"],
    title: "Data Engineer",
    description: "We're hiring a Data Engineer to design, build, and maintain the data infrastructure that powers analytics and machine learning across the company.",
    requirements: ["3+ years data engineering experience", "Strong SQL and Python skills", "Experience building ETL/ELT pipelines", "Data warehouse experience (Snowflake, BigQuery, or Redshift)", "Workflow orchestration (Airflow, Dagster, or Prefect)"],
    preferredSkills: ["Apache Spark or Flink", "Streaming data (Kafka, Kinesis)", "dbt for data transformation", "Data quality and observability tooling", "Infrastructure as Code"],
    experience: "3+ years",
    industryExperience: ["Big data", "Analytics platforms"],
    softSkills: ["Precision", "Systems thinking", "Communication"],
    culturalFit: ["Data-driven", "Scalability-focused", "Detail-oriented"],
  },

  dataAnalyst: {
    keywords: ["data analyst", "business intelligence", "bi analyst", "analytics analyst", "reporting analyst"],
    title: "Data Analyst",
    description: "We're looking for a Data Analyst to transform raw data into actionable insights. You'll build dashboards, run analyses, and help teams across the company make data-informed decisions.",
    requirements: ["2+ years data analysis experience", "Advanced SQL proficiency", "Dashboard tools (Tableau, Power BI, or Looker)", "Strong Excel/Google Sheets skills", "Experience presenting findings to stakeholders"],
    preferredSkills: ["Python or R for analysis", "Statistical analysis and A/B testing", "dbt or data modeling", "Google Analytics or product analytics tools", "Data storytelling"],
    experience: "2+ years",
    industryExperience: ["Analytics", "E-commerce"],
    softSkills: ["Analytical thinking", "Communication", "Curiosity", "Attention to detail"],
    culturalFit: ["Data-driven", "Collaborative", "Business-minded"],
  },

  aiml: {
    keywords: ["machine learning engineer", "ml engineer", "ai engineer", "artificial intelligence", "llm engineer", "deep learning", "computer vision engineer", "nlp engineer"],
    title: "Machine Learning Engineer",
    description: "Join us to build and deploy production ML systems. You'll take models from research to production, optimize inference, and build the infrastructure that powers AI features.",
    requirements: ["3+ years ML engineering experience", "Strong Python and ML frameworks (PyTorch, TensorFlow)", "Experience deploying models to production", "Understanding of MLOps practices and model monitoring", "Solid software engineering fundamentals"],
    preferredSkills: ["LLM fine-tuning and prompt engineering", "Vector databases and RAG systems", "GPU optimization and distributed training", "Kubernetes and cloud ML platforms (SageMaker, Vertex AI)", "Research paper implementation"],
    experience: "3+ years",
    industryExperience: ["AI/ML", "Tech"],
    softSkills: ["Research mindset", "Problem-solving", "Communication"],
    culturalFit: ["Innovation-driven", "Experimental", "Fast-moving"],
  },

  qa: {
    keywords: ["qa engineer", "quality assurance", "test engineer", "test automation", "sdet", "quality engineer", "tester"],
    title: "QA Engineer",
    description: "We're hiring a QA Engineer to ensure our products meet the highest quality standards. You'll design test strategies, build automation frameworks, and champion quality across the development lifecycle.",
    requirements: ["2+ years QA/testing experience", "Test automation experience (Selenium, Cypress, or Playwright)", "API testing (Postman, REST Assured)", "Understanding of CI/CD integration for tests", "Bug tracking and test management tools (Jira, TestRail)"],
    preferredSkills: ["Performance testing (JMeter, k6)", "Mobile testing (Appium)", "Security testing basics", "SQL for data validation", "BDD frameworks (Cucumber)"],
    experience: "2+ years",
    industryExperience: ["SaaS", "Software products"],
    softSkills: ["Attention to detail", "Critical thinking", "Communication"],
    culturalFit: ["Quality-obsessed", "Process-oriented", "Collaborative"],
  },

  security: {
    keywords: ["security engineer", "cybersecurity", "cyber security", "infosec", "security analyst", "penetration tester", "pentester", "soc analyst", "application security"],
    title: "Security Engineer",
    description: "We're looking for a Security Engineer to protect our systems, data, and users. You'll conduct security assessments, respond to incidents, and build security into our engineering culture.",
    requirements: ["3+ years security engineering experience", "Knowledge of OWASP Top 10 and common attack vectors", "Experience with security tools (Burp Suite, Nessus, Metasploit)", "Cloud security experience (AWS/GCP/Azure)", "Incident response and forensics fundamentals"],
    preferredSkills: ["Certifications (OSCP, CISSP, CEH)", "SIEM platforms (Splunk, Elastic)", "Container and Kubernetes security", "Compliance frameworks (SOC 2, ISO 27001, GDPR)", "Scripting for security automation (Python, Bash)"],
    experience: "3+ years",
    industryExperience: ["Cybersecurity", "Fintech", "Enterprise"],
    softSkills: ["Analytical thinking", "Integrity", "Communication under pressure"],
    culturalFit: ["Security-first mindset", "Continuous learning", "Detail-oriented"],
  },

  gamedev: {
    keywords: ["game developer", "game programmer", "unity developer", "unreal developer", "game designer", "gameplay engineer"],
    title: "Game Developer",
    description: "Join our studio to create engaging gaming experiences. You'll implement gameplay mechanics, optimize performance, and collaborate with artists and designers to bring game worlds to life.",
    requirements: ["2+ years game development experience", "Proficiency in Unity (C#) or Unreal Engine (C++)", "Understanding of game physics, animation, and rendering", "Experience shipping at least one game title", "3D math fundamentals (vectors, matrices, quaternions)"],
    preferredSkills: ["Multiplayer/networking experience", "Mobile game optimization", "Shader programming", "Game monetization and analytics", "VR/AR development"],
    experience: "2+ years",
    industryExperience: ["Gaming", "Interactive entertainment"],
    softSkills: ["Creativity", "Collaboration", "Iteration mindset"],
    culturalFit: ["Player-focused", "Creative environment", "Passionate about games"],
  },

  blockchain: {
    keywords: ["blockchain", "web3", "smart contract", "solidity", "crypto developer", "defi"],
    title: "Blockchain Developer",
    description: "We're hiring a Blockchain Developer to build decentralized applications and smart contracts. You'll work on cutting-edge Web3 infrastructure with a focus on security and gas efficiency.",
    requirements: ["2+ years blockchain development experience", "Solidity smart contract development", "Understanding of EVM, gas optimization, and security patterns", "Experience with Hardhat, Foundry, or Truffle", "Web3 integration (ethers.js, viem, wagmi)"],
    preferredSkills: ["Smart contract auditing experience", "Layer 2 solutions (Arbitrum, Optimism)", "Rust for Solana development", "DeFi protocols knowledge", "Tokenomics design"],
    experience: "2+ years",
    industryExperience: ["Web3", "Fintech", "DeFi"],
    softSkills: ["Security mindset", "Self-learning", "Precision"],
    culturalFit: ["Decentralization ethos", "Fast-evolving space", "Community-driven"],
  },

  embedded: {
    keywords: ["embedded", "firmware", "iot engineer", "hardware engineer", "rtos", "microcontroller"],
    title: "Embedded Systems Engineer",
    description: "We're looking for an Embedded Systems Engineer to develop firmware for our hardware products. You'll work at the intersection of hardware and software, optimizing for performance and power.",
    requirements: ["3+ years embedded development experience", "Strong C/C++ programming skills", "Experience with microcontrollers (ARM Cortex, ESP32, STM32)", "RTOS experience (FreeRTOS, Zephyr)", "Hardware debugging (oscilloscopes, logic analyzers, JTAG)"],
    preferredSkills: ["Wireless protocols (BLE, WiFi, LoRa, Zigbee)", "PCB design basics (KiCad, Altium)", "Low-power optimization", "OTA update systems", "Rust for embedded"],
    experience: "3+ years",
    industryExperience: ["IoT", "Consumer electronics", "Automotive"],
    softSkills: ["Precision", "Patience", "Systems thinking"],
    culturalFit: ["Hardware-software collaboration", "Quality-focused", "Hands-on"],
  },

  dba: {
    keywords: ["database administrator", "dba", "database engineer", "sql server dba", "oracle dba", "postgres dba"],
    title: "Database Administrator",
    description: "We're hiring a Database Administrator to manage, optimize, and secure our database infrastructure. You'll ensure high availability, performance, and data integrity across all systems.",
    requirements: ["3+ years DBA experience", "Deep expertise in PostgreSQL, MySQL, SQL Server, or Oracle", "Performance tuning and query optimization", "Backup, recovery, and disaster recovery planning", "High availability and replication setups"],
    preferredSkills: ["Cloud databases (RDS, Cloud SQL, Azure SQL)", "NoSQL databases (MongoDB, Redis, Cassandra)", "Database automation and IaC", "Monitoring tools (pgAdmin, Percona, SolarWinds)", "Data migration at scale"],
    experience: "3+ years",
    industryExperience: ["Enterprise", "Data-intensive applications"],
    softSkills: ["Reliability", "Attention to detail", "Calm under pressure"],
    culturalFit: ["Data stewardship", "Process-driven", "On-call readiness"],
  },

  network: {
    keywords: ["network engineer", "network administrator", "network security", "cisco", "network architect"],
    title: "Network Engineer",
    description: "Join our IT team as a Network Engineer to design, implement, and maintain our network infrastructure. You'll ensure secure, reliable connectivity across offices and cloud environments.",
    requirements: ["3+ years network engineering experience", "Routing and switching expertise (Cisco, Juniper)", "Firewall configuration and management (Palo Alto, Fortinet)", "VPN, VLAN, and network segmentation", "Network monitoring and troubleshooting tools"],
    preferredSkills: ["Certifications (CCNA, CCNP, JNCIA)", "SD-WAN deployment", "Cloud networking (AWS VPC, Azure VNet)", "Network automation (Ansible, Python)", "Zero-trust architecture"],
    experience: "3+ years",
    industryExperience: ["Enterprise IT", "Telecom", "Managed services"],
    softSkills: ["Problem-solving", "Documentation", "Communication"],
    culturalFit: ["Reliability-focused", "Security-conscious", "Team player"],
  },

  itsupport: {
    keywords: ["it support", "help desk", "helpdesk", "desktop support", "it technician", "systems administrator", "sysadmin", "it specialist", "technical support engineer"],
    title: "IT Support Specialist",
    description: "We're looking for an IT Support Specialist to keep our team productive. You'll troubleshoot hardware and software issues, manage devices and accounts, and improve our IT processes.",
    requirements: ["2+ years IT support experience", "Windows and macOS administration", "Active Directory / Azure AD / Google Workspace management", "Hardware troubleshooting and device provisioning", "Ticketing systems (Zendesk, Freshservice, Jira Service Desk)"],
    preferredSkills: ["MDM tools (Intune, Jamf)", "Basic networking (DNS, DHCP, VPN)", "Scripting (PowerShell, Bash)", "Certifications (CompTIA A+, Network+)", "SaaS administration (Slack, Zoom, Office 365)"],
    experience: "2+ years",
    industryExperience: ["Corporate IT", "MSP"],
    softSkills: ["Patience", "Customer service", "Clear communication"],
    culturalFit: ["Service-oriented", "Process-driven", "Helpful attitude"],
  },

  solutionsArchitect: {
    keywords: ["solutions architect", "solution architect", "enterprise architect", "cloud architect", "technical architect"],
    title: "Solutions Architect",
    description: "We're hiring a Solutions Architect to design scalable technical solutions for complex business problems. You'll bridge business requirements and engineering execution across teams and clients.",
    requirements: ["5+ years software engineering with 2+ in architecture roles", "Cloud architecture expertise (AWS, Azure, or GCP)", "System design for scalability, reliability, and security", "Experience creating architecture diagrams and technical documentation", "Stakeholder communication across technical and business teams"],
    preferredSkills: ["Cloud certifications (AWS SA Pro, Azure Architect)", "Microservices and event-driven architecture", "Cost optimization strategies", "Pre-sales or client-facing experience", "Multiple tech stack fluency"],
    experience: "5+ years",
    industryExperience: ["Enterprise software", "Consulting", "Cloud services"],
    softSkills: ["Strategic thinking", "Communication", "Leadership", "Negotiation"],
    culturalFit: ["Big-picture thinker", "Client-focused", "Pragmatic"],
  },

  technicalWriter: {
    keywords: ["technical writer", "documentation engineer", "api documentation", "docs writer", "technical documentation"],
    title: "Technical Writer",
    description: "We're looking for a Technical Writer to create clear, accurate documentation for our products and APIs. You'll make complex technical concepts accessible to developers and end users alike.",
    requirements: ["2+ years technical writing experience", "Experience documenting APIs, SDKs, or developer tools", "Proficiency with docs-as-code workflows (Markdown, Git)", "Ability to read code samples in at least one language", "Strong information architecture skills"],
    preferredSkills: ["Static site generators (Docusaurus, MkDocs, Hugo)", "OpenAPI/Swagger specification", "Video tutorials and screencasts", "Developer experience (DX) research", "Localization workflows"],
    experience: "2+ years",
    industryExperience: ["Developer tools", "SaaS", "Tech"],
    softSkills: ["Clarity", "Empathy for readers", "Curiosity", "Collaboration"],
    culturalFit: ["Documentation-first culture", "User advocacy", "Detail-oriented"],
  },

  wordpress: {
    keywords: ["wordpress", "shopify developer", "webflow", "cms developer", "woocommerce"],
    title: "WordPress Developer",
    description: "We're hiring a WordPress Developer to build and maintain high-quality websites. You'll create custom themes and plugins, optimize performance, and deliver polished web experiences for clients.",
    requirements: ["2+ years WordPress development experience", "Custom theme and plugin development (PHP, JavaScript)", "Page builder proficiency (Elementor, Gutenberg blocks)", "Website performance optimization (caching, CDN, Core Web Vitals)", "MySQL and WordPress database structure"],
    preferredSkills: ["WooCommerce customization", "Headless WordPress (REST API, WPGraphQL)", "SEO technical implementation", "Shopify or Webflow experience", "Hosting management (cPanel, Cloudways, WP Engine)"],
    experience: "2+ years",
    industryExperience: ["Agencies", "E-commerce", "Publishing"],
    softSkills: ["Client communication", "Time management", "Attention to detail"],
    culturalFit: ["Client-focused", "Deadline-driven", "Quality craftsmanship"],
  },

  salesforce: {
    keywords: ["salesforce developer", "salesforce admin", "crm developer", "apex developer", "salesforce consultant", "dynamics 365", "sap consultant"],
    title: "Salesforce Developer",
    description: "We're hiring a Salesforce Developer to customize and extend our CRM platform. You'll build Apex solutions, Lightning components, and integrations that power our sales and service teams.",
    requirements: ["2+ years Salesforce development experience", "Apex, SOQL, and Lightning Web Components", "Salesforce configuration (flows, validation rules, objects)", "REST/SOAP API integrations", "Deployment tools (Change Sets, SFDX, Gearset)"],
    preferredSkills: ["Salesforce certifications (Platform Developer I/II, Admin)", "Experience Cloud or Service Cloud", "Marketing Cloud or Pardot", "CPQ configuration", "Data migration tools (Data Loader, MuleSoft)"],
    experience: "2+ years",
    industryExperience: ["CRM", "Enterprise software", "Consulting"],
    softSkills: ["Business process understanding", "Communication", "Problem-solving"],
    culturalFit: ["Business-enabling", "Best-practice driven", "Client-focused"],
  },

  // ═══════════════════ PRODUCT / DESIGN ═══════════════════

  productDesign: {
    keywords: ["product designer", "ux designer", "ui designer", "ux researcher", "interaction designer", "ux/ui", "user experience"],
    title: "Product Designer",
    description: "We're looking for a Product Designer to shape the future of our product experience. You'll lead design from concept to launch, creating intuitive interfaces backed by user research.",
    requirements: ["4+ years product design experience", "Strong portfolio of shipped digital products", "Expert proficiency in Figma", "User research and usability testing skills", "Experience building and maintaining design systems"],
    preferredSkills: ["Motion design and prototyping (Framer, Principle)", "Basic HTML/CSS understanding", "Data visualization design", "Accessibility (WCAG) expertise", "Workshop facilitation"],
    experience: "4+ years",
    industryExperience: ["Consumer tech", "SaaS"],
    softSkills: ["Creativity", "Empathy", "Storytelling", "Communication"],
    culturalFit: ["User-centric", "Design-driven culture", "Inclusive environment"],
  },

  graphicDesign: {
    keywords: ["graphic designer", "visual designer", "brand designer", "creative designer", "illustrator", "motion designer", "video editor", "motion graphics"],
    title: "Graphic Designer",
    description: "We're hiring a Graphic Designer to create compelling visual content across digital and print media. You'll shape our brand identity through everything from social graphics to marketing campaigns.",
    requirements: ["2+ years graphic design experience", "Expert proficiency in Adobe Creative Suite (Photoshop, Illustrator, InDesign)", "Strong portfolio demonstrating brand and marketing design", "Typography, color theory, and layout fundamentals", "Ability to work within and evolve brand guidelines"],
    preferredSkills: ["Motion graphics (After Effects, Premiere Pro)", "Figma or Canva for collaborative work", "Social media content formats", "Print production knowledge", "Basic photography/photo editing"],
    experience: "2+ years",
    industryExperience: ["Agencies", "Media", "D2C brands"],
    softSkills: ["Creativity", "Time management", "Receptiveness to feedback"],
    culturalFit: ["Brand-conscious", "Deadline-driven", "Collaborative"],
  },

  pm: {
    keywords: ["product manager", "product owner", "product lead", "technical product manager"],
    title: "Product Manager",
    description: "We're seeking a Product Manager to define product strategy, prioritize the roadmap, and collaborate with engineering and design to deliver features that delight users and drive growth.",
    requirements: ["4+ years product management experience", "Track record of shipping successful products", "Strong analytical skills and data-driven decision making", "Excellent stakeholder communication", "Experience writing PRDs and user stories"],
    preferredSkills: ["SQL or data querying skills", "A/B testing and experimentation", "Agile/Scrum certification", "Technical background or CS degree", "Market research and competitive analysis"],
    experience: "4+ years",
    industryExperience: ["Tech", "SaaS"],
    softSkills: ["Leadership", "Communication", "Strategic thinking", "Empathy"],
    culturalFit: ["Customer-obsessed", "Data-informed", "Cross-functional collaboration"],
  },

  projectManager: {
    keywords: ["project manager", "scrum master", "program manager", "delivery manager", "agile coach", "project coordinator"],
    title: "Project Manager",
    description: "We're hiring a Project Manager to plan, execute, and deliver projects on time and within scope. You'll coordinate cross-functional teams, manage risks, and keep stakeholders aligned.",
    requirements: ["3+ years project management experience", "Proficiency with project tools (Jira, Asana, Monday.com)", "Agile and/or waterfall methodology experience", "Risk management and mitigation planning", "Budget tracking and resource allocation"],
    preferredSkills: ["Certifications (PMP, PRINCE2, CSM)", "Gantt charts and critical path analysis", "Stakeholder reporting dashboards", "Vendor and contract management", "Change management"],
    experience: "3+ years",
    industryExperience: ["Tech", "Consulting", "Construction"],
    softSkills: ["Organization", "Leadership", "Communication", "Conflict resolution"],
    culturalFit: ["Deadline-driven", "Process-oriented", "Team facilitator"],
  },

  // ═══════════════════ BUSINESS / OPERATIONS ═══════════════════

  marketing: {
    keywords: ["marketing manager", "digital marketing", "growth marketer", "seo specialist", "sem specialist", "performance marketing", "brand manager", "marketing executive"],
    title: "Marketing Manager",
    description: "We're hiring a Marketing Manager to develop and execute marketing strategies that drive brand awareness, user acquisition, and engagement across multiple channels.",
    requirements: ["3+ years marketing experience", "Proven track record in digital marketing campaigns", "Analytics proficiency (Google Analytics, Mixpanel)", "Content strategy and copywriting skills", "Budget management and ROI analysis"],
    preferredSkills: ["SEO/SEM expertise", "Marketing automation (HubSpot, Marketo)", "Social media advertising", "Email marketing and CRM tools", "Video content creation"],
    experience: "3+ years",
    industryExperience: ["Tech", "D2C"],
    softSkills: ["Creativity", "Communication", "Analytical thinking"],
    culturalFit: ["Growth-oriented", "Experimental mindset", "Brand-conscious"],
  },

  socialMedia: {
    keywords: ["social media manager", "community manager", "social media specialist", "influencer marketing", "content creator"],
    title: "Social Media Manager",
    description: "We're looking for a Social Media Manager to grow our online presence and engage our community. You'll create content calendars, manage channels, and turn followers into fans.",
    requirements: ["2+ years social media management experience", "Proven audience growth on major platforms (Instagram, TikTok, LinkedIn, X)", "Content creation skills (graphics, short-form video, copy)", "Social analytics and reporting", "Community engagement and moderation"],
    preferredSkills: ["Paid social campaigns (Meta Ads, TikTok Ads)", "Influencer partnership management", "Social listening tools (Hootsuite, Sprout Social)", "Video editing (CapCut, Premiere)", "Trend spotting and viral content instincts"],
    experience: "2+ years",
    industryExperience: ["D2C", "Media", "Lifestyle brands"],
    softSkills: ["Creativity", "Responsiveness", "Voice and tone mastery"],
    culturalFit: ["Trend-aware", "Community-first", "Fast-paced"],
  },

  contentWriter: {
    keywords: ["content writer", "copywriter", "content marketer", "blog writer", "content strategist", "editor", "journalist", "scriptwriter", "ghostwriter"],
    title: "Content Writer",
    description: "We're hiring a Content Writer to craft compelling copy across blogs, landing pages, and campaigns. You'll turn complex ideas into content that engages readers and drives action.",
    requirements: ["2+ years professional writing experience", "Strong portfolio of published work", "SEO writing fundamentals (keywords, structure, intent)", "Ability to adapt tone across formats and audiences", "Research and interview skills"],
    preferredSkills: ["Content management systems (WordPress, Webflow)", "Email and conversion copywriting", "Basic analytics (Google Analytics, Search Console)", "AI-assisted writing workflows", "Subject-matter expertise in tech or B2B"],
    experience: "2+ years",
    industryExperience: ["Media", "SaaS", "Agencies"],
    softSkills: ["Storytelling", "Self-editing", "Deadline discipline", "Curiosity"],
    culturalFit: ["Quality over quantity", "Audience-first", "Feedback-friendly"],
  },

  sales: {
    keywords: ["sales representative", "account executive", "business development", "bdr", "sdr", "sales manager", "sales executive", "account manager", "inside sales"],
    title: "Sales Representative",
    description: "Join our sales team to drive revenue growth by building relationships with prospects, understanding their needs, and delivering compelling product demonstrations.",
    requirements: ["2+ years B2B sales experience", "Proven quota attainment track record", "CRM proficiency (Salesforce, HubSpot)", "Excellent presentation and negotiation skills", "Pipeline management and forecasting"],
    preferredSkills: ["SaaS sales experience", "Outbound prospecting tools (Outreach, Apollo)", "Industry vertical expertise", "Solution selling methodology (MEDDIC, SPIN)", "Contract negotiation"],
    experience: "2+ years",
    industryExperience: ["SaaS", "Enterprise software"],
    softSkills: ["Persuasion", "Resilience", "Active listening", "Time management"],
    culturalFit: ["Results-driven", "Competitive spirit", "Team player"],
  },

  customerSupport: {
    keywords: ["customer support", "customer service", "support representative", "support agent", "call center", "customer care"],
    title: "Customer Support Representative",
    description: "We're looking for a Customer Support Representative to help our users succeed. You'll resolve issues across chat, email, and phone while turning frustrated customers into loyal advocates.",
    requirements: ["1+ years customer support experience", "Excellent written and verbal communication", "Experience with support platforms (Zendesk, Intercom, Freshdesk)", "Ability to troubleshoot and explain solutions clearly", "Patience and empathy under pressure"],
    preferredSkills: ["Technical product support experience", "Knowledge base writing", "Multilingual abilities", "CRM familiarity", "Support metrics understanding (CSAT, FRT, resolution time)"],
    experience: "1+ years",
    industryExperience: ["SaaS", "E-commerce", "Consumer services"],
    softSkills: ["Empathy", "Patience", "Clear communication", "Problem-solving"],
    culturalFit: ["Customer-first", "Team-oriented", "Calm under pressure"],
  },

  customerSuccess: {
    keywords: ["customer success", "csm", "client success", "onboarding specialist", "account success"],
    title: "Customer Success Manager",
    description: "We're hiring a Customer Success Manager to drive retention and growth in our customer base. You'll own onboarding, adoption, renewals, and expansion for a portfolio of accounts.",
    requirements: ["2+ years customer success or account management experience", "Track record of improving retention and NPS", "Experience running QBRs and success plans", "CRM and CS platform proficiency (Gainsight, ChurnZero, HubSpot)", "Data-driven approach to account health"],
    preferredSkills: ["SaaS product expertise", "Upsell/cross-sell experience", "Onboarding program design", "Customer training and webinars", "Churn prediction and playbooks"],
    experience: "2+ years",
    industryExperience: ["SaaS", "B2B software"],
    softSkills: ["Relationship building", "Proactive communication", "Strategic thinking"],
    culturalFit: ["Customer-obsessed", "Revenue-minded", "Collaborative"],
  },

  hr: {
    keywords: ["hr manager", "human resources", "recruiter", "talent acquisition", "hr generalist", "people operations", "hr executive", "hiring manager", "hrbp"],
    title: "HR Manager",
    description: "We're looking for an HR Manager to lead our people function. You'll own recruitment, employee relations, performance management, and help build a culture where people thrive.",
    requirements: ["3+ years HR experience", "Full-cycle recruitment experience", "Knowledge of labor law and compliance", "HRIS experience (BambooHR, Workday, or similar)", "Performance management and employee relations"],
    preferredSkills: ["Compensation and benefits design", "HR certifications (SHRM, CIPD, PHR)", "Employer branding", "Learning and development programs", "HR analytics and reporting"],
    experience: "3+ years",
    industryExperience: ["Tech", "Corporate"],
    softSkills: ["Discretion", "Empathy", "Conflict resolution", "Communication"],
    culturalFit: ["People-first", "Fair and consistent", "Culture builder"],
  },

  finance: {
    keywords: ["accountant", "financial analyst", "finance manager", "bookkeeper", "controller", "cfo", "auditor", "accounts payable", "accounts receivable", "payroll"],
    title: "Accountant",
    description: "We're hiring an Accountant to manage our financial records and reporting. You'll handle month-end close, reconciliations, and ensure accuracy and compliance across all financial operations.",
    requirements: ["2+ years accounting experience", "Proficiency in accounting software (QuickBooks, Xero, or NetSuite)", "Month-end close and reconciliation experience", "Financial statement preparation", "Advanced Excel skills"],
    preferredSkills: ["CPA, ACCA, or CA qualification (or in progress)", "ERP systems experience", "Tax preparation knowledge", "Audit experience", "Financial modeling"],
    experience: "2+ years",
    industryExperience: ["Corporate finance", "Public accounting"],
    softSkills: ["Accuracy", "Integrity", "Organization", "Analytical thinking"],
    culturalFit: ["Detail-obsessed", "Deadline-driven", "Ethical standards"],
  },

  operations: {
    keywords: ["operations manager", "operations analyst", "business operations", "ops manager", "operations coordinator", "chief of staff", "general manager"],
    title: "Operations Manager",
    description: "We're looking for an Operations Manager to streamline how we work. You'll optimize processes, manage vendors, oversee daily operations, and drive efficiency across the business.",
    requirements: ["3+ years operations experience", "Process design and improvement track record", "Project management proficiency", "Budget and vendor management", "Data analysis for operational decisions"],
    preferredSkills: ["Lean/Six Sigma methodology", "Automation tools (Zapier, Make)", "ERP or operations software", "Cross-functional leadership", "KPI dashboard creation"],
    experience: "3+ years",
    industryExperience: ["Startups", "Logistics", "Services"],
    softSkills: ["Organization", "Problem-solving", "Leadership", "Adaptability"],
    culturalFit: ["Efficiency-driven", "Systems thinker", "Hands-on"],
  },

  businessAnalyst: {
    keywords: ["business analyst", "ba", "requirements analyst", "process analyst", "systems analyst"],
    title: "Business Analyst",
    description: "We're hiring a Business Analyst to bridge business needs and technical solutions. You'll gather requirements, analyze processes, and translate stakeholder goals into actionable specifications.",
    requirements: ["2+ years business analysis experience", "Requirements gathering and documentation (BRDs, user stories)", "Process mapping (BPMN, flowcharts)", "Stakeholder interview and workshop facilitation", "SQL and data analysis basics"],
    preferredSkills: ["Certifications (CBAP, PMI-PBA)", "Agile environments experience", "Wireframing tools (Balsamiq, Figma)", "Power BI or Tableau", "Gap analysis and feasibility studies"],
    experience: "2+ years",
    industryExperience: ["Consulting", "Enterprise", "Fintech"],
    softSkills: ["Analytical thinking", "Communication", "Facilitation", "Documentation"],
    culturalFit: ["Bridge-builder", "Detail-oriented", "Business-minded"],
  },

  legal: {
    keywords: ["legal counsel", "lawyer", "attorney", "paralegal", "legal advisor", "compliance officer", "contracts manager"],
    title: "Legal Counsel",
    description: "We're looking for Legal Counsel to support our growing business. You'll draft and review contracts, manage compliance, advise on legal risks, and support commercial negotiations.",
    requirements: ["3+ years legal experience (in-house or firm)", "Law degree and bar admission", "Contract drafting and negotiation expertise", "Corporate and commercial law knowledge", "Risk assessment and legal research skills"],
    preferredSkills: ["Tech/SaaS industry experience", "Data privacy expertise (GDPR, CCPA)", "IP and trademark management", "Employment law knowledge", "Contract lifecycle management tools"],
    experience: "3+ years",
    industryExperience: ["Corporate law", "Tech"],
    softSkills: ["Judgment", "Precision", "Negotiation", "Clear communication"],
    culturalFit: ["Business-enabling", "Ethical standards", "Pragmatic advisor"],
  },

  admin: {
    keywords: ["executive assistant", "administrative assistant", "office manager", "office administrator", "receptionist", "personal assistant", "virtual assistant", "data entry", "secretary"],
    title: "Executive Assistant",
    description: "We're hiring an Executive Assistant to support our leadership team. You'll manage calendars, coordinate travel and meetings, handle communications, and keep operations running smoothly.",
    requirements: ["2+ years administrative or EA experience", "Calendar and inbox management expertise", "Proficiency in office tools (Google Workspace, Microsoft Office)", "Travel planning and expense management", "Discretion with confidential information"],
    preferredSkills: ["Event planning experience", "Project coordination", "Document preparation and presentations", "CRM data management", "Bookkeeping basics"],
    experience: "2+ years",
    industryExperience: ["Corporate", "Startups"],
    softSkills: ["Organization", "Proactivity", "Discretion", "Multi-tasking"],
    culturalFit: ["Reliable", "Anticipates needs", "Calm under pressure"],
  },

  // ═══════════════════ OTHER INDUSTRIES ═══════════════════

  teacher: {
    keywords: ["teacher", "tutor", "instructor", "trainer", "lecturer", "professor", "corporate trainer", "curriculum developer", "education"],
    title: "Teacher / Trainer",
    description: "We're looking for a passionate educator to deliver engaging learning experiences. You'll develop curriculum, teach classes, assess progress, and inspire learners to reach their potential.",
    requirements: ["2+ years teaching or training experience", "Subject matter expertise in the relevant field", "Curriculum development and lesson planning", "Student assessment and feedback delivery", "Classroom or virtual training management"],
    preferredSkills: ["Teaching certification or education degree", "E-learning platforms (Moodle, Canvas, Teachable)", "Interactive teaching methods", "Learning analytics", "Multilingual instruction"],
    experience: "2+ years",
    industryExperience: ["Education", "EdTech", "Corporate training"],
    softSkills: ["Patience", "Communication", "Adaptability", "Enthusiasm"],
    culturalFit: ["Learner-centered", "Growth mindset", "Inclusive teaching"],
  },

  healthcare: {
    keywords: ["nurse", "doctor", "physician", "pharmacist", "medical assistant", "healthcare", "dentist", "therapist", "physiotherapist", "lab technician", "radiologist"],
    title: "Registered Nurse",
    description: "We're hiring a compassionate healthcare professional to join our team. You'll provide high-quality patient care, collaborate with medical staff, and uphold the highest clinical standards.",
    requirements: ["Valid professional license and registration", "2+ years clinical experience", "Patient assessment and care planning", "Electronic health records (EHR) proficiency", "Knowledge of safety and infection control protocols"],
    preferredSkills: ["Specialty certifications (ICU, ER, pediatrics)", "Multilingual patient communication", "Telehealth experience", "Quality improvement participation", "Mentoring junior staff"],
    experience: "2+ years",
    industryExperience: ["Hospitals", "Clinics", "Healthcare"],
    softSkills: ["Compassion", "Attention to detail", "Teamwork", "Composure"],
    culturalFit: ["Patient-first", "Safety culture", "Continuous learning"],
  },

  civilEngineer: {
    keywords: ["civil engineer", "structural engineer", "construction manager", "site engineer", "quantity surveyor", "architect", "construction"],
    title: "Civil Engineer",
    description: "We're looking for a Civil Engineer to design and oversee construction projects. You'll manage site work, ensure code compliance, and deliver infrastructure that stands the test of time.",
    requirements: ["3+ years civil engineering experience", "Engineering degree and professional registration", "AutoCAD and design software proficiency", "Construction site supervision experience", "Knowledge of building codes and safety regulations"],
    preferredSkills: ["Structural analysis software (ETABS, SAP2000)", "BIM tools (Revit)", "Project cost estimation", "Geotechnical fundamentals", "PMP or construction management certification"],
    experience: "3+ years",
    industryExperience: ["Construction", "Infrastructure", "Real estate"],
    softSkills: ["Precision", "Problem-solving", "Leadership", "Communication"],
    culturalFit: ["Safety-first", "Quality-driven", "Field-ready"],
  },

  mechanicalEngineer: {
    keywords: ["mechanical engineer", "electrical engineer", "manufacturing engineer", "process engineer", "maintenance engineer", "hvac", "automotive engineer", "production engineer"],
    title: "Mechanical Engineer",
    description: "We're hiring a Mechanical Engineer to design, develop, and improve mechanical systems and products. You'll take concepts from CAD to production while optimizing for cost and quality.",
    requirements: ["3+ years mechanical engineering experience", "Engineering degree in relevant discipline", "CAD proficiency (SolidWorks, AutoCAD, or CATIA)", "Manufacturing processes knowledge", "Testing, validation, and troubleshooting"],
    preferredSkills: ["FEA/simulation tools (ANSYS)", "GD&T and tolerance analysis", "Lean manufacturing principles", "PLC basics for automation", "Six Sigma certification"],
    experience: "3+ years",
    industryExperience: ["Manufacturing", "Automotive", "Energy"],
    softSkills: ["Analytical thinking", "Precision", "Teamwork"],
    culturalFit: ["Quality-focused", "Continuous improvement", "Hands-on"],
  },

  hospitality: {
    keywords: ["chef", "cook", "restaurant manager", "hotel manager", "hospitality", "barista", "waiter", "bartender", "housekeeping", "front desk", "kitchen"],
    title: "Restaurant Manager",
    description: "We're looking for a Restaurant Manager to lead daily operations and deliver exceptional guest experiences. You'll manage staff, control costs, and maintain the highest service standards.",
    requirements: ["3+ years hospitality management experience", "Staff hiring, training, and scheduling", "Inventory and cost control", "Food safety and hygiene certification", "POS systems and daily reporting"],
    preferredSkills: ["Menu development collaboration", "Reservation platforms (OpenTable, Resy)", "Supplier negotiation", "Event and catering management", "Social media presence management"],
    experience: "3+ years",
    industryExperience: ["Restaurants", "Hotels", "F&B"],
    softSkills: ["Leadership", "Customer focus", "Composure under pressure", "Multi-tasking"],
    culturalFit: ["Guest-obsessed", "Team leadership", "High-energy environment"],
  },

  retail: {
    keywords: ["retail", "store manager", "sales associate", "cashier", "merchandiser", "shop assistant", "retail supervisor"],
    title: "Retail Store Manager",
    description: "We're hiring a Retail Store Manager to drive sales and lead our store team. You'll manage inventory, coach associates, and create a shopping experience customers love.",
    requirements: ["2+ years retail management experience", "Sales target achievement track record", "Staff scheduling and performance management", "Inventory management and loss prevention", "Visual merchandising standards"],
    preferredSkills: ["POS and retail management systems", "E-commerce integration (click & collect)", "Local marketing initiatives", "Customer loyalty programs", "Multi-store experience"],
    experience: "2+ years",
    industryExperience: ["Retail", "Fashion", "Consumer goods"],
    softSkills: ["Leadership", "Customer service", "Energy", "Coaching"],
    culturalFit: ["Sales-driven", "Team builder", "Customer-first"],
  },

  logistics: {
    keywords: ["logistics", "warehouse", "supply chain", "procurement", "inventory manager", "shipping", "fleet manager", "dispatcher", "forklift", "driver"],
    title: "Logistics Coordinator",
    description: "We're looking for a Logistics Coordinator to keep our supply chain moving. You'll coordinate shipments, manage inventory, optimize routes, and ensure on-time delivery every time.",
    requirements: ["2+ years logistics or supply chain experience", "Shipment scheduling and carrier coordination", "Inventory management systems (WMS/ERP)", "Documentation for domestic and international shipping", "Data entry accuracy and Excel proficiency"],
    preferredSkills: ["Customs and import/export knowledge", "Route optimization tools", "Vendor negotiation", "Lean warehouse practices", "Freight cost analysis"],
    experience: "2+ years",
    industryExperience: ["Logistics", "E-commerce", "Manufacturing"],
    softSkills: ["Organization", "Problem-solving", "Communication", "Time management"],
    culturalFit: ["Deadline-driven", "Detail-oriented", "Process-focused"],
  },

  eventCoordinator: {
    keywords: ["event coordinator", "event manager", "event planner", "wedding planner", "conference organizer"],
    title: "Event Coordinator",
    description: "We're hiring an Event Coordinator to plan and execute memorable events. You'll manage vendors, budgets, and logistics — from intimate gatherings to large-scale conferences.",
    requirements: ["2+ years event planning experience", "Vendor sourcing and contract negotiation", "Budget management and cost tracking", "On-site event execution and troubleshooting", "Timeline and run-of-show creation"],
    preferredSkills: ["Event platforms (Eventbrite, Cvent, Hopin)", "AV and production knowledge", "Sponsorship coordination", "Post-event analytics and surveys", "Social media event promotion"],
    experience: "2+ years",
    industryExperience: ["Events", "Hospitality", "Corporate"],
    softSkills: ["Organization", "Calm under pressure", "Negotiation", "Creativity"],
    culturalFit: ["Detail-obsessed", "Guest experience focus", "Flexible schedule"],
  },

  translator: {
    keywords: ["translator", "interpreter", "localization", "linguist", "translation"],
    title: "Translator",
    description: "We're looking for a Translator to make our content accessible across languages. You'll translate documents, marketing materials, and product content while preserving tone and cultural nuance.",
    requirements: ["2+ years professional translation experience", "Native-level fluency in target language(s)", "CAT tools proficiency (SDL Trados, MemoQ, or Smartcat)", "Subject-matter translation experience (technical, legal, or marketing)", "Quality assurance and proofreading skills"],
    preferredSkills: ["Certification (ATA or equivalent)", "Localization workflow experience", "Subtitling and transcription", "Machine translation post-editing", "Terminology management"],
    experience: "2+ years",
    industryExperience: ["Localization", "Media", "Legal services"],
    softSkills: ["Precision", "Cultural sensitivity", "Deadline discipline"],
    culturalFit: ["Quality-focused", "Independent worker", "Detail-oriented"],
  },
};

/**
 * Score-based template matcher.
 * Longer keyword matches are more specific and score higher —
 * "data scientist" (14 pts) beats "data" (4 pts).
 * Returns null if nothing matches (caller falls back to generic).
 */
export function matchJobTemplate(prompt: string): JobTemplate | null {
  const lower = prompt.toLowerCase();
  let best: { template: JobTemplate; score: number } | null = null;

  for (const template of Object.values(jobTemplates)) {
    let score = 0;
    for (const kw of template.keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { template, score };
    }
  }
  return best?.template ?? null;
}
