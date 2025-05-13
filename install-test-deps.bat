@echo off
echo Installing testing dependencies...
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom ts-jest @types/jest msw
echo Done!
