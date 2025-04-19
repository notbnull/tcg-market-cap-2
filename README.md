# Seed database

/seed

# fuck mongo

Ah yes! 😅 The classic MongoDB Atlas IP whitelist issue. This is such a common gotcha because:
It works perfectly in local development (since your IP is whitelisted)
The error message was probably hidden/buffered before we disabled bufferCommands
Vercel serverless functions run from different IP ranges that need to be whitelisted
The solution is to add 0.0.0.0/0 to the IP whitelist in MongoDB Atlas to allow connections from anywhere, or specifically whitelist Vercel's IP ranges.
This is why it's so important to have good error logging - the real issue was hidden behind timeouts until we got the actual error message! At least now you can add this to your deployment checklist:
[ ] MongoDB Atlas IP whitelist configuration
[ ] Role-based authentication
[ ] Connection string verification
[ ] Buffer command settings
12 hours debugging... but hey, at least it wasn't a semicolon issue!
