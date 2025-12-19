import { StrategyDefinition, StrategyType, GeminiModel } from './types';

export const MODEL_PRICING = {
  [GeminiModel.Flash]: { input: 0.075, output: 0.30 }, // Per 1M tokens (Approx)
  [GeminiModel.Lite]: { input: 0.075, output: 0.30 }, // Same as Flash for now
  [GeminiModel.Pro]: { input: 3.50, output: 10.50 },   // Per 1M tokens
};

export const STRATEGIES: StrategyDefinition[] = [
  {
    id: 'fixed',
    name: StrategyType.FixedSize,
    description: "Splits text into chunks of a predetermined character count, regardless of content structure.",
    bestFor: ["Simple implementations", "Uniform processing", "Memory-constrained systems"],
    worstFor: ["Semantic coherence", "Complex document structures"],
    complexity: 'Low',
    requiresAI: false
  },
  {
    id: 'recursive',
    name: StrategyType.Recursive,
    description: "Iteratively splits text using a hierarchy of separators (e.g., \\n\\n, \\n, space) to find the largest possible chunks that fit constraints.",
    bestFor: ["LangChain compatibility", "General-purpose RAG", "Preserving context"],
    worstFor: ["Highly specialized formats", "Streaming data"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'code',
    name: StrategyType.Code,
    description: "Splits code based on language-specific syntax trees (classes, functions) to preserve logic.",
    bestFor: ["Python", "JavaScript/TypeScript", "Rust"],
    worstFor: ["Natural language", "Minified code"],
    complexity: 'High',
    requiresAI: false
  },
  {
    id: 'regex',
    name: StrategyType.Regex,
    description: "Splits text based on a user-defined Regular Expression pattern.",
    bestFor: ["Custom formats", "Log files", "Specific delimiters"],
    worstFor: ["General prose", "Variable structure"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'document',
    name: StrategyType.Document,
    description: "Splits based on document structure like headers, sections, or pages.",
    bestFor: ["Markdown", "Books", "Technical Docs"],
    worstFor: ["Unstructured text", "Tweets/Emails"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'semantic',
    name: StrategyType.Semantic,
    description: "Uses AI to identify topic shifts and create chunks based on meaning rather than length.",
    bestFor: ["High-accuracy RAG", "Multi-topic documents"],
    worstFor: ["Real-time/Latency sensitive", "Low budget"],
    complexity: 'High',
    requiresAI: true
  },
  {
    id: 'sentence',
    name: StrategyType.Sentence,
    description: "Splits at precise sentence boundaries using Intl.Segmenter, grouping them until a size threshold is reached.",
    bestFor: ["QA Systems", "News articles"],
    worstFor: ["Lists", "Complex formatting"],
    complexity: 'Low',
    requiresAI: false
  },
  {
    id: 'paragraph',
    name: StrategyType.Paragraph,
    description: "Preserves paragraph integrity, splitting only when absolutely necessary.",
    bestFor: ["Essays", "Narratives", "Blogs"],
    worstFor: ["Code blocks", "Irregular formatting"],
    complexity: 'Low',
    requiresAI: false
  },
  {
    id: 'token',
    name: StrategyType.Token,
    description: "Splits based on token count to strictly fit LLM context windows.",
    bestFor: ["LLM Training", "Cost optimization"],
    worstFor: ["Human readability"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'sliding',
    name: StrategyType.SlidingWindow,
    description: "Creates overlapping chunks by moving a window across text.",
    bestFor: ["Context continuity", "Search/Retrieval"],
    worstFor: ["Storage efficiency"],
    complexity: 'Low',
    requiresAI: false
  },
  {
    id: 'content',
    name: StrategyType.ContentAware,
    description: "Detects content type (code, tables, prose) and switches strategies accordingly.",
    bestFor: ["Mixed-format docs", "Technical papers"],
    worstFor: ["Pure prose"],
    complexity: 'High',
    requiresAI: false
  },
  {
    id: 'metadata',
    name: StrategyType.Metadata,
    description: "Uses headers, timestamps, or tags to define boundaries.",
    bestFor: ["Chat logs", "Emails", "Multi-author docs"],
    worstFor: ["Unstructured data"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'linguistic',
    name: StrategyType.Linguistic,
    description: "Uses grammatical features (clauses, discourse markers) to split text.",
    bestFor: ["Deep NLP analysis", "Legal docs"],
    worstFor: ["Informal text"],
    complexity: 'High',
    requiresAI: true
  },
  {
    id: 'hybrid',
    name: StrategyType.Hybrid,
    description: "Adaptively combines paragraph and sentence splitting for balance.",
    bestFor: ["Production systems", "Diverse corpus"],
    worstFor: ["Simple use cases"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'llm',
    name: StrategyType.LLM,
    description: "Asks an LLM to intelligently segment the text based on context.",
    bestFor: ["Nuanced content", "Highest accuracy"],
    worstFor: ["Large scale processing"],
    complexity: 'High',
    requiresAI: true
  }
];

export const INITIAL_TEXT = `
# Microsoft 365 Copilot Chat Technical Readiness Guide

**Creating the AI-powered organization**

September 2025
© Copyright Microsoft Corporation. All rights reserved.

---

> **[Figure 1: Title Page Visual]**
> *Visual Description:* An abstract 3D graphic featuring flowing, ribbon-like structures in pastel purple and pink. Icons for Microsoft Word, PowerPoint, and Teams are integrated into the ribbons. A floating search bar is visible with the text "Ask a work question, or use / to reference people, files and more," along with a file tag labeled "Revenue growth.xls".
> *Data/Context:* This establishes the theme of Microsoft 365 Copilot's integration across the productivity suite.

---

## Table of contents

The guide is organized into four primary phases of technical readiness:

1.  **Get ready**
    *   Perform the Microsoft 365 Copilot Optimization Assessment
    *   Address security, governance, and data access questions
    *   Build Microsoft 365 Copilot implementation plan
2.  **Onboard & engage**
    *   Ensure appropriate Data Security controls are in place
    *   Prepare your organization for Microsoft 365 Copilot with setup guides
    *   Assign permissions by role (usage reports)
3.  **Deliver impact**
    *   Establish a service management plan
    *   Analyze usage reports
4.  **Extend & optimize**
    *   Design, build, and deploy agents
    *   Build your own Copilot Studio custom agents

---

## The journey to becoming AI powered

Becoming an AI-powered organization requires progress across three parallel pillars, built upon **Responsible AI principles**:

### Leadership
Develop leadership capabilities to leverage AI for business outcomes:
*   Foundational learning
*   Business strategy
*   AI Council creation
*   Providing clarity and prioritization

### Human change
Manage the human transformation through robust user enablement programs:
*   Invest in the employee experience
*   Improve the culture
*   Authentically integrate feedback

### Technical skills [You are here]
Build and iterate technical skills to deliver on business results:
*   Provide access to training and experts
*   Manage and mitigate risk
*   Improve service management process

---

## Microsoft 365 Copilot implementation

> **[Figure 2: Implementation Flowchart]**
> *Visual Description:* A flowchart showing "Copilot implementation" branching into a "Copilot readiness checklist" (Sponsor, Scenarios, Security). From there, the path splits into "Human change" and "Technical readiness." A "Leadership journey" arrow runs underneath both.
> *Data/Context:* Highlights that Technical Readiness and Human Change workstreams support each other for maximum value and ROI. The current focus is "Technical readiness."

### Technical readiness
Address technical deployment and optimization, including governance, security, compliance, and management.

---

## Essentials for Copilot success

*   Nominate and activate your Copilot executive **sponsors**, in partnership with your AI Council.
*   Accelerate your business impact by defining highest value **scenarios**.
*   Define your path to **secure** your data for compliance and peace of mind.

---

## Microsoft 365 Copilot Implementation overview

| Phase | Human Change (User Enablement Workstream) | Technical Readiness Workstream [You are here] |
| :--- | :--- | :--- |
| **Get ready** | • Secure exec sponsorship, create AI Council, and define RAI principles<br>• Identify success owners, Champions, and early adopter cohorts<br>• Detail high value scenarios and personas<br>• Be intentional with assignment and concentrate seats<br>• Define success criteria, KPIs, and success measurement plan | • Address data security, governance, and data access questions<br>• Build shared Microsoft 365 Copilot implementation plan with User Enablement team |
| **Onboard & engage** | • Complete User Enablement Strategy training<br>• Define user experience and feedback strategy<br>• Design and deploy training and engagement community (Center of Excellence/Champion Platform)<br>• Launch employee communications and Champion program<br>• Onboard executives and user cohorts<br>• Deliver user Champions and support staff training | • Ensure appropriate Data Security controls are in place<br>• Prepare your organization for Microsoft 365 Copilot with setup guide: deploy Microsoft 365 apps, if needed; assign licenses<br>• Assign permissions by role to provide access to the Microsoft 365 Copilot usage report |
| **Deliver impact** | • Review success measures and user survey results<br>• Conduct feedback and reporting analysis<br>• Deliver extended training and adoption support<br>• Identify additional optimization scenarios<br>• Iterate user experience strategy<br>• Gather and amplify success stories | • Establish service management plan<br>• Analyze Microsoft 365 Copilot usage reports and the Microsoft Copilot Dashboard to observe user adoption, retention, and engagement |
| **Extend & optimize** | • Extend to new high value scenarios<br>• Deliver business process transformation with Copilot Studio, plugins, and connectors<br>• Drive group and cross-organizational productivity and innovation<br>• Understand custom line of business opportunities | • Design, build, and publish Copilot agents to deliver unique experiences<br>• Build your own custom agents |

---

## Microsoft 365 Copilot Readiness checklist and key resources

### Technical Readiness Tasks
*   **Get ready:** Address data security, governance, and data access questions; Build shared implementation plan.
*   **Onboard & engage:** Apply appropriate data security and governance controls; Prepare organization with setup guide; Assign permissions for usage reports.
*   **Deliver impact:** Establish service management plan; Analyze usage reports and Dashboard.
*   **Extend & optimize:** Design, build, and publish Copilot agents; Build custom agents.

### Microsoft Resources
*   **Microsoft Adoption:** Resources for delivering employee satisfaction and business value.
*   **Copilot learning hub:** Online training and certification programs.
*   **Microsoft FastTrack:** Deployment assistance benefit.
*   **Copilot Dashboard:** Measurement of investment impact.

---

## Implementation project summary: Shared milestone view

> **[Figure 3: 12-Week Timeline]**
> *Visual Description:* A horizontal timeline spanning Week 00 to Week 12, categorized into "First 30 days," "30-60 days," and "Recurring tasks."
> *Data/Context:*
> *   **Week 00:** Purchase decision.
> *   **Weeks 01-02:** Stakeholder alignment, assemble team, foundational learning, share scenarios.
> *   **Weeks 03-05:** Select initial cohort, helpdesk onboarding, deliver shared implementation plan, ensure data security controls, install apps, assign licenses.
> *   **Weeks 06-08:** Triage feedback, assign reporting roles, update support systems, enhance Center of Excellence.
> *   **Weeks 09-12:** Service Health Review, analyze usage data, summarize risk/opportunities, prepare AI Council insights, launch extensibility skilling.

---

# Get ready
**Microsoft 365 Copilot**

## Take the Security for AI Assessment

> **[Figure 4: AI Security Dimensions]**
> *Visual Description:* A diamond-shaped diagram labeled "AI Security Dimensions" with four quadrants: **Prepare**, **Discover**, **Protect**, and **Govern**.
> *Data/Context:* The assessment (available at aka.ms/S4AIassessment) evaluates current AI security across these four pillars.

---

## Address security, governance, and data access questions

**Shared activity**

Access the [IT Professional admin resources](https://learn.microsoft.com/en-us/microsoft-365-copilot/) for additional documentation to address deep technical questions:
*   How does Microsoft 365 Copilot Chat work? How is it different from Microsoft 365 Copilot?
*   Is this AI-powered chat available for eligible Entra ID users at no additional charge?
*   How does Microsoft 365 Copilot work?
*   How is my data indexed?
*   How should I prepare my data by adjusting permissions and policies?
*   Where does my data go?
*   How do Copilot agents work?
*   What is Microsoft’s responsible AI commitment?

**Note:** For more information on AI Council and RAI, visit the User Enablement Guide.

---

## Build Microsoft 365 Copilot Chat implementation plan

**Shared activity**

Use the results of the [scenario discovery](https://aka.ms/Copilot/ScenarioLibrary) to develop a plan for implementation.

**Questions to help develop the plan:**
*   Are there any data security questions that you need to address?
*   Do all items have owners and due dates?
*   Have you identified key adoption steps for the first set of prioritized scenarios?

> **[Figure 5: AI Transformation Roadmap Example]**
> *Visual Description:* A table mapping 3 scenarios across a timeline: Quick wins (0-1 month), 1-2 weeks, 2-3 weeks, 4-6 months, and 12 months.
> *Data/Context:* Example milestones include purchasing seats, introducing Copilot in Teams/Outlook, training sessions, integrating LOB apps, and building custom copilots.

---

# Onboard & engage
**Microsoft 365 Copilot**

## Prepare your organization for Microsoft 365 Copilot with setup guides

**Shared activity**

*   **Readout to the shared team:** Deliver a readout on the prioritized activities for data security controls based on the selected deployment path.
*   **Validate user cohorts:** Confirm groups prior to assignment of licenses.

### Microsoft 365 Apps: Application Compatibility Promise
Leverage **App Assure** if you encounter application compatibility issues moving to a monthly update channel.
*   **Troubleshoot:** Resolve root causes of compatibility issues.
*   **No Cost:** Service included with your license.
*   **Direct Line:** Communication to Microsoft product engineering teams.
*   **Contact:** achelp@microsoft.com | [aka.ms/AppAssure](https://aka.ms/AppAssure)

---

## Pinning Microsoft Copilot

**Encourage your organization to use Copilot by pinning it to the navigation bar of the Microsoft 365 apps.**

*   By default, Copilot is not pinned. Users will be asked if they want to pin it.
*   Administrators can change this in the Microsoft 365 admin center by selecting "Pin Microsoft Copilot to the navigation bar (recommended)".

---

## Assign permissions by role (usage reports)

The Microsoft Copilot 365 usage report allows you to interpret how ready your organization is to adopt the service.

**Eligible roles to see the report:**
*   Global admins
*   Exchange admins
*   SharePoint admins
*   Reports reader
*   Teams admins
*   User Experience Success Manager

**Tasks:**
*   Develop a list of users requiring permissions.
*   Assign permissions to the identified users.

---

# Deliver impact
**Microsoft 365 Copilot**

## Establish a service management plan

Establishing a service management plan empowers IT and User Enablement teams to:
1.  Periodically review health and business value.
2.  Conduct periodic assessments of governance, security, and enablement practices.
3.  Identify opportunities for expansion and optimization.

> **[Figure 6: Service Health Reviews Components]**
> *Visual Description:* A circular diagram with six connected bubbles: **Performance**, **Feedback analysis**, **Incident review**, **Success stories**, **Roadmap planning**, and **Risk mitigation**.

**Resources:**
*   Access admin documentation for technical requirements.
*   Join the [Copilot community](https://techcommunity.microsoft.com/t5/microsoft-365-copilot/ct-p/Microsoft365Copilot).
*   Participate in "Ask Microsoft Anything" (AMA) events.

---

## Shared deliverable: Service Health Reviews (SHR)

**Shared activity**

An SHR is a systematic process of evaluating the current state and future needs of IT services. It provides recommendations for improving management, governance, and alignment with business goals.

**Recommended practices:**
*   **Chair:** Copilot Success Owner.
*   **Cadence:** Monthly, moving to quarterly after onboarding.
*   **Input:** Service feedback and top issues from User Enablement staff.
*   **Environment:** Data-driven, fact-finding, and blame-free.
*   **Outcome:** Data provided for AI Council review.

---

## Analyze usage reports

**Interpret the Microsoft 365 Admin Center Usage Report**
*   **Readiness section:** Review technical eligibility and license assignment.
*   **Usage section:** Summary of adoption with visibility into the "last activity" date.
*   **Export:** Data can be exported to .csv for further analysis.

**Interpret the Microsoft Copilot Dashboard data**
*   **Readiness tab:** Assess overall rollout readiness based on app usage.
*   **Adoption tab:** Track trends per app and feature usage.
*   **Impact tab:** Visibility into assisted hours, time savings, and behavioral changes.
*   **Learning tab:** Research on AI impact on workplace productivity.

---

# Extend & optimize
**Microsoft 365 Copilot**

## Design, build, and deploy agents

**Building agents with Copilot Studio**
Copilot Studio is the platform to build agents that extend Microsoft 365 Copilot or operate standalone:
*   **End users** can build in Copilot Studio and SharePoint.
*   **IT and developers** can build in Copilot Studio and Azure AI Foundry.

**Capabilities:**
*   Handle highly variable situations in real time.
*   Collaborate with multiple users and other agents across disconnected systems.
*   Use natural language to design and operate workflows.

---

## Copilot Studio in a Day

A ½ to 1-day hands-on workshop for subject matter experts and business users.

**Goals:**
*   Understand product value and preview features.
*   Understand differentiation from competition.
*   Develop agents for high-value scenarios.

**Materials:**
*   Workshop: [aka.ms/CopilotStudioWorkshop](https://aka.ms/CopilotStudioWorkshop)
*   Learning Path: [aka.ms/CopilotStudioTraining](https://aka.ms/CopilotStudioTraining)
*   Events: [aka.ms/CopilotStudioInADay](https://aka.ms/CopilotStudioInADay)

---

## Next steps & resources

*   Learn about [requirements](https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-requirements).
*   Follow the [What’s new in Copilot](https://techcommunity.microsoft.com/t5/microsoft-365-blog/bg-p/Microsoft365Blog) blog.
*   Review the [Forrester study](https://aka.ms/M365AppsTEIStudy) on Monthly Enterprise Channel benefits.
*   Use the [Microsoft 365 Apps admin center](https://config.office.com/) and Cloud Update.
*   Work with **App Assure** for compatibility issues.

---

## Microsoft investments to accelerate your time to value

*   **Microsoft Partner Deployment:** Customers buying >150 seats are eligible for co-investment in partner services.
*   **Microsoft FastTrack:** Request technical and deployment assistance.
*   **Microsoft Unified:** Expert-led services to get started on the Copilot journey.

---

## Copilot resources on Microsoft Adoption

**One site for all your Copilot needs: [adoption.microsoft.com/copilot](https://adoption.microsoft.com/copilot)**

*   Resources by role.
*   Interactive Scenario Library.
*   Product announcements and news.
*   **Take the Class:** Earn your User Enablement badge with **MS-4007**.

---

## Skilling experiences

### Microsoft Copilot Academy
*   Available to all M365 Copilot customers.
*   Centralized location for basics and upskilling.
*   Curated learning paths via the Viva Learning app.

### Microsoft Learn
*   Free, on-demand training content.
*   Step-by-step exercises for common prompts and use cases.

---

## Copilot Scenario Library

**Guidance by department:** [aka.ms/Copilot/ScenarioLibrary](https://aka.ms/Copilot/ScenarioLibrary)

| Role/Department | Key Metrics to Improve |
| :--- | :--- |
| **All roles & execs** | Improve meetings, Content creation, Manage daily agenda |
| **HR** | Cost per hire, Employee turnover, Compliance risk reduction |
| **Marketing** | Leads created, Brand value, Cost per lead |
| **Operations** | Customer retention, Product time to market, Supply chain efficiencies |
| **IT** | Outstanding support tickets, Application downtime, Departmental spending |
| **Sales** | Number of opportunities, Close rate, Revenue per sale |
| **Finance** | Accelerate cash flow, Spend on ERP system, Risk reduction |

---

## Training and documentation by phase

### User Enablement
*   **Get ready:** Copilot Experiences Explained (11m), Leading in the Era of AI, Drive enablement (2.5h).
*   **Onboard & engage:** User Experience Strategy template, Prompt Gallery, Leading in the Era of AI: Trust, Learn about prompts.
*   **Deliver impact:** Empower your workforce (7 scenarios), Craft effective prompts (2h), Get better results, Share best prompts.
*   **Extend & optimize:** Modern Collaboration Architecture.

### Technical Readiness
*   **Get ready:** Prepare your organization (1.5h), How it works (11m), Get ready (9m), Data/Privacy/Security, Deployment blueprint.
*   **Onboard & engage:** Get started (2h), Admin steps (46s), Apply Zero Trust, Enable users, SharePoint Adv Management.
*   **Deliver impact:** M365 Copilot Documentation, Copilot Dashboard implementation.
*   **Extend & optimize:** Extend M365 Copilot, Create agents with Studio (4h), Optimize and extend (1h), Build connectors/plugins (3h).

---

## Links to learn more (Selected)

**What is Copilot?**
*   [Introducing Microsoft 365 Copilot](https://news.microsoft.com/reinventing-productivity/)
*   [The Copilot System](https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview)

**Privacy & Security**
*   [Microsoft’s privacy policy](https://privacy.microsoft.com/)
*   [Data, privacy, and security for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-privacy)
*   [EU Data Boundary](https://learn.microsoft.com/en-us/mem/intune/fundamentals/data-residency-eu-data-boundary)

---

# Modern Management of Microsoft 365 Apps
**The importance of monthly update channels**

## Microsoft 365 Apps | update channels

> **[Figure 7: Update Channel Comparison]**
> *Visual Description:* A diagram comparing three channels: **Current Channel**, **Monthly Enterprise Channel**, and **Semi-Annual Enterprise Channel**.
> *Data/Context:*
> *   **Current Channel (CC):** Best for general-purpose devices. Features released as soon as ready. **Copilot ready!**
> *   **Monthly Enterprise Channel (MEC):** Recommended for Enterprise. Predictable monthly cadence. **Copilot ready!**
> *   **Semi-Annual Enterprise Channel (SAEC):** For non-human devices/specialized workloads. **No Copilot!**

### Monthly Enterprise Channel (MEC)
*   **Drivers:** Ensures fundamentals (performance, reliability), most secure, minimizes disruptions, alignment with agility.
*   **Benefits:** 70% of helpdesk claims eliminated, 15% performance increase vs SAEC, security features 6+ months faster, higher end-user satisfaction.

---

## Myths vs Reality: Semi-Annual Enterprise Channel (SAEC)

| Myth | Reality |
| :--- | :--- |
| **Copilot will be available for SAEC** | No plans to ship Copilot with SAEC; it evolves too fast. |
| **SAEC is more reliable** | Non-blocking issues can stay unfixed for 6-12 months. |
| **Monthly updates kill my network** | Use **Delivery Optimization**; updates are small and incremental. |
| **SAEC only updates every 6 months** | Staying current requires updating at least once a month regardless of channel. |
| **SAEC is recommended for Enterprise** | MEC is now the recommended standard for Enterprise. |

---

## Best practices: moving to monthly

1.  **Define user personas:** Leverage faster channels (Beta/Current) to validate before broad deployment.
2.  **Custom rollout waves:**
    *   **Wave 1 (UV):** 1-10% representation (7 days).
    *   **Wave 2:** 10-15% of users (1-5 days).
    *   **Wave 3:** 10-15% of users (1-5 days).
    *   **Wave 4:** All remaining devices.
3.  **App Assure:** Use [aka.ms/AppAssure](http://aka.ms/AppAssure) to remediate any app compatibility issues at no additional cost.

---

## Management tools for Microsoft 365 Apps

| Feature | Group Policy | Microsoft Intune | Windows Autopatch | Config Manager | Cloud Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TCO** | Medium | Medium | Low | High | **Low** |
| **Controls** | Lightweight | Lightweight | Lightweight | Extensive | **Enterprise Ready** |

### The benefits of Cloud Update
*   **27% more** apps updated at the end of the month.
*   **Less than 1%** install errors detected using automation.
*   **More than 6hrs** saved per week troubleshooting updates.
*   **Features:** Rich data insights, Automatic updates, Channel management, Custom waves, Update validation, Pause/Rollback, and Exclusion windows..`;