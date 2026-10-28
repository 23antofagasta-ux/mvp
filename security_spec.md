# Security Specification: My Virtual Pet Classroom Gamification

## 1. Data Invariants
- Teachers have administrative authority over student management, rewards, deductions, pet desires, species definitions, and mini-game locks.
- Student accounts (`/students/{studentId}`) can read their own profile and other students' public rank/stars for the leaderboard, but can only mutate their own inventory, needs, sleeping status, and pet nickname. Direct arbitrary star/XP inflation is strictly forbidden.
- Audit logs (`/auditLogs/{logId}`) are append-only audit records of star modifications; retroactive deletion or client-side tampering is blocked.
- Species catalog (`/species/{speciesId}`), Shop Items (`/shopItems/{itemId}`), Pet Needs (`/petNeeds/{needId}`), Rewards (`/rewards/{rewardId}`), and Deductions (`/deductions/{deductionId}`) can be read publicly by students, but can only be modified by authenticated teachers / admins.
- System configurations (`/system/minigameConfig`) can be read by all participants to adhere to lock rules, but can only be written by teachers / admins.

## 2. The "Dirty Dozen" Payloads
1. **Student Self-Awarding 9999 Stars**: An unauthenticated or student request directly modifying `stars: 9999` on `/students/{studentId}`.
2. **Ghost Field Injection in Student**: An update payload injecting arbitrary shadow properties `isAdmin: true` into `/students/{studentId}`.
3. **ID Poisoning Attack**: An injection of a 2KB string as `studentId` or `logId` attempting denial-of-wallet.
4. **Forged Audit Log Tampering**: A client sending an `auditLog` with negative or spoofed timestamps to fake a teacher's action.
5. **Deleting Teacher Account**: An unauthenticated user attempting `delete` on `/teachers/{teacherId}`.
6. **Student Modifying Shop Price**: A student attempting to update `/shopItems/{itemId}` to price: 0.
7. **Bypassing MiniGame Lock**: A student attempting to overwrite `/system/minigameConfig` with `isAllLocked: false`.
8. **Student Tampering with Pet Needs XP Reward**: A student writing `rewardXp: 50000` to `/petNeeds/{needId}`.
9. **Tampering with Species Catalog**: Injecting malicious script strings into `/species/{speciesId}` description or stages.
10. **Mutating Audit Log**: Attempting an `update` on an existing `/auditLogs/{logId}` document to hide disciplinary deductions.
11. **Student Arbitrary Level Up**: A student client bypassing evolution stages and directly setting `level: 10`, `evolutionStage: 3`.
12. **Student Overwriting Other Student's Account**: A student with one ID modifying the inventory or nickname of another student's ID.

## 3. Test Runner
All payloads in the test suite verify that unauthorized state transitions return `PERMISSION_DENIED`.
