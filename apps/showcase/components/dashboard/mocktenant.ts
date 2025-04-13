export const mockTenant = {
    "username": "janedoe",
    "stateName": "Telangana",
    "assemblyName": "Hyderabad",
    "role": "local",
    "is_premium": true,
    "is_update_only": true,
    "is_public": false,
    "is_agent": false,
    "is_owner_db": false,
    "is_realtime": false,
    "tenant_supabase_url": "https://risbemjewosmlvzntjkd.supabase.co",
    "tenant_supabase_anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM",
    "constituencyInfo": {
        "state": "Telangana",
        "constituency": "Hyderabad",
        "type": "Local"
    },
    "related_channels": [
        {
            "username": "janedoe_1v1",
            "owner_username": "janedoe",
            "onboardingConfig": {
                "welcomescreen": {
                    "hero": "Welcome to Your Enterprise Workspace",
                    "ctaText": "Get Started",
                    "welcomeText": "Set up your workspace and start collaborating with your team.",
                    "welcomeImage": "https://placehold.co/300x300"
                },
                "screens": [
                    {
                        "name": "userDetails",
                        "slug": "personal-information",
                        "label": "Personal Information",
                        "description": "Please provide your detailed personal information for verification",
                        "form": {
                            "fields": [
                                {
                                    "name": "firstName",
                                    "type": "text",
                                    "label": "First Name",
                                    "required": true
                                },
                                {
                                    "name": "lastName",
                                    "type": "text",
                                    "label": "Last Name",
                                    "required": true
                                },
                                {
                                    "name": "dateOfBirth",
                                    "type": "date",
                                    "label": "Date of Birth",
                                    "required": true
                                },
                                {
                                    "name": "gender",
                                    "type": "select",
                                    "label": "Gender",
                                    "options": [
                                        "Male",
                                        "Female",
                                        "Non-binary",
                                        "Prefer not to say"
                                    ],
                                    "required": true
                                },
                                {
                                    "name": "primaryEmail",
                                    "type": "email",
                                    "label": "Primary Email",
                                    "required": true
                                },
                                {
                                    "name": "phoneNumber",
                                    "type": "tel",
                                    "label": "Primary Phone Number",
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "organizationBasics",
                        "slug": "org-basics",
                        "label": "Organization Basics",
                        "description": "Set up your organization's fundamental information",
                        "form": {
                            "fields": [
                                {
                                    "name": "orgName",
                                    "type": "text",
                                    "label": "Organization Name",
                                    "required": true
                                },
                                {
                                    "name": "legalName",
                                    "type": "text",
                                    "label": "Legal Business Name",
                                    "required": true
                                },
                                {
                                    "name": "taxId",
                                    "type": "text",
                                    "label": "Tax ID/EIN",
                                    "required": true
                                },
                                {
                                    "name": "orgType",
                                    "type": "select",
                                    "label": "Organization Type",
                                    "options": [
                                        "Corporation",
                                        "LLC",
                                        "Partnership",
                                        "Sole Proprietorship",
                                        "Non-Profit"
                                    ],
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "personalPreferences",
                        "slug": "hobbies-interests",
                        "label": "Hobbies & Interests",
                        "description": "Tell us about your interests and preferences",
                        "form": {
                            "fields": [
                                {
                                    "name": "professionalInterests",
                                    "type": "multiselect",
                                    "label": "Professional Interests",
                                    "options": [
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
                                    "required": true
                                },
                                {
                                    "name": "hobbies",
                                    "type": "multiselect",
                                    "label": "Personal Hobbies",
                                    "options": [
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
                                }
                            ]
                        }
                    }
                ],
                "finishscreen": {
                    "ctaUrl": "/dashboard",
                    "finishText": "Your workspace is ready! Let's get started.",
                    "finishImage": "https://placehold.co/300x300"
                }
            },
            "is_update_only": false,
            "is_premium": true,
            "is_public": false,
            "is_agent": true,
            "is_owner_db": true,
            "is_realtime": false,
            "tenant_supabase_url": "https://risbemjewosmlvzntjkd.supabase.co",
            "tenant_supabase_anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM"
        },
        {
            "username": "janedoe_barbers",
            "owner_username": "janedoe",
            "onboardingConfig": {
                "welcomescreen": {
                    "hero": "Welcome to Your Enterprise Workspace",
                    "ctaText": "Get Started",
                    "welcomeText": "Set up your workspace and start collaborating with your team.",
                    "welcomeImage": "https://placehold.co/300x300"
                },
                "screens": [
                    {
                        "name": "userDetails",
                        "slug": "personal-information",
                        "label": "Personal Information",
                        "description": "Please provide your detailed personal information for verification",
                        "form": {
                            "fields": [
                                {
                                    "name": "firstName",
                                    "type": "text",
                                    "label": "First Name",
                                    "required": true
                                },
                                {
                                    "name": "lastName",
                                    "type": "text",
                                    "label": "Last Name",
                                    "required": true
                                },
                                {
                                    "name": "dateOfBirth",
                                    "type": "date",
                                    "label": "Date of Birth",
                                    "required": true
                                },
                                {
                                    "name": "gender",
                                    "type": "select",
                                    "label": "Gender",
                                    "options": [
                                        "Male",
                                        "Female",
                                        "Non-binary",
                                        "Prefer not to say"
                                    ],
                                    "required": true
                                },
                                {
                                    "name": "primaryEmail",
                                    "type": "email",
                                    "label": "Primary Email",
                                    "required": true
                                },
                                {
                                    "name": "phoneNumber",
                                    "type": "tel",
                                    "label": "Primary Phone Number",
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "organizationBasics",
                        "slug": "org-basics",
                        "label": "Organization Basics",
                        "description": "Set up your organization's fundamental information",
                        "form": {
                            "fields": [
                                {
                                    "name": "orgName",
                                    "type": "text",
                                    "label": "Organization Name",
                                    "required": true
                                },
                                {
                                    "name": "legalName",
                                    "type": "text",
                                    "label": "Legal Business Name",
                                    "required": true
                                },
                                {
                                    "name": "taxId",
                                    "type": "text",
                                    "label": "Tax ID/EIN",
                                    "required": true
                                },
                                {
                                    "name": "orgType",
                                    "type": "select",
                                    "label": "Organization Type",
                                    "options": [
                                        "Corporation",
                                        "LLC",
                                        "Partnership",
                                        "Sole Proprietorship",
                                        "Non-Profit"
                                    ],
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "personalPreferences",
                        "slug": "hobbies-interests",
                        "label": "Hobbies & Interests",
                        "description": "Tell us about your interests and preferences",
                        "form": {
                            "fields": [
                                {
                                    "name": "professionalInterests",
                                    "type": "multiselect",
                                    "label": "Professional Interests",
                                    "options": [
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
                                    "required": true
                                },
                                {
                                    "name": "hobbies",
                                    "type": "multiselect",
                                    "label": "Personal Hobbies",
                                    "options": [
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
                                }
                            ]
                        }
                    }
                ],
                "finishscreen": {
                    "ctaUrl": "/dashboard",
                    "finishText": "Your workspace is ready! Let's get started.",
                    "finishImage": "https://placehold.co/300x300"
                }
            },
            "is_update_only": false,
            "is_premium": true,
            "is_public": false,
            "is_owner_db": true,
            "is_agent": false,
            "is_realtime": false,
            "tenant_supabase_url": "https://risbemjewosmlvzntjkd.supabase.co",
            "tenant_supabase_anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM"
        },
        {
            "username": "janedoe_dancers",
            "owner_username": "janedoe",
            "onboardingConfig": {
                "welcomescreen": {
                    "hero": "Welcome to Your Enterprise Workspace",
                    "ctaText": "Get Started",
                    "welcomeText": "Set up your workspace and start collaborating with your team.",
                    "welcomeImage": "https://placehold.co/300x300"
                },
                "screens": [
                    {
                        "name": "userDetails",
                        "slug": "personal-information",
                        "label": "Personal Information",
                        "description": "Please provide your detailed personal information for verification",
                        "form": {
                            "fields": [
                                {
                                    "name": "firstName",
                                    "type": "text",
                                    "label": "First Name",
                                    "required": true
                                },
                                {
                                    "name": "lastName",
                                    "type": "text",
                                    "label": "Last Name",
                                    "required": true
                                },
                                {
                                    "name": "dateOfBirth",
                                    "type": "date",
                                    "label": "Date of Birth",
                                    "required": true
                                },
                                {
                                    "name": "gender",
                                    "type": "select",
                                    "label": "Gender",
                                    "options": [
                                        "Male",
                                        "Female",
                                        "Non-binary",
                                        "Prefer not to say"
                                    ],
                                    "required": true
                                },
                                {
                                    "name": "primaryEmail",
                                    "type": "email",
                                    "label": "Primary Email",
                                    "required": true
                                },
                                {
                                    "name": "phoneNumber",
                                    "type": "tel",
                                    "label": "Primary Phone Number",
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "organizationBasics",
                        "slug": "org-basics",
                        "label": "Organization Basics",
                        "description": "Set up your organization's fundamental information",
                        "form": {
                            "fields": [
                                {
                                    "name": "orgName",
                                    "type": "text",
                                    "label": "Organization Name",
                                    "required": true
                                },
                                {
                                    "name": "legalName",
                                    "type": "text",
                                    "label": "Legal Business Name",
                                    "required": true
                                },
                                {
                                    "name": "taxId",
                                    "type": "text",
                                    "label": "Tax ID/EIN",
                                    "required": true
                                },
                                {
                                    "name": "orgType",
                                    "type": "select",
                                    "label": "Organization Type",
                                    "options": [
                                        "Corporation",
                                        "LLC",
                                        "Partnership",
                                        "Sole Proprietorship",
                                        "Non-Profit"
                                    ],
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "personalPreferences",
                        "slug": "hobbies-interests",
                        "label": "Hobbies & Interests",
                        "description": "Tell us about your interests and preferences",
                        "form": {
                            "fields": [
                                {
                                    "name": "professionalInterests",
                                    "type": "multiselect",
                                    "label": "Professional Interests",
                                    "options": [
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
                                    "required": true
                                },
                                {
                                    "name": "hobbies",
                                    "type": "multiselect",
                                    "label": "Personal Hobbies",
                                    "options": [
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
                                }
                            ]
                        }
                    }
                ],
                "finishscreen": {
                    "ctaUrl": "/dashboard",
                    "finishText": "Your workspace is ready! Let's get started.",
                    "finishImage": "https://placehold.co/300x300"
                }
            },
            "is_update_only": false,
            "is_premium": true,
            "is_public": false,
            "is_owner_db": true,
            "is_agent": false,
            "is_realtime": false,
            "tenant_supabase_url": "https://risbemjewosmlvzntjkd.supabase.co",
            "tenant_supabase_anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM"
        },
        {
            "username": "janedoe_employees",
            "owner_username": "janedoe",
            "onboardingConfig": {
                "welcomescreen": {
                    "hero": "Welcome to Your Enterprise Workspace",
                    "ctaText": "Get Started",
                    "welcomeText": "Set up your workspace and start collaborating with your team.",
                    "welcomeImage": "https://placehold.co/300x300"
                },
                "screens": [
                    {
                        "name": "userDetails",
                        "slug": "personal-information",
                        "label": "Personal Information",
                        "description": "Please provide your detailed personal information for verification",
                        "form": {
                            "fields": [
                                {
                                    "name": "firstName",
                                    "type": "text",
                                    "label": "First Name",
                                    "required": true
                                },
                                {
                                    "name": "lastName",
                                    "type": "text",
                                    "label": "Last Name",
                                    "required": true
                                },
                                {
                                    "name": "dateOfBirth",
                                    "type": "date",
                                    "label": "Date of Birth",
                                    "required": true
                                },
                                {
                                    "name": "gender",
                                    "type": "select",
                                    "label": "Gender",
                                    "options": [
                                        "Male",
                                        "Female",
                                        "Non-binary",
                                        "Prefer not to say"
                                    ],
                                    "required": true
                                },
                                {
                                    "name": "primaryEmail",
                                    "type": "email",
                                    "label": "Primary Email",
                                    "required": true
                                },
                                {
                                    "name": "phoneNumber",
                                    "type": "tel",
                                    "label": "Primary Phone Number",
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "organizationBasics",
                        "slug": "org-basics",
                        "label": "Organization Basics",
                        "description": "Set up your organization's fundamental information",
                        "form": {
                            "fields": [
                                {
                                    "name": "orgName",
                                    "type": "text",
                                    "label": "Organization Name",
                                    "required": true
                                },
                                {
                                    "name": "legalName",
                                    "type": "text",
                                    "label": "Legal Business Name",
                                    "required": true
                                },
                                {
                                    "name": "taxId",
                                    "type": "text",
                                    "label": "Tax ID/EIN",
                                    "required": true
                                },
                                {
                                    "name": "orgType",
                                    "type": "select",
                                    "label": "Organization Type",
                                    "options": [
                                        "Corporation",
                                        "LLC",
                                        "Partnership",
                                        "Sole Proprietorship",
                                        "Non-Profit"
                                    ],
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "personalPreferences",
                        "slug": "hobbies-interests",
                        "label": "Hobbies & Interests",
                        "description": "Tell us about your interests and preferences",
                        "form": {
                            "fields": [
                                {
                                    "name": "professionalInterests",
                                    "type": "multiselect",
                                    "label": "Professional Interests",
                                    "options": [
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
                                    "required": true
                                },
                                {
                                    "name": "hobbies",
                                    "type": "multiselect",
                                    "label": "Personal Hobbies",
                                    "options": [
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
                                }
                            ]
                        }
                    }
                ],
                "finishscreen": {
                    "ctaUrl": "/dashboard",
                    "finishText": "Your workspace is ready! Let's get started.",
                    "finishImage": "https://placehold.co/300x300"
                }
            },
            "is_update_only": true,
            "is_premium": true,
            "is_public": false,
            "is_owner_db": true,
            "is_agent": false,
            "is_realtime": false,
            "tenant_supabase_url": "https://risbemjewosmlvzntjkd.supabase.co",
            "tenant_supabase_anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM"
        },
        {
            "username": "janedoe_farmers",
            "owner_username": "janedoe",
            "onboardingConfig": {
                "welcomescreen": {
                    "hero": "Welcome to Your Enterprise Workspace",
                    "ctaText": "Get Started",
                    "welcomeText": "Set up your workspace and start collaborating with your team.",
                    "welcomeImage": "https://placehold.co/300x300"
                },
                "screens": [
                    {
                        "name": "userDetails",
                        "slug": "personal-information",
                        "label": "Personal Information",
                        "description": "Please provide your detailed personal information for verification",
                        "form": {
                            "fields": [
                                {
                                    "name": "firstName",
                                    "type": "text",
                                    "label": "First Name",
                                    "required": true
                                },
                                {
                                    "name": "lastName",
                                    "type": "text",
                                    "label": "Last Name",
                                    "required": true
                                },
                                {
                                    "name": "dateOfBirth",
                                    "type": "date",
                                    "label": "Date of Birth",
                                    "required": true
                                },
                                {
                                    "name": "gender",
                                    "type": "select",
                                    "label": "Gender",
                                    "options": [
                                        "Male",
                                        "Female",
                                        "Non-binary",
                                        "Prefer not to say"
                                    ],
                                    "required": true
                                },
                                {
                                    "name": "primaryEmail",
                                    "type": "email",
                                    "label": "Primary Email",
                                    "required": true
                                },
                                {
                                    "name": "phoneNumber",
                                    "type": "tel",
                                    "label": "Primary Phone Number",
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "organizationBasics",
                        "slug": "org-basics",
                        "label": "Organization Basics",
                        "description": "Set up your organization's fundamental information",
                        "form": {
                            "fields": [
                                {
                                    "name": "orgName",
                                    "type": "text",
                                    "label": "Organization Name",
                                    "required": true
                                },
                                {
                                    "name": "legalName",
                                    "type": "text",
                                    "label": "Legal Business Name",
                                    "required": true
                                },
                                {
                                    "name": "taxId",
                                    "type": "text",
                                    "label": "Tax ID/EIN",
                                    "required": true
                                },
                                {
                                    "name": "orgType",
                                    "type": "select",
                                    "label": "Organization Type",
                                    "options": [
                                        "Corporation",
                                        "LLC",
                                        "Partnership",
                                        "Sole Proprietorship",
                                        "Non-Profit"
                                    ],
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "personalPreferences",
                        "slug": "hobbies-interests",
                        "label": "Hobbies & Interests",
                        "description": "Tell us about your interests and preferences",
                        "form": {
                            "fields": [
                                {
                                    "name": "professionalInterests",
                                    "type": "multiselect",
                                    "label": "Professional Interests",
                                    "options": [
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
                                    "required": true
                                },
                                {
                                    "name": "hobbies",
                                    "type": "multiselect",
                                    "label": "Personal Hobbies",
                                    "options": [
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
                                }
                            ]
                        }
                    }
                ],
                "finishscreen": {
                    "ctaUrl": "/dashboard",
                    "finishText": "Your workspace is ready! Let's get started.",
                    "finishImage": "https://placehold.co/300x300"
                }
            },
            "is_update_only": true,
            "is_premium": true,
            "is_public": true,
            "is_owner_db": true,
            "is_agent": false,
            "is_realtime": false,
            "tenant_supabase_url": "https://risbemjewosmlvzntjkd.supabase.co",
            "tenant_supabase_anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM"
        },
        {
            "username": "janedoe_help",
            "owner_username": "janedoe",
            "onboardingConfig": {
                "welcomescreen": {
                    "hero": "Welcome to Your Enterprise Workspace",
                    "ctaText": "Get Started",
                    "welcomeText": "Set up your workspace and start collaborating with your team.",
                    "welcomeImage": "https://placehold.co/300x300"
                },
                "screens": [
                    {
                        "name": "userDetails",
                        "slug": "personal-information",
                        "label": "Personal Information",
                        "description": "Please provide your detailed personal information for verification",
                        "form": {
                            "fields": [
                                {
                                    "name": "firstName",
                                    "type": "text",
                                    "label": "First Name",
                                    "required": true
                                },
                                {
                                    "name": "lastName",
                                    "type": "text",
                                    "label": "Last Name",
                                    "required": true
                                },
                                {
                                    "name": "dateOfBirth",
                                    "type": "date",
                                    "label": "Date of Birth",
                                    "required": true
                                },
                                {
                                    "name": "gender",
                                    "type": "select",
                                    "label": "Gender",
                                    "options": [
                                        "Male",
                                        "Female",
                                        "Non-binary",
                                        "Prefer not to say"
                                    ],
                                    "required": true
                                },
                                {
                                    "name": "primaryEmail",
                                    "type": "email",
                                    "label": "Primary Email",
                                    "required": true
                                },
                                {
                                    "name": "phoneNumber",
                                    "type": "tel",
                                    "label": "Primary Phone Number",
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "organizationBasics",
                        "slug": "org-basics",
                        "label": "Organization Basics",
                        "description": "Set up your organization's fundamental information",
                        "form": {
                            "fields": [
                                {
                                    "name": "orgName",
                                    "type": "text",
                                    "label": "Organization Name",
                                    "required": true
                                },
                                {
                                    "name": "legalName",
                                    "type": "text",
                                    "label": "Legal Business Name",
                                    "required": true
                                },
                                {
                                    "name": "taxId",
                                    "type": "text",
                                    "label": "Tax ID/EIN",
                                    "required": true
                                },
                                {
                                    "name": "orgType",
                                    "type": "select",
                                    "label": "Organization Type",
                                    "options": [
                                        "Corporation",
                                        "LLC",
                                        "Partnership",
                                        "Sole Proprietorship",
                                        "Non-Profit"
                                    ],
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "personalPreferences",
                        "slug": "hobbies-interests",
                        "label": "Hobbies & Interests",
                        "description": "Tell us about your interests and preferences",
                        "form": {
                            "fields": [
                                {
                                    "name": "professionalInterests",
                                    "type": "multiselect",
                                    "label": "Professional Interests",
                                    "options": [
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
                                    "required": true
                                },
                                {
                                    "name": "hobbies",
                                    "type": "multiselect",
                                    "label": "Personal Hobbies",
                                    "options": [
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
                                }
                            ]
                        }
                    }
                ],
                "finishscreen": {
                    "ctaUrl": "/dashboard",
                    "finishText": "Your workspace is ready! Let's get started.",
                    "finishImage": "https://placehold.co/300x300"
                }
            },
            "is_update_only": false,
            "is_premium": true,
            "is_public": false,
            "is_agent": false,
            "is_owner_db": true,
            "is_realtime": false,
            "tenant_supabase_url": "https://risbemjewosmlvzntjkd.supabase.co",
            "tenant_supabase_anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM"
        },
        {
            "username": "janedoe_superfans",
            "owner_username": "janedoe",
            "is_update_only": true,
            "is_premium": true,
            "is_public": false,
            "is_owner_db": true,
            "is_agent": false,
            "is_realtime": false,
            "tenant_supabase_url": "https://risbemjewosmlvzntjkd.supabase.co",
            "tenant_supabase_anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM"
        },
        {
            "username": "janedoe_weather",
            "owner_username": "janedoe",
            "onboardingConfig": {
                "welcomescreen": {
                    "hero": "Welcome to Your Enterprise Workspace",
                    "ctaText": "Get Started",
                    "welcomeText": "Set up your workspace and start collaborating with your team.",
                    "welcomeImage": "https://placehold.co/300x300"
                },
                "screens": [
                    {
                        "name": "userDetails",
                        "slug": "personal-information",
                        "label": "Personal Information",
                        "description": "Please provide your detailed personal information for verification",
                        "form": {
                            "fields": [
                                {
                                    "name": "firstName",
                                    "type": "text",
                                    "label": "First Name",
                                    "required": true
                                },
                                {
                                    "name": "lastName",
                                    "type": "text",
                                    "label": "Last Name",
                                    "required": true
                                },
                                {
                                    "name": "dateOfBirth",
                                    "type": "date",
                                    "label": "Date of Birth",
                                    "required": true
                                },
                                {
                                    "name": "gender",
                                    "type": "select",
                                    "label": "Gender",
                                    "options": [
                                        "Male",
                                        "Female",
                                        "Non-binary",
                                        "Prefer not to say"
                                    ],
                                    "required": true
                                },
                                {
                                    "name": "primaryEmail",
                                    "type": "email",
                                    "label": "Primary Email",
                                    "required": true
                                },
                                {
                                    "name": "phoneNumber",
                                    "type": "tel",
                                    "label": "Primary Phone Number",
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "organizationBasics",
                        "slug": "org-basics",
                        "label": "Organization Basics",
                        "description": "Set up your organization's fundamental information",
                        "form": {
                            "fields": [
                                {
                                    "name": "orgName",
                                    "type": "text",
                                    "label": "Organization Name",
                                    "required": true
                                },
                                {
                                    "name": "legalName",
                                    "type": "text",
                                    "label": "Legal Business Name",
                                    "required": true
                                },
                                {
                                    "name": "taxId",
                                    "type": "text",
                                    "label": "Tax ID/EIN",
                                    "required": true
                                },
                                {
                                    "name": "orgType",
                                    "type": "select",
                                    "label": "Organization Type",
                                    "options": [
                                        "Corporation",
                                        "LLC",
                                        "Partnership",
                                        "Sole Proprietorship",
                                        "Non-Profit"
                                    ],
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "personalPreferences",
                        "slug": "hobbies-interests",
                        "label": "Hobbies & Interests",
                        "description": "Tell us about your interests and preferences",
                        "form": {
                            "fields": [
                                {
                                    "name": "professionalInterests",
                                    "type": "multiselect",
                                    "label": "Professional Interests",
                                    "options": [
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
                                    "required": true
                                },
                                {
                                    "name": "hobbies",
                                    "type": "multiselect",
                                    "label": "Personal Hobbies",
                                    "options": [
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
                                }
                            ]
                        }
                    }
                ],
                "finishscreen": {
                    "ctaUrl": "/dashboard",
                    "finishText": "Your workspace is ready! Let's get started.",
                    "finishImage": "https://placehold.co/300x300"
                }
            },
            "is_update_only": true,
            "is_premium": true,
            "is_public": true,
            "is_owner_db": true,
            "is_agent": false,
            "is_realtime": false,
            "tenant_supabase_url": "https://risbemjewosmlvzntjkd.supabase.co",
            "tenant_supabase_anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM"
        },
        {
            "username": "janedoe_yoga",
            "owner_username": "janedoe",
            "onboardingConfig": {
                "welcomescreen": {
                    "hero": "Welcome to Your Enterprise Workspace",
                    "ctaText": "Get Started",
                    "welcomeText": "Set up your workspace and start collaborating with your team.",
                    "welcomeImage": "https://placehold.co/300x300"
                },
                "screens": [
                    {
                        "name": "userDetails",
                        "slug": "personal-information",
                        "label": "Personal Information",
                        "description": "Please provide your detailed personal information for verification",
                        "form": {
                            "fields": [
                                {
                                    "name": "firstName",
                                    "type": "text",
                                    "label": "First Name",
                                    "required": true
                                },
                                {
                                    "name": "lastName",
                                    "type": "text",
                                    "label": "Last Name",
                                    "required": true
                                },
                                {
                                    "name": "dateOfBirth",
                                    "type": "date",
                                    "label": "Date of Birth",
                                    "required": true
                                },
                                {
                                    "name": "gender",
                                    "type": "select",
                                    "label": "Gender",
                                    "options": [
                                        "Male",
                                        "Female",
                                        "Non-binary",
                                        "Prefer not to say"
                                    ],
                                    "required": true
                                },
                                {
                                    "name": "primaryEmail",
                                    "type": "email",
                                    "label": "Primary Email",
                                    "required": true
                                },
                                {
                                    "name": "phoneNumber",
                                    "type": "tel",
                                    "label": "Primary Phone Number",
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "organizationBasics",
                        "slug": "org-basics",
                        "label": "Organization Basics",
                        "description": "Set up your organization's fundamental information",
                        "form": {
                            "fields": [
                                {
                                    "name": "orgName",
                                    "type": "text",
                                    "label": "Organization Name",
                                    "required": true
                                },
                                {
                                    "name": "legalName",
                                    "type": "text",
                                    "label": "Legal Business Name",
                                    "required": true
                                },
                                {
                                    "name": "taxId",
                                    "type": "text",
                                    "label": "Tax ID/EIN",
                                    "required": true
                                },
                                {
                                    "name": "orgType",
                                    "type": "select",
                                    "label": "Organization Type",
                                    "options": [
                                        "Corporation",
                                        "LLC",
                                        "Partnership",
                                        "Sole Proprietorship",
                                        "Non-Profit"
                                    ],
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "personalPreferences",
                        "slug": "hobbies-interests",
                        "label": "Hobbies & Interests",
                        "description": "Tell us about your interests and preferences",
                        "form": {
                            "fields": [
                                {
                                    "name": "professionalInterests",
                                    "type": "multiselect",
                                    "label": "Professional Interests",
                                    "options": [
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
                                    "required": true
                                },
                                {
                                    "name": "hobbies",
                                    "type": "multiselect",
                                    "label": "Personal Hobbies",
                                    "options": [
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
                                }
                            ]
                        }
                    }
                ],
                "finishscreen": {
                    "ctaUrl": "/dashboard",
                    "finishText": "Your workspace is ready! Let's get started.",
                    "finishImage": "https://placehold.co/300x300"
                }
            },
            "is_update_only": false,
            "is_premium": true,
            "is_public": false,
            "is_owner_db": true,
            "is_agent": false,
            "is_realtime": false,
            "tenant_supabase_url": "https://risbemjewosmlvzntjkd.supabase.co",
            "tenant_supabase_anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM"
        },
        {
            "username": "janedoe_youth",
            "owner_username": "janedoe",
            "onboardingConfig": {
                "welcomescreen": {
                    "hero": "Welcome to Your Enterprise Workspace",
                    "ctaText": "Get Started",
                    "welcomeText": "Set up your workspace and start collaborating with your team.",
                    "welcomeImage": "https://placehold.co/300x300"
                },
                "screens": [
                    {
                        "name": "userDetails",
                        "slug": "personal-information",
                        "label": "Personal Information",
                        "description": "Please provide your detailed personal information for verification",
                        "form": {
                            "fields": [
                                {
                                    "name": "firstName",
                                    "type": "text",
                                    "label": "First Name",
                                    "required": true
                                },
                                {
                                    "name": "lastName",
                                    "type": "text",
                                    "label": "Last Name",
                                    "required": true
                                },
                                {
                                    "name": "dateOfBirth",
                                    "type": "date",
                                    "label": "Date of Birth",
                                    "required": true
                                },
                                {
                                    "name": "gender",
                                    "type": "select",
                                    "label": "Gender",
                                    "options": [
                                        "Male",
                                        "Female",
                                        "Non-binary",
                                        "Prefer not to say"
                                    ],
                                    "required": true
                                },
                                {
                                    "name": "primaryEmail",
                                    "type": "email",
                                    "label": "Primary Email",
                                    "required": true
                                },
                                {
                                    "name": "phoneNumber",
                                    "type": "tel",
                                    "label": "Primary Phone Number",
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "organizationBasics",
                        "slug": "org-basics",
                        "label": "Organization Basics",
                        "description": "Set up your organization's fundamental information",
                        "form": {
                            "fields": [
                                {
                                    "name": "orgName",
                                    "type": "text",
                                    "label": "Organization Name",
                                    "required": true
                                },
                                {
                                    "name": "legalName",
                                    "type": "text",
                                    "label": "Legal Business Name",
                                    "required": true
                                },
                                {
                                    "name": "taxId",
                                    "type": "text",
                                    "label": "Tax ID/EIN",
                                    "required": true
                                },
                                {
                                    "name": "orgType",
                                    "type": "select",
                                    "label": "Organization Type",
                                    "options": [
                                        "Corporation",
                                        "LLC",
                                        "Partnership",
                                        "Sole Proprietorship",
                                        "Non-Profit"
                                    ],
                                    "required": true
                                }
                            ]
                        }
                    },
                    {
                        "name": "personalPreferences",
                        "slug": "hobbies-interests",
                        "label": "Hobbies & Interests",
                        "description": "Tell us about your interests and preferences",
                        "form": {
                            "fields": [
                                {
                                    "name": "professionalInterests",
                                    "type": "multiselect",
                                    "label": "Professional Interests",
                                    "options": [
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
                                    "required": true
                                },
                                {
                                    "name": "hobbies",
                                    "type": "multiselect",
                                    "label": "Personal Hobbies",
                                    "options": [
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
                                }
                            ]
                        }
                    }
                ],
                "finishscreen": {
                    "ctaUrl": "/dashboard",
                    "finishText": "Your workspace is ready! Let's get started.",
                    "finishImage": "https://placehold.co/300x300"
                }
            },
            "is_update_only": false,
            "is_premium": true,
            "is_public": false,
            "is_owner_db": true,
            "is_agent": false,
            "is_realtime": false,
            "tenant_supabase_url": "https://risbemjewosmlvzntjkd.supabase.co",
            "tenant_supabase_anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM"
        }
    ],
    "related_channels_count": 10,
    "products": [],
    "products_count": 0,
    "custom_properties": {
        "donation_enabled": true,
        "donors_config": {
            "name": "Janedoe",
            "logo": "https://placehold.co/150",
            "description": "Donate to Janedoe",
            "upi": "donor@upi",
            "email": "donor@janedoe.com"
        },
        "super_admins": [
            "monkwhosoldpen@gmail.com",
            "superadmin@janedoe.com"
        ],
        "admin_dashboard": {
            "chats_groups_config": {
                "broadcast_groups": true,
                "direct_chats": true,
                "bot_only_groups": true,
                "ai_agent_groups": true,
                "support_groups": true,
                "private_groups": true
            },
            "messages_config": {
                "basic_text_messages": true,
                "long_text_messages": true,
                "video_messages": true,
                "audio_messages": true,
                "document_messages": true,
                "links_messages": true,
                "image_messages": true,
                "store_messages": true,
                "share_messages": true,
                "surveys": true,
                "polls": true,
                "quizzes": true,
                "events": true
            },
            "features": {
                "USER_MANAGEMENT": true,
                "BASIC_CHAT": true,
                "SUPER_FANS_CHAT": true,
                "ENHANCED_CHAT": true,
                "AI_DASHBOARD": true
            }
        },
        "store_products": [
            {
                "product_id": "product_1",
                "product_description": "Product 1 description",
                "mrp": 100,
                "selling_price": 80,
                "image_url": "https://placehold.co/150"
            }
        ],
        "store_services": [
            {
                "service_id": "service_1",
                "service_description": "Service 1 description",
                "price": 100
            }
        ]
    }
}