#!/bin/bash
# Run all Vite dev servers for each site in the background
# Usage: ./dev.sh

npm run dev:cv -- --open &
npm run dev:onepager -- --open &
npm run dev:start -- --open &
npm run dev:navbar -- --open &
npm run dev:mdsite -- --open &
npm run dev:data -- --open &

wait
