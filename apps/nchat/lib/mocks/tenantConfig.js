export const defaultTenantConfig = {
    onboarding_config: {
        welcomescreen: {
            hero: "Welcome to Your Enterprise Workspace",
            ctaText: "Get Started",
            welcomeText: "Set up your workspace and start collaborating with your team.",
            welcomeImage: "https://storage.googleapis.com/goat-assets/enterprise-welcome.jpg"
        },
        screens: [
            {
                name: "userDetails",
                label: "Personal Information",
                slug: "personal-information",
                description: "Please provide your detailed personal information for verification",
                form: {
                    fields: [
                        // Basic Information
                        { type: "text", name: "firstName", label: "First Name", required: true },
                        { type: "text", name: "lastName", label: "Last Name", required: true },
                        { type: "date", name: "dateOfBirth", label: "Date of Birth", required: true },
                        { type: "select", name: "gender", label: "Gender", options: ["Male", "Female", "Non-binary", "Prefer not to say"], required: true },
                        
                        // Contact Information
                        { type: "email", name: "primaryEmail", label: "Primary Email", required: true },
                        { type: "email", name: "secondaryEmail", label: "Secondary Email" },
                        { type: "tel", name: "phoneNumber", label: "Primary Phone Number", required: true },
                        { type: "tel", name: "whatsappNumber", label: "WhatsApp Number" },
                        { type: "text", name: "telegramHandle", label: "Telegram Username" },
                        
                        // Address Information
                        { type: "text", name: "streetAddress", label: "Street Address", required: true },
                        { type: "text", name: "apartment", label: "Apartment/Suite/Unit" },
                        { type: "text", name: "city", label: "City", required: true },
                        { type: "text", name: "state", label: "State/Province", required: true },
                        { type: "text", name: "postalCode", label: "Postal Code", required: true },
                        { type: "select", name: "country", label: "Country", required: true, options: ["United States", "Canada", "United Kingdom", "Australia", "India", "Other"] },
                        
                        // Professional Information
                        { type: "text", name: "occupation", label: "Current Occupation", required: true },
                        { type: "text", name: "employer", label: "Current Employer" },
                        { type: "number", name: "yearsOfExperience", label: "Years of Professional Experience", required: true },
                        { type: "select", name: "employmentStatus", label: "Employment Status", options: ["Full-time", "Part-time", "Self-employed", "Student", "Retired", "Other"], required: true },
                        
                        // Financial Information
                        { type: "select", name: "incomeRange", label: "Annual Income Range", 
                            options: [
                                "Under $30,000",
                                "$30,000 - $50,000",
                                "$50,001 - $75,000",
                                "$75,001 - $100,000",
                                "$100,001 - $150,000",
                                "Over $150,000"
                            ],
                            required: true 
                        },
                        { type: "select", name: "investmentExperience", label: "Investment Experience", 
                            options: ["None", "Beginner", "Intermediate", "Advanced", "Expert"],
                            required: true 
                        },
                        
                        // Identity Verification
                        { 
                            type: "select", 
                            name: "idType", 
                            label: "Primary ID Type",
                            options: ["Passport", "Driver's License", "National ID", "Other Government ID"],
                            required: true 
                        },
                        { type: "file", name: "idFront", label: "ID Front Side", required: true, accept: "image/*" },
                        { type: "file", name: "idBack", label: "ID Back Side", required: true, accept: "image/*" },
                        
                        // Address Proof
                        { 
                            type: "select", 
                            name: "addressProofType", 
                            label: "Address Proof Type",
                            options: ["Utility Bill", "Bank Statement", "Lease Agreement", "Government Letter"],
                            required: true 
                        },
                        { type: "file", name: "addressProof", label: "Address Proof Document", required: true, accept: "image/*, application/pdf" },
                        
                        // Additional Information
                        { type: "textarea", name: "additionalInfo", label: "Additional Information", placeholder: "Please provide any additional information that might be relevant..." },
                        { type: "boolean", name: "termsAccepted", label: "I accept the terms and conditions", required: true },
                        { type: "boolean", name: "dataConsent", label: "I consent to the processing of my personal data", required: true }
                    ]
                }
            },
            {
                name: "organizationBasics",
                label: "Organization Basics",
                slug: "org-basics",
                description: "Set up your organization's fundamental information",
                form: {
                    fields: [
                        { type: "text", name: "orgName", label: "Organization Name", required: true },
                        { type: "text", name: "legalName", label: "Legal Business Name", required: true },
                        { type: "text", name: "taxId", label: "Tax ID/EIN", required: true },
                        { type: "select", name: "orgType", label: "Organization Type", 
                          options: ["Corporation", "LLC", "Partnership", "Sole Proprietorship", "Non-Profit"], required: true },
                        { type: "text", name: "website", label: "Company Website" },
                        { type: "textarea", name: "description", label: "Organization Description", 
                          placeholder: "Brief description of your organization..." }
                    ]
                }
            },
            {
                name: "organizationDetails",
                label: "Organization Profile",
                slug: "org-profile",
                description: "Provide detailed information about your organization",
                form: {
                    fields: [
                        { type: "select", name: "industry", label: "Primary Industry", 
                          options: ["Technology", "Healthcare", "Finance", "Education", "Manufacturing", "Retail", "Other"], required: true },
                        { type: "multiselect", name: "subIndustries", label: "Sub-Industries",
                          options: ["SaaS", "AI/ML", "E-commerce", "Consulting", "Digital Marketing", "IoT"] },
                        { type: "number", name: "employeeCount", label: "Number of Employees", required: true },
                        { type: "select", name: "companySize", label: "Company Size",
                          options: ["Startup (1-10)", "Small (11-50)", "Medium (51-200)", "Large (201-1000)", "Enterprise (1000+)"] },
                        { type: "text", name: "headquarters", label: "Headquarters Location", required: true },
                        { type: "multiselect", name: "operatingCountries", label: "Operating Countries" }
                    ]
                }
            },
            {
                name: "securityBasics",
                label: "Basic Security",
                slug: "security-basics",
                description: "Configure essential security settings",
                form: {
                    fields: [
                        { type: "select", name: "mfaPolicy", label: "MFA Policy", options: ["optional", "required"], required: true },
                        { type: "select", name: "passwordPolicy", label: "Password Policy",
                          options: ["Standard", "Strong", "Very Strong"], required: true },
                        { type: "select", name: "sessionTimeout", label: "Session Timeout", 
                          options: ["15m", "30m", "1h", "4h", "8h", "24h"], required: true },
                        { type: "boolean", name: "forcePasswordChange", label: "Force Password Change on First Login" }
                    ]
                }
            },
            {
                name: "securityAdvanced",
                label: "Advanced Security",
                slug: "security-advanced",
                description: "Set up advanced security controls",
                form: {
                    fields: [
                        { type: "boolean", name: "ipRestriction", label: "Enable IP Restriction" },
                        { type: "text", name: "allowedIPs", label: "Allowed IP Addresses", conditional: "ipRestriction" },
                        { type: "select", name: "loginAttempts", label: "Max Login Attempts",
                          options: ["3", "5", "10"], required: true },
                        { type: "boolean", name: "auditLogging", label: "Enable Audit Logging" },
                        { type: "multiselect", name: "auditEvents", label: "Events to Audit",
                          options: ["Login", "Logout", "Data Access", "Settings Change", "User Management"],
                          conditional: "auditLogging" }
                    ]
                }
            },
            {
                name: "communicationSetup",
                label: "Communication Settings",
                slug: "communication-settings",
                description: "Configure your communication preferences",
                form: {
                    fields: [
                        { type: "boolean", name: "slackIntegration", label: "Enable Slack Integration" },
                        { type: "text", name: "slackWebhook", label: "Slack Webhook URL", conditional: "slackIntegration" },
                        { type: "boolean", name: "teamsIntegration", label: "Enable MS Teams Integration" },
                        { type: "text", name: "teamsWebhook", label: "Teams Webhook URL", conditional: "teamsIntegration" },
                        { type: "select", name: "notificationPriority", label: "Default Notification Priority",
                          options: ["Low", "Medium", "High", "Critical"] }
                    ]
                }
            },
            {
                name: "workflowIntegrations",
                label: "Workflow Integrations",
                slug: "workflow-integrations",
                description: "Set up your workflow and productivity tools",
                form: {
                    fields: [
                        { type: "boolean", name: "jiraIntegration", label: "Enable Jira Integration" },
                        { type: "text", name: "jiraApiKey", label: "Jira API Key", conditional: "jiraIntegration" },
                        { type: "text", name: "jiraDomain", label: "Jira Domain", conditional: "jiraIntegration" },
                        { type: "boolean", name: "githubIntegration", label: "Enable GitHub Integration" },
                        { type: "text", name: "githubToken", label: "GitHub Access Token", conditional: "githubIntegration" },
                        { type: "boolean", name: "gitlabIntegration", label: "Enable GitLab Integration" },
                        { type: "text", name: "gitlabToken", label: "GitLab Access Token", conditional: "gitlabIntegration" }
                    ]
                }
            },
            {
                name: "analyticsIntegrations",
                label: "Analytics & Monitoring",
                slug: "analytics-monitoring",
                description: "Configure your analytics and monitoring tools",
                form: {
                    fields: [
                        { type: "boolean", name: "googleAnalytics", label: "Enable Google Analytics" },
                        { type: "text", name: "gaTrackingId", label: "GA Tracking ID", conditional: "googleAnalytics" },
                        { type: "boolean", name: "mixpanel", label: "Enable Mixpanel" },
                        { type: "text", name: "mixpanelToken", label: "Mixpanel Token", conditional: "mixpanel" },
                        { type: "boolean", name: "sentry", label: "Enable Sentry Error Tracking" },
                        { type: "text", name: "sentryDsn", label: "Sentry DSN", conditional: "sentry" }
                    ]
                }
            },
            {
                name: "personalPreferences",
                label: "Hobbies & Interests",
                slug: "hobbies-interests",
                description: "Tell us about your interests and preferences",
                form: {
                    fields: [
                        { 
                            type: "multiselect", 
                            name: "professionalInterests", 
                            label: "Professional Interests",
                            options: [
                                "Artificial Intelligence",
                                "Blockchain",
                                "Cloud Computing",
                                "Cybersecurity",
                                "Data Science",
                                "DevOps",
                                "Machine Learning",
                                "Mobile Development",
                                "Web Development",
                                "UX/UI Design"
                            ],
                            required: true
                        },
                        {
                            type: "multiselect",
                            name: "hobbies",
                            label: "Personal Hobbies",
                            options: [
                                "Reading",
                                "Writing",
                                "Gaming",
                                "Sports",
                                "Music",
                                "Art",
                                "Photography",
                                "Travel",
                                "Cooking",
                                "Fitness"
                            ]
                        },
                        {
                            type: "textarea",
                            name: "additionalInterests",
                            label: "Tell us more about your interests",
                            placeholder: "Share any other interests or hobbies not listed above..."
                        },
                        {
                            type: "select",
                            name: "preferredLearningStyle",
                            label: "Preferred Learning Style",
                            options: [
                                "Visual",
                                "Auditory",
                                "Reading/Writing",
                                "Kinesthetic"
                            ],
                            required: true
                        }
                    ]
                }
            }
        ],
        finishscreen: {
            finishRPC: "request_tenant_channel_access",
            finishText: "Your workspace is ready! Let's get started.",
            finishImage: "https://storage.googleapis.com/goat-assets/setup-complete.jpg"
        }
    },
    metadata: {
        theme: {
            primary_color: "#2563eb",
            secondary_color: "#4f46e5",
            accent_color: "#06b6d4"
        },
        features: {
            ai_assistant: true,
            advanced_analytics: true,
            custom_workflows: true,
            audit_logs: true
        },
        limits: {
            max_users: 100,
            storage_gb: 1000,
            api_rate_limit: 10000
        },
        compliance: {
            gdpr_enabled: true,
            hipaa_enabled: false,
            data_retention_days: 90
        }
    }
};
