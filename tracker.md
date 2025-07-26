npm init -y - file initialization
install dependencies.
middleware - auth.js
create routes - jobs.js, companies.js, users.js, applications.js

db relations - 
  = Users ↔ Companies (1:1 for employers)
  = Companies → Jobs (1:N)
  = Jobs ↔ Applications (1:N)
  = Users ↔ Applications (1:N)
  = Users ↔ Saved Jobs (M:N)

Switched to tailwind - not giving

Back to bootstrap