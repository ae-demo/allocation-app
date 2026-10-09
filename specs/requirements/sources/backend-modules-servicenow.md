# backend/modules/servicenow

- client.bal:9-10: configurable key names serviceNowUrl and oauthConfig (tokenUrl, clientId, clientSecret); no section for them in the checked-in local config → not used: how it is built
- client.bal:12 (serviceNowClient): ServiceNow's "find consultants by skills" REST API, OAuth2 client credentials, the current register of consultant skills → product-wide.md (Decisions, skills register), F4 (open question 4)
- client.bal:16-29: HTTP/1.1, keep-alive never, 300 s timeout, three retries at 5 s on 500/408/502/503/504 → not used: how it is built
- servicenow.bal:11 (getSkills): reads the skill catalogue, each skill an id and a name, behind `get skills` → F4.8
- servicenow.bal:19 (searchConsultants): finds consultants matching skill ids for an engagement id, returning name, email and skills, behind `post consultants/search` → F4.8, F4 (open question 1)
- types.bal:12-19: `Oauth2Config` with tokenUrl, clientId, clientSecret → not used: how it is built
- types.bal:22-27: `Skill`, a ServiceNow skill with its id and name → F4.8
- types.bal:30-33, 48-57: `SkillResponse`, `ConsultantDetail`, `ConsultantResponse` response envelopes → not used: how it is built
- types.bal:36-45: `Consultant`, a ServiceNow consultant with name, email and skills by name → F4.8
- types.bal:60-66: each skill id is validated against a pattern that accepts any single-line text → not used: how it is built
- types.bal:69-74: `ConsultantSearchPayload`, an engagement id and the skill ids to match → F4.8, F4 (open question 1)